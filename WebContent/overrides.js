
function iconEnter(icon, name){
	icon.src = `images/${name}.hover.png`;
}

function iconLeave(icon, name){
	icon.src = `images/${name}.rest.png`;
}

function resizing(){
	var nav = document.getElementById('navigator');
	if(nav.style.display === 'none'){
		nav.style.display = '';
	}
}

function toggleNav(){
	var nav = document.getElementById('navigator');
	var navicon = document.getElementById('navicon');
	if(!('display' in nav.style) || nav.style.display === ''){
		nav.style.display = 'block';
	}else{
		if(nav.style.display === 'none'){
			nav.style.display = 'block';
		}else{
			nav.style.display = 'none';
		}
	}
	
}


function makeThumb(page) {
	// draw page to fit into 96x96 canvas
	var vp = page.getViewport({ scale: 1, });
	var canvas = document.createElement("canvas");
	var scalesize = 1;
	canvas.width = vp.width * scalesize;
	canvas.height = vp.height * scalesize;
	canvas.setAttribute('class', 'paperThumb');
	var scale = Math.min(canvas.width / vp.width, canvas.height / vp.height);
	console.log(vp.width, vp.height, scale);
	return page.render({ canvasContext: canvas.getContext("2d"), viewport: page.getViewport({ scale: scale }) }).promise.then(function () {
		return canvas;
	});
}

function drawPaperThumbnail(url, container) {
	pdfjsLib.getDocument(url).promise.then(function (doc) {
		if (doc.numPages > 0) {
			var div = document.createElement("a");
			div.href = url;
			container.appendChild(div);
			return doc.getPage(1).then(makeThumb)
				.then(function (canvas) {
					div.appendChild(canvas);
				});
		}

	}).catch(console.error);

}


let oldLoadAllFootnotes = loadAllFootnotes;


loadAllFootnotes = function (filename, rest) {

	oldLoadAllFootnotes(filename, () => {
		let projects = document.getElementsByClassName("project");
		for (let x = 0; x < projects.length; ++x) {
			let proj = projects[x];
			let cites = proj.getElementsByTagName('cite');

			let localfn = footnotes;
			let localfi = footnoteindex;
			let nf = nextFootnote;
			nextFootnote = 1;
			//footnotes = {};
			footnoteindex = {};
			for (let i = 0; i < cites.length; ++i) {
				let cite = cites[i];
				cite.outerHTML = citefy(cite.innerHTML)
			}

			if (nextFootnote > 1) {
				let tv = `<table class="projectTable"> <tr><td><div id='paperpics.${x}'></div></td> <td>${proj.innerHTML + footrender()}</td> </tr>  </table>`




				proj.innerHTML = tv;

				for (let i = 1; i < nextFootnote; ++i) {
					drawPaperThumbnail('papers/' + footnoteindex[i] + '.pdf', document.getElementById(`paperpics.${x}`));

				}
			} else {
				let tv = `<table class="projectTable"> <tr> <td>${proj.innerHTML}</td> </tr>  </table>`

				proj.innerHTML = tv;
            } 
			nextFootnote = nf;
			//footnotes = localfn;
			footnoteindex = localfi;

			
		}

		rest();
	});

}


