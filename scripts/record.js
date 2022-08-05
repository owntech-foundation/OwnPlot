const fs = require('fs'); //file opening, reading & writing

const recordDiv = $("#recordDiv");
const recordBtn = $("#recordBtn");

$(()=>{
    recordBtn.on("click", ()=>{
        let text = "yoloooo";
        let filename = "test.txt";
        
        download(filename, text);
    });
});

function download(filename, text) {
    let downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    downloadLink.setAttribute('download', filename);

    downloadLink.style.display = 'none';
    recordDiv.append(downloadLink);

    downloadLink.click();

    recordDiv.removeChild(downloadLink);
}
