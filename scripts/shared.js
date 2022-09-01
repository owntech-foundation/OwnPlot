const { Button } = require("bootstrap");
const { now } = require("moment");
const objectKeys = require("object-keys");

/* Util */
function dateToTimeString(date){
	return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}
function dateToPreciseTimeString(date){
    let ms = date.getMilliseconds().toString();
    let str=date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.';
    for (let index = ms.length; index < 3; index++){
        str += '0'; //12:23:34.004 instead of 12:23:34.4
    }
    return str + ms;
}

function arraysEqual(firstArr, secondArr){
	if((firstArr == false || firstArr == undefined) && (secondArr == false || secondArr == undefined)){
		return true;
	} else if ((firstArr == false || firstArr == undefined) || (secondArr == false || secondArr == undefined)){
		return false;
	} else {
		return firstArr.toString() === secondArr.toString();
	}
}

function getIntInString(str){
    return parseInt(str.replace(/[^\d.]/g, '' )); //first we remove the non-digit characters
}

function enterKeyupHandler(elemSelector, handler){
    elemSelector.on("keyup", function(e){
        if (e.key == "Enter") {
            handler();
            elemSelector.blur();
        }
    });
}

/* Debug */
const debugTermSel = $("#debugTerminal");
function printDebugTerminal(err){
	debugTermSel.prepend('<span>' + dateToPreciseTimeString(new Date()) + err + '</span>');
}

/* Chart */

let numberOfDatasets = 0;

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
    const lineTemplate = $("#legendSetupLineTemplate").html();
    const legendSetupTable = $("#legendConfigDiv");
    legendSetupTable.html('<div id="legendSetupLineTemplate">' + lineTemplate + '</div>'); //clear the table but leave the template
    myChart.data.datasets.forEach(dataset => {
        let tableLine = lineTemplate;
        tableLine = tableLine.replace(" hidden", "");
        if(dataset.hidden){
            tableLine = tableLine.replace(" checked", "");
        }
        // The following implementation implies that point styles & line styles have all different names
        tableLine = tableLine.replace("<option>" + pointStylesEnum[dataset.pointStyle], "<option selected>" + pointStylesEnum[dataset.pointStyle]);
        tableLine = tableLine.replace("<option>" + lineStylesEnum[dataset.lineStyle], "<option selected>" + lineStylesEnum[dataset.lineStyle]);
        tableLine = tableLine.replace('#ffffff', dataset.backgroundColor);
        tableLine = tableLine.replace('id="pointSizeInputNULL" value=""', 'id="pointSizeInputNULL" value="' + dataset.pointRadius + '"');
        tableLine = tableLine.replace('id="lineSizeInputNULL" value=""', 'id="lineSizeInputNULL" value="' + dataset.lineBorderWidth + '"');        
        tableLine = tableLine.replace(/NULL/gm, dataset.index + 1);
        legendSetupTable.append(tableLine);
    });

    // $("#legendTable").DataTable({
	// 	"paging": false,
	// 	"searching": false,
	// 	"info": false,
	// }); //Sorts a html table

    $(".collapseHead").on('click', function(){
        $($(this).attr('href')).collapse("toggle"); // I do it this way because collapse doesn't work with traditionnal data-bs-toggle, i can't figure why
    });
    
    $(".colorInput").on('input', function() {
        let datasetIndex = getIntInString($(this).attr("id")) - 1;
        myChart.data.datasets[datasetIndex].backgroundColor = $(this).val();
        myChart.data.datasets[datasetIndex].borderColor = $(this).val();
    });

    $(".labelInput").on('change', function() {
        let datasetIndex = getIntInString($(this).attr("id")) - 1;
        myChart.data.datasets[datasetIndex].label = $(this).val();
    });

    $(".datasetVisibleCheck").on('click', function(){
        let datasetIndex = getIntInString($(this).attr("id")) - 1;
        if(this.checked){
            myChart.data.datasets[datasetIndex].hidden = false;
        } else {
            myChart.data.datasets[datasetIndex].hidden = true;
        }
    });

    $(".pointStyleSelect").on('change', function(){
        let datasetIndex = getIntInString($(this).attr("id")) - 1;
        myChart.data.datasets[datasetIndex].pointStyle = pointStylesEnum[$(this).val()];
    });

    $(".pointSizeInput").on('change', function(){
        let datasetIndex = getIntInString($(this).attr("id")) - 1;
        myChart.data.datasets[datasetIndex].pointRadius = parseInt($(this).val());
    });

    $(".lineStyleSelect").on('change', function(){
        let datasetIndex = getIntInString($(this).attr("id")) - 1;
        myChart.data.datasets[datasetIndex].lineStyle = $(this).val();
        myChart.data.datasets[datasetIndex].lineBorderDash = lineStylesEnum[$(this).val()];
    });

    $(".lineSizeInput").on('change', function(){
        let datasetIndex = getIntInString($(this).attr("id")) - 1;
        myChart.data.datasets[datasetIndex].lineBorderWidth = parseInt($(this).val());
    });
}

/* port */

let portIsOpen = false;