/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Jean Alinei
 * @ Modified time: 2022-09-09 11:20:01
 * @ Description:
 */

const { Button } = require("bootstrap");
const { now } = require("moment");
const objectKeys = require("object-keys");

/* Util */
function dateToTimeString(date){
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    if (hours<10) {
        hours = '0' + hours;
    }
    if (minutes<10) {
        minutes = '0' + minutes;
    }
    if (seconds<10) {
        seconds = '0' + seconds;
    }
	return hours + ':' + minutes + ':' + seconds;
}
function dateToPreciseTimeString(date){
    let msStr = date.getMilliseconds().toString();
    let timeStr = dateToTimeString(date) + '.';
    for (let index = msStr.length; index < 3; index++){
        timeStr += '0'; //12:23:34.004 instead of 12:23:34.4
    }
    return timeStr + msStr;
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
    return parseInt(str.replace(/[^\d.]/g, '')); //first we remove the non-digit characters
}

function enterKeyupHandler(elemSelector, handler){
    elemSelector.on("keyup", function(e){
        if (e.key == "Enter") {
            handler();
            elemSelector.blur();
        }
    });
}

/*Tooltips initialization*/
$('[data-bs-toggle="tooltip"]').tooltip('disable');
 
$("#tooltipHiddenBtn").on('click', function() {
    $(this).hide();
    //deactivate the tooltips
    $('[data-bs-toggle="tooltip"]').tooltip('enable');
    $("#tooltipShownBtn").show();
});

$("#tooltipShownBtn").hide();
$("#tooltipShownBtn").on('click', function() {
    $(this).hide();
    //activate tooltips
    $('[data-bs-toggle="tooltip"]').tooltip('disable');
    $("#tooltipHiddenBtn").show();
});






/* Debug */
// not available in this version: 
// const debugTermSel = $("#debugTerminal");
// function printDebugTerminal(err){
// 	debugTermSel.prepend('<span>' + dateToPreciseTimeString(new Date()) + err + '</span>');
// }

/* Chart */

let numberOfDatasets = 0;

/* Time */

let chartStartTime;
let absTimeMode = true;
function millisecondsElapsed(startTime, endTime){
	return (endTime - startTime)/1000;
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
        tableLine = tableLine.replace("<option>" + dataset.pointStyleName, "<option selected>" + dataset.pointStyleName);
        tableLine = tableLine.replace("<option>" + dataset.lineStyleName, "<option selected>" + dataset.lineStyleName);
        tableLine = tableLine.replace('#ffffff', dataset.backgroundColor);
        tableLine = tableLine.replace('id="pointSizeInputNULL" value=""', 'id="pointSizeInputNULL" value="' + dataset.pointRadius + '"');
        tableLine = tableLine.replace('id="lineSizeInputNULL" value=""', 'id="lineSizeInputNULL" value="' + dataset.lineBorderWidth + '"');        
        tableLine = tableLine.replace('id="labelInputNULL" value="Dataset NULL"', 'id="labelInputNULL" value="' + dataset.label + '"');               
        tableLine = tableLine.replace(/NULL/gm, dataset.index + 1);
        legendSetupTable.append(tableLine);
    });

    // not used in this first release
    // $(".colorInput").on('input', function() {
    //     let datasetIndex = getIntInString($(this).attr("id")) - 1;
    //     myChart.data.datasets[datasetIndex].backgroundColor = $(this).val();
    //     myChart.data.datasets[datasetIndex].borderColor = $(this).val();
    // });

    $(".labelInput").on('change', function() {
        let datasetIndex = getIntInString($(this).attr("id")) - 1;
        myChart.data.datasets[datasetIndex].label = $(this).val();
        this.blur();
    });
    enterKeyupHandler($(".labelInput"), ()=>{});

    $(".datasetVisibleCheck").on('click', function(){
        let datasetIndex = getIntInString($(this).attr("id")) - 1;
        if(this.checked){
            myChart.data.datasets[datasetIndex].hidden = false;
        } else {
            myChart.data.datasets[datasetIndex].hidden = true;
        }
    });

    $(".yY2AxisSwitch").on('click', function(){
        let datasetIndex = getIntInString($(this).attr("id")) - 1;
        if(this.checked){
            myChart.data.datasets[datasetIndex].yAxisID = 'y';
        } else {
            myChart.data.datasets[datasetIndex].yAxisID = 'y2';
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
    enterKeyupHandler($(".pointSizeInput"), ()=>{}); //blur on enter even if the field has not changed

    $(".lineStyleSelect").on('change', function(){
        let datasetIndex = getIntInString($(this).attr("id")) - 1;
        myChart.data.datasets[datasetIndex].lineStyleName = $(this).val();
        myChart.data.datasets[datasetIndex].lineBorderDash = lineStylesEnum[$(this).val()];
    });

    $(".lineSizeInput").on('change', function(){
        let datasetIndex = getIntInString($(this).attr("id")) - 1;
        myChart.data.datasets[datasetIndex].lineBorderWidth = parseInt($(this).val());
    });
    enterKeyupHandler($(".lineSizeInput"), ()=>{}); //blur on enter even if the field has not changed
    
    $(".collapseHead").on('click', function(){
        $($(this).attr('data-target')).collapse("toggle"); // Collapse doesn't work only with data-bs-toggle, i can't figure why
    });
}

/* port */

let portIsOpen = false;