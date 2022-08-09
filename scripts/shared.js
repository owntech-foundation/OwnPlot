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

const RECORD_MAX_SIZE = Math.pow(10,9); //max 1Go of recorded data
let recording = false;
let textToExport = "";
let recordSeparator = ",";
function writeToExport(buf){
	if(recording){
		// we write data only if we can get a full line
		for (let line = 0; line < buf.length / numberOfDatasets; line++) {
			for (let index = 0; index < numberOfDatasets-1; index++) {
				textToExport += buf[line * numberOfDatasets + index] + recordSeparator;
			}
			textToExport += buf[(line + 1) * numberOfDatasets - 1];
			textToExport += "\n";
		}
		if(textToExport.length > RECORD_MAX_SIZE){
			$("#pauseRecordBtn").trigger("click");
		}
	}
}
