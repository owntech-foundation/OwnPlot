/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-26 11:12:38
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-07-28 16:27:14
 */

const DataModesEnum = {
	Ascii: 'Ascii',
	Hex: 'Hex'
};

function terminalTimestampBtnEnable(elem) {
	elem.attr('aria-pressed', 'true');
	elem.removeClass('btn-warning');
	elem.addClass('btn-success');
}

function terminalTimestampBtnDisable(elem) {
	elem.attr('aria-pressed', 'false');
	elem.removeClass('btn-success');
	elem.addClass('btn-warning');
}

function terminalFormattedEnable(elem) {
	elem.attr('aria-pressed', 'true');
	elem.removeClass('btn-warning');
	elem.addClass('btn-success');
	elem.html('<i class="fa-solid fa-droplet"></i>&nbsp;Formatted');
	formattedMode = true;
}

function terminalFormattedDisable(elem) {
	elem.attr('aria-pressed', 'false');
	elem.removeClass('btn-success');
	elem.addClass('btn-warning');
	elem.html('<i class="fa-solid fa-droplet-slash"></i>&nbsp;Raw Data');
	formattedMode = false;
}

function terminalHexMode(elem) {
	elem.attr('aria-pressed', 'true');
	elem.removeClass('btn-default');
	elem.addClass('btn-success');
	elem.html('<i class="fa-solid fa-code"></i>&nbsp;Hex mode');
	termDataMode = DataModesEnum.Hex;
}

function terminalAsciiMode(elem) {
	elem.attr('aria-pressed', 'false');
	elem.removeClass('btn-success');
	elem.addClass('btn-default');
	elem.html('<i class="fa-solid fa-a"></i></i>&nbsp;Ascii mode');
	termDataMode = DataModesEnum.Ascii;
}

let terminalBtnClear =  $('#terminalBtnClear');
let terminalBtnTimestamp = $('#terminalBtnTimestamp');
let terminalBtnFormatted = $('#terminalBtnFormatted');
let terminalBtnDataMode = $('#terminalBtnDataMode');
let terminalSel = $('#terminalPre');
let formattedMode = false;
let termDataMode = DataModesEnum.Ascii;

let countTermLines = 0;
let maxTermLine = 50;

$(function() {
	terminalBtnClear.on('click', function(){
		terminalSel.empty();
		terminalSel.append('<span>terminal cleared</span>');
		countTermLines = 0;
	});

	terminalTimestampBtnDisable(terminalBtnTimestamp); //default behavior
	terminalBtnTimestamp.on('click', function(){
		if(terminalBtnTimestamp.attr('aria-pressed') === "true"){
			//if it is enabled then disable it
			terminalTimestampBtnDisable(terminalBtnTimestamp);
		} else {
			terminalTimestampBtnEnable(terminalBtnTimestamp);
		}
	});

	terminalFormattedDisable(terminalBtnFormatted);
	terminalBtnFormatted.on('click', function(){
		if(terminalBtnFormatted.attr('aria-pressed') === "true"){
			//if it is enabled then disable it
			terminalFormattedDisable(terminalBtnFormatted);
		} else {
			terminalFormattedEnable(terminalBtnFormatted);
		}
	});

	terminalAsciiMode(terminalBtnDataMode);
	terminalBtnDataMode.on('click', function(){
		if(terminalBtnDataMode.attr('aria-pressed') === "true"){
			//if it is enabled then disable it
			terminalAsciiMode(terminalBtnDataMode);
		} else {
			terminalHexMode(terminalBtnDataMode);
		}
	});
});

function termialTime() {
	if (terminalBtnTimestamp.attr('aria-pressed') === "true") {
		let now = new Date().toISOString().slice(0, -1) //time w/ ms
		now = now.substring(now.indexOf('T') + 1);
		return (now + " -> ");
	} else {
		return("");
	}
}

function terminalFormating(onDataset, dataMode) {
	let termLine = '';
	if (onDataset){ //channelled print
		dataSerialBuff.forEach((elem, index) => {
			termLine+='<span style="color:' + automaticColorDataset(index + 1) + '">';
			if (dataMode === DataModesEnum.Hex) {
				termLine+= "0x";
				if (elem < 16) {
					termLine += "0";
				}
				//the parseint is here to solve compatibility issues with ascii mode
				termLine+= parseInt(elem.toString()).toString(16).toUpperCase() + '</span>';
			} else {
				termLine+= elem.toString() + '</span>';
			}
			//add a separator between numbers on a same line
			if (index < dataSerialBuff.length - 1) {
				termLine+= " ";
			}
		});
	} else { //raw print
		rawDataBuff.forEach((elem) => {
			if (dataMode === DataModesEnum.Hex) {
				termLine+= "0x";
				if (elem < 16) {
					termLine += "0";
				}
				//the parseint is here to solve compatibility issues with ascii mode
				termLine+= parseInt(elem.toString()).toString(16).toUpperCase();
			} else {
				termLine+= elem.toString();
			}
			termLine+= " ";
		});
		rawDataBuff = Buffer.alloc(0);
	}
	termLine+='\r\n'.toString();
	return (termLine);
}

function updateTerminal() {
	if(plotOnPause() == false){
		if (countTermLines == 0){
			terminalSel.empty(); //erases the "terminal cleared" on print
		}
		terminalSel.prepend('<span>' + termialTime() + terminalFormating(formattedMode, termDataMode) + '</span>'); //put first on top
		countTermLines = countTermLines + 1;
		if (countTermLines > maxTermLine) {
			terminalSel.children().last().remove();
			countTermLines = countTermLines - 1;
		}
	}
}