/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-22 16:23:22
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-09-07 13:43:49
 * @ Description:
 */

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
const upRecordRadio = $("#upRecordRadio");
const timestampRecordCheck = $("#timestampRecordCheck");
const sPrecisionTimestampRecordRadio = $("#sPrecisionTimestampRecordRadio");
const RECORD_MAX_SIZE = Math.pow(10,9); //max 1Gb of recorded data

let nbRecordSameName = 0;
let previousName;
let recording = false;
let recordStartTime;
let absTimeRecord = false;
let textToExport = "";
let recordSeparator = recordSeparatorInput.val();


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
        recordSeparator = recordSeparatorInput.val();
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

function writeToExport(dataBuf, timeBuff){
	if(recording){
		// we write data only if we can get a full line
		for (let lineIndex = 0; lineIndex < dataBuf.length / numberOfDatasets; lineIndex++) {
			let line = "";
			if(timestampRecordCheck[0].checked){
                if(absTimeRecord){
                    if(sPrecisionTimestampRecordRadio[0].checked){
                        line = dateToTimeString(new Date(timeBuff[lineIndex]));
                    } else {
                        line = dateToPreciseTimeString(new Date(timeBuff[lineIndex]));
                    }
                } else {
                    if(sPrecisionTimestampRecordRadio[0].checked){
                        line = Math.round(millisecondsElapsed(recordStartTime, new Date(timeBuff[lineIndex])));
                    } else {
                        line = millisecondsElapsed(recordStartTime, new Date(timeBuff[lineIndex]));
                    }
                }
                line += recordSeparator;
			}
			for (let datasetIndex = 0; datasetIndex < numberOfDatasets-1; datasetIndex++) {
				line += dataBuf[lineIndex * numberOfDatasets + datasetIndex] + recordSeparator;
			}
			line += dataBuf[(lineIndex + 1) * numberOfDatasets - 1];
			line += "\n";
			if(upRecordRadio[0].checked){
				textToExport = line + textToExport;
			} else {
				textToExport += line;
			}
		}
		if(textToExport.length > RECORD_MAX_SIZE){
			$("#pauseRecordBtn").trigger("click"); //force the stop of the record in case too much data is recorded
		}
	}
}