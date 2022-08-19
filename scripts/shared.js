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
    return parseInt(str.replace(/[^\d.]/g, '' ));
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
    let table = [];
    myChart.data.datasets.forEach(dataset => {
        table.push({
            index: dataset.index,
            label: dataset.label,
            color: dataset.backgroundColor,
            hide: dataset.hidden,
            "point style": dataset.pointStyle,
            "line style": dataset.lineStyle
        });
    });
    const nbColumns=Object.keys(table[0]).length;

    let tableHTML = tableify(table);
    tableHTML = "<table class='table table-hover' id='legendTable'>" + tableHTML.substring(7, tableHTML.length); //"<table>".length = 7, we replace it to insert class & id
    $("#legendConfigDiv").html(tableHTML);

    let boxes = $("#legendTable").find("td");
    for (let index = 0; index < boxes.length; index += nbColumns) { //init table, every row counts 3 columns 
        let labelIndex = (index/nbColumns).toFixed();
        //label
        boxes[index+1].innerHTML = '<span style="display:none">' + table[labelIndex].label + '</span>'; /*set a hidden span to allow sorting*/ 
        boxes[index+1].innerHTML += '<input type="text" class="labelInput" id="labelInput' + labelIndex + '" value="' + table[labelIndex].label + '">';
        //color
        boxes[index+2].innerHTML = '<input type="color" class="colorInput" id="colorInput' + labelIndex + '" value="' + table[labelIndex].color + '">';
        //visibility
        if(table[labelIndex].hide){
            boxes[index+3].innerHTML = '<span style="display:none">1</span>'; /*set a hidden span to allow sorting*/
            boxes[index+3].innerHTML += '<div class="form-check form-switch"><input class="form-check-input datasetVisibleCheck" type="checkbox" role="switch" id="datasetVisibleCheck' + labelIndex + '" checked></div>';
        } else {
            boxes[index+3].innerHTML = '<span style="display:none">0</span>'; /*set a hidden span to allow sorting*/
            boxes[index+3].innerHTML += '<div class="form-check form-switch"><input class="form-check-input datasetVisibleCheck" type="checkbox" role="switch" id="datasetVisibleCheck' + labelIndex + '"></div>';
        }
        //point style
        boxes[index+4].innerHTML = '<select class="form-select form-select-sm pointStyleSelect" id="pointStyleSelect' + labelIndex + '"><option>circle</option><option>cross</option><option>rect</option><option>triangle</option></select>';
        boxes[index+4].innerHTML += '<input type="number" class="form-control pointSizeInput" id="pointSizeInput' + labelIndex + '" value="' + myChart.data.datasets[labelIndex].pointRadius + '" min="0" max="20">'
        $($("option:contains(" + table[labelIndex]["point style"] + ")")[labelIndex]).prop('selected', true); //show the current point type in the select
        //line style
        let lineStyleSelect = '<select class="form-select form-select-sm lineStyleSelect" id="lineStyleSelect' + labelIndex + '">';
        Object.keys(lineStylesEnum).forEach(styleName => {
            lineStyleSelect += '<option>' + styleName + '</option>';
        });
        lineStyleSelect += '</select>';
        boxes[index+5].innerHTML = lineStyleSelect;
        boxes[index+5].innerHTML += '<input type="number" class="form-control lineSizeInput" id="lineSizeInput' + labelIndex + '" value="' + myChart.data.datasets[labelIndex].lineBorderWidth + '" min="0" max="20">'
        $($("option:contains(" + table[labelIndex]["line style"] + ")")[labelIndex]).prop('selected', true); //show the current line type in the select
    }

    $("#legendTable").DataTable({
		"paging": false,
		"searching": false,
		"info": false,
	});
    
    $(".colorInput").on('input', function() {
        let datasetIndex = getIntInString($(this).attr("id"));
        myChart.data.datasets[datasetIndex].backgroundColor = $(this).val();
        myChart.data.datasets[datasetIndex].borderColor = $(this).val();
    });

    $(".labelInput").on('change', function() {
        let datasetIndex = getIntInString($(this).attr("id"));
        myChart.data.datasets[datasetIndex].label = $(this).val();
        updateLegendTable();
    });

    $(".datasetVisibleCheck").on('click', function(){
        let datasetIndex = getIntInString($(this).attr("id"));
        if(this.checked){
            myChart.data.datasets[datasetIndex].hidden = true;
        } else {
            myChart.data.datasets[datasetIndex].hidden = false;
        }
        updateLegendTable();
    });

    $(".pointStyleSelect").on('change', function(){
        let datasetIndex = getIntInString($(this).attr("id"));
        myChart.data.datasets[datasetIndex].pointStyle = $(this).val();
        updateLegendTable();
    });

    $(".pointSizeInput").on('change', function(){
        let datasetIndex = getIntInString($(this).attr("id"));
        myChart.data.datasets[datasetIndex].pointRadius = parseInt($(this).val());
    });

    $(".lineStyleSelect").on('change', function(){
        let datasetIndex = getIntInString($(this).attr("id"));
        myChart.data.datasets[datasetIndex].lineStyle = $(this).val();
        myChart.data.datasets[datasetIndex].lineBorderDash = lineStylesEnum[$(this).val()];
        updateLegendTable();
    });

    $(".lineSizeInput").on('change', function(){
        let datasetIndex = getIntInString($(this).attr("id"));
        myChart.data.datasets[datasetIndex].lineBorderWidth = parseInt($(this).val());
    });
}