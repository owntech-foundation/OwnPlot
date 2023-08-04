/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-09-09 11:20:01
 * @ Description:
 */

const { Button } = require("bootstrap");
const { now } = require("moment");
const objectKeys = require("object-keys");

/* shared functions */
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

function dateToPreciseTimeString(date) {
    let msStr = date.getMilliseconds().toString();
    let timeStr = dateToTimeString(date) + '.';
    for (let index = msStr.length; index < 3; index++){
        timeStr += '0'; //12:23:34.004 instead of 12:23:34.4
    }
    return timeStr + msStr;
}

function arraysEqual(firstArr, secondArr) {
	if((firstArr == false || firstArr == undefined) && (secondArr == false || secondArr == undefined)){
		return true;
	} else if ((firstArr == false || firstArr == undefined) || (secondArr == false || secondArr == undefined)){
		return false;
	} else {
		return firstArr.toString() === secondArr.toString();
	}
}

function getIntInString(str) {
    return parseInt(str.replace(/[^\d.]/g, '')); //first we remove the non-digit characters
}

function enterKeyupHandler(elemSelector, handler) {
    elemSelector.on("keyup", function(e){
        if (e.key == "Enter") {
            handler();
            elemSelector.blur();
        }
    });
}


/* Time */

let chartStartTime;
let absTimeMode = true;
function millisecondsElapsed(startTime, endTime){
	return (endTime - startTime)/1000;
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




