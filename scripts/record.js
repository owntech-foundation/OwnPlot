/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-22 16:23:22
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-09-07 13:43:49
 * @ Description:
 */

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

let nbRecordSameName = 0;
let previousName;

$(()=>{
    pauseRecordBtn.hide();
    previousName = generateFileName();
    recordFileNameInput.val(previousName);
    startRecordBtn.prop("disabled", true);

    startRecordBtn.on("click", function(){
        $(this).hide();
        pauseRecordBtn.show();
        downloadRecordBtn.prop("disabled", true);
        imperativeRecordSetting.prop("disabled", true);
        textToExport = ""; // reset recorded data
        recording = true;
        recordStartTime = new Date();
    });
    pauseRecordBtn.on("click", function(){
        $(this).hide();
        startRecordBtn.show();
        downloadRecordBtn.prop("disabled", false);
        imperativeRecordSetting.prop("disabled", false);
        recording = false;
    });
    downloadRecordBtn.on("click", ()=>{
        downloadRecord();
    });
    recordSeparatorInput.on('change', function(){
        recordSeparator = this.val();
        this.blur();
    });
    enterKeyupHandler(recordSeparatorInput, function(){
        recordSeparator = recordSeparatorInput.val();
    });
    $("#timestampRecordCheck").on('change', function(){
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
        recordFileNameInputHandler();
    });
    enterKeyupHandler(recordFileNameInput, recordFileNameInputHandler);
});

function recordFileNameInputHandler(){
    if(recordFileNameInput.val() == ""){
        recordFileNameInput.val(previousName);
    } else if (arraysEqual(recordFileNameInput.val(), previousName) == false){
        nbRecordSameName=0;
    }
}

function downloadRecord() {
    if(nameRecordCheck[0].checked){
        textToExport = '\n' + textToExport;
        for (let index = myChart.data.datasets.length-1; index > 0; index--) {
            textToExport = recordSeparator + myChart.data.datasets[index].label + textToExport;
        }
        textToExport = myChart.data.datasets[0].label + textToExport;
        if($("#timestampRecordCheck")[0].checked){
            textToExport = "Time" + recordSeparator + textToExport;
        }
    }

    let downloadLink = document.createElement('a');
    if(csvRecordRadio[0].checked){
        downloadLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(textToExport));
    } else {
        downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textToExport));
    }
    downloadLink.setAttribute('download', getFileName());

    downloadLink.style.display = 'none';
    recordDiv.append(downloadLink);

    downloadLink.click();

    recordDiv.removeChild(downloadLink);
    nbRecordSameName++;
}

function generateFileName(){
    return "OwnPlot_Record_" + new Date().toISOString().substring(0,10);
}

function getFileName(){
    let nbRecordStr = '';
    if(nbRecordSameName > 0){
        nbRecordStr = '('+nbRecordSameName+')';
    }
    return recordFileNameInput.val() + nbRecordStr;
}