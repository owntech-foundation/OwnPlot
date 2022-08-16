const { now } = require("moment");

/* Util */
function dateToTimeString(date){
	return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}
function dateToPreciseTimeString(date){
    return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.' + date.getMilliseconds();
}

function getIntInString(str){
    return parseInt(str.replace(/[^\d.]/g, '' ));
}

/* Debug */
const debugTermSel = $("#debugTerminal");
function printDebugTerminal(err){
	debugTermSel.prepend('<span>' + dateToPreciseTimeString(new Date()) + err + '</span>');
}

/* Chart */

let numberOfDatasets = 3;

/* Time */
 
let chartStartTime;
let absTimeMode = true;
function millisecondsElapsed(startTime, endTime){
	return (endTime - startTime)/1000;
}

/* Record */

const upRecordRadio = $("#upRecordRadio");
const timestampRecordCheck = $("#timestampRecordCheck");
const sPrecisionTimestampRecordRadio = $("#sPrecisionTimestampRecordRadio");
const RECORD_MAX_SIZE = Math.pow(10,9); //max 1Go of recorded data
let recording = false;
let absTimeRecord = true;
let recordStartTime;
let textToExport = "";
let recordSeparator = ",";
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

/* Chart Settings */

function updateLegendTable(){
    let table = [];
    myChart.data.datasets.forEach(dataset => {
        table.push({
            index: dataset.index,
            label: dataset.label,
            color: dataset.backgroundColor
        });
    });

    let tableHTML = tableify(table);
    tableHTML = "<table class='table table-hover' id='legendTable'>" + tableHTML.substring(7, tableHTML.length); //"<table>".length = 7, we replace it to insert class & id
    $("#legendConfigDiv").html(tableHTML);

    let boxes = $("#legendTable").find("td");
    for (let index = 0; index < boxes.length; index += 3) {
        let labelIndex = (index/3).toFixed();
        boxes[index+1].innerHTML = '<span style="display:none">' + table[labelIndex].label /*set a hidden span to allow sorting*/ + '</span><input type="text" class="labelInput" id="labelInput' + labelIndex + '" value="' + table[labelIndex].label + '">';
        boxes[index+2].innerHTML = '<input type="color" class="colorInput" id="colorInput' + labelIndex + '" value="' + table[labelIndex].color + '">';
    }

    $("#legendTable").DataTable({
		"paging": false,
		"searching": false,
		"info": false,
	});
    
    $(".colorInput").on('change', function() {
        let index = getIntInString($(this).attr("id"));
        myChart.data.datasets[index].backgroundColor = $(this).val();
        myChart.data.datasets[index].borderColor = $(this).val();
    });

    $(".labelInput").on('change', function() {
        let index = getIntInString($(this).attr("id"));
        myChart.data.datasets[index].label = $(this).val();
        updateLegendTable();
    });
}
