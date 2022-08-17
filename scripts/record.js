const fs = require('fs'); //file opening, reading & writing

const startRecordBtn = $("#startRecordBtn");
const pauseRecordBtn = $("#pauseRecordBtn");
const downloadRecordBtn = $("#downloadRecordBtn");
const recordSeparatorInput = $("#recordSeparatorInput");
const nameRecordCheck = $("#nameRecordCheck");
const recordTimestampSetupRows = $(".recordTimestampSetupRow");
const absTimestampRecordRadio = $("#absoluteTimestampRecordRadio");
const relTimestampRecordRadio = $("#relativeTimestampRecordRadio");
const imperativeRecordSetting = $(".imperativeRecordSetting");
const recordFileNameInput = $("#recordFileNameInput");
const csvRecordRadio = $("#csvRecordRadio");

$(()=>{
    pauseRecordBtn.hide();
    recordTimestampSetupRows.hide();
    recordFileNameInput.val(generateFileName());

    startRecordBtn.on("click", function(){
        $(this).hide();
        pauseRecordBtn.show();
        downloadRecordBtn.attr("disabled", true);
        imperativeRecordSetting.attr("disabled", true);
        textToExport = ""; // reset recorded data
        recording = true;
        recordStartTime = new Date();
    });
    pauseRecordBtn.on("click", function(){
        $(this).hide();
        startRecordBtn.show();
        downloadRecordBtn.attr("disabled", false);
        imperativeRecordSetting.attr("disabled", false);
        recording = false;
    });
    downloadRecordBtn.on("click", ()=>{
        download(recordFileNameInput.val());
    });
    recordSeparatorInput.on("input", function(){
        recordSeparator = this.val();
    });
    timestampRecordCheck.on('change', function(){
        if(this.checked){
            recordTimestampSetupRows.show();
        } else {
            recordTimestampSetupRows.hide();
        }
    });
    absTimestampRecordRadio.on('click', ()=>{
        absTimeRecord = true;
    });
    relTimestampRecordRadio.on('click', ()=>{
        absTimeRecord = false;
    });
    recordFileNameInput.on("change", function(){
        if($(this).val() == ""){
            $(this).val(generateFileName());
        }
    });
});

function download(filename) {
    if(nameRecordCheck[0].checked){
        textToExport = '\n' + textToExport;
        for (let index = myChart.data.datasets.length-1; index > 0; index--) {
            textToExport = recordSeparator + myChart.data.datasets[index].label + textToExport;
        }
        textToExport = myChart.data.datasets[0].label + textToExport;
        if(timestampRecordCheck[0].checked){
            textToExport = "Time" + recordSeparator + textToExport;
        }
    }

    let downloadLink = document.createElement('a');
    if(csvRecordRadio[0].checked){
        downloadLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(textToExport));
    } else {
        downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textToExport));
    }
    downloadLink.setAttribute('download', filename);

    downloadLink.style.display = 'none';
    recordDiv.append(downloadLink);

    downloadLink.click();

    recordDiv.removeChild(downloadLink);
}

function generateFileName(){
    return "OwnPlot_Record_" + new Date().toISOString().substring(0,10);
}