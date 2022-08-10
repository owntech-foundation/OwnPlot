const { now } = require("moment");

/* Util */
function dateToTimeString(date){
	return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.' + date.getMilliseconds();
}

/* Debug */
const debugTermSel = $("#debugTerminal");
function printDebugTerminal(err){
	debugTermSel.prepend('<span>' + dateToTimeString(new Date()) + err + '</span>');
}

/* Chart */

let numberOfDatasets = 3;

/* Time */
 
let startTime;
let absTimeMode = true;
function elapsedTime(endTime){
	return (endTime - startTime)/1000;
}

/* Record */

const upRecordRadio = $("#upRecordRadio")
const RECORD_MAX_SIZE = Math.pow(10,9); //max 1Go of recorded data
let recording = false;
let textToExport = "";
let recordSeparator = ",";
function writeToExport(dataBuf, timeBuff){
	if(recording){
		// we write data only if we can get a full line
		for (let lineIndex = 0; lineIndex < dataBuf.length / numberOfDatasets; lineIndex++) {
			let line = "";
			if(timestampRecordCheck.checked){
				line = dateToTimeString(new Date(timeBuff[lineIndex])) + recordSeparator;
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
