import generatePdfThumbnails from 'pdf-thumbnails-generator';

async function convert(){
fs = require('fs');

const thumbnails = await generatePdfThumbnails(fs.readFile('DreamCoder.pdf'), 10);

fs.writeFile("out.png", thumbnails, 'base64', function(err){ console.log(err); });
}

convert().then(()=>{console.log("done");})




