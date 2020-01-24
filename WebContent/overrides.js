
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