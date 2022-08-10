const fs = require('fs'); //file opening, reading & writing

const startRecordBtn = $("#startRecordBtn");
const pauseRecordBtn = $("#pauseRecordBtn");
const downloadRecordBtn = $("#downloadRecordBtn");
const recordSeparatorInput = $("#recordSeparatorInput");
const nameRecordCheck = $("#nameRecordCheck");

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
    if(nameRecordCheck[0].checked){
        textToExport = '\n' + textToExport;
        for (let index = myChart.data.datasets.length-1; index > 0; index--) {
            textToExport = recordSeparator + myChart.data.datasets[index].label + textToExport;
        }
        textToExport = myChart.data.datasets[0].label + textToExport;
        if(timestampRecordCheck.checked){
            textToExport = "Time" + recordSeparator + textToExport;
        }
    }

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