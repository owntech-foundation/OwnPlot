const fs = require('fs'); //file opening, reading & writing

const startRecordBtn = $("#startRecordBtn");
const pauseRecordBtn = $("#pauseRecordBtn");
const downloadRecordBtn = $("#downloadRecordBtn");
const recordSeparatorInput = $("#recordSeparatorInput");

$(()=>{
    pauseRecordBtn.hide();
    startRecordBtn.on("click", ()=>{
        startRecordBtn.hide();
        pauseRecordBtn.show();
        downloadRecordBtn.attr("disabled", true);
        textToExport = ""; // reset recorded data
        recording = true;
    });
    pauseRecordBtn.on("click", ()=>{
        pauseRecordBtn.hide();
        startRecordBtn.show();
        downloadRecordBtn.attr("disabled", false);
        recording = false;
    });
    downloadRecordBtn.on("click", ()=>{
        download(generateFileName());
    });
    recordSeparatorInput.on("input", ()=>{
        recordSeparator = recordSeparatorInput.val();
    });
});

function download(filename) {
    let downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textToExport));
    downloadLink.setAttribute('download', filename);

    downloadLink.style.display = 'none';
    recordDiv.append(downloadLink);

    downloadLink.click();

    recordDiv.removeChild(downloadLink);
}

function generateFileName(){
    return "OwnPlot_Record_" + new Date().toISOString().substring(0,10);
}