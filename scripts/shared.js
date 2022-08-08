function elapsedTime(endTime){
	return (endTime - startTime)/1000;
}

let startTime;

let absTimeMode = true;

let numberOfDatasets = 3;

const RECORD_MAX_SIZE = Math.pow(10,9);
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
