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
function writeToExport(buf){
	if(recording){
		// we write data only if we can get a full line
		if(upRecordRadio[0].checked){
			for (let lineIndex = 0; lineIndex < buf.length / numberOfDatasets; lineIndex++) {
				line = "";
				for (let datasetIndex = 0; datasetIndex < numberOfDatasets-1; datasetIndex++) {
					line += buf[lineIndex * numberOfDatasets + datasetIndex] + recordSeparator;
				}
				line += buf[(lineIndex + 1) * numberOfDatasets - 1];
				line += "\n";
				textToExport = line + textToExport;
			}
		} else {
			for (let lineIndex = 0; lineIndex < buf.length / numberOfDatasets; lineIndex++) {
				for (let datasetIndex = 0; datasetIndex < numberOfDatasets-1; datasetIndex++) {
					textToExport += buf[lineIndex * numberOfDatasets + datasetIndex] + recordSeparator;
				}
				textToExport += buf[(lineIndex + 1) * numberOfDatasets - 1];
				textToExport += "\n";
			}
		}
		if(textToExport.length > RECORD_MAX_SIZE){
			$("#pauseRecordBtn").trigger("click");
		}
	}
}
