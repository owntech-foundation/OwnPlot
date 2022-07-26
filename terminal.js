/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-26 11:12:38
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-07-26 12:33:41
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

function terminalColorEnable(elem) {
	elem.attr('aria-pressed', 'true');
	elem.removeClass('btn-warning');
	elem.addClass('btn-success');
	elem.html('<i class="fa-solid fa-droplet"></i>&nbsp;Colored');
	termColor = true;
}

function terminalColorDisable(elem) {
	elem.attr('aria-pressed', 'false');
	elem.removeClass('btn-success');
	elem.addClass('btn-warning');
	elem.html('<i class="fa-solid fa-droplet-slash"></i>&nbsp;Raw Data');
	termColor = false;
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
let terminalBtnColored = $('#terminalBtnColored');
let terminalBtnDataMode = $('#terminalBtnDataMode');
let terminalSel = $('#terminalPre');
let termColor = false;
let termDataMode = DataModesEnum.Ascii;

$(function() {
	terminalBtnClear.on('click', function(){
		terminalSel.empty();
		terminalSel.append('<span>terminal cleared</span>');
		countTermLines = 1;
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

	terminalColorDisable(terminalBtnColored);
	terminalBtnColored.on('click', function(){
		if(terminalBtnColored.attr('aria-pressed') === "true"){
			//if it is enabled then disable it
			terminalColorDisable(terminalBtnColored);
		} else {
			terminalColorEnable(terminalBtnColored);
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

let countTermLines = 0;
let maxTermLine = 50;

function termialTime() {
	if (terminalBtnTimestamp.attr('aria-pressed') === "true") {
		let now = new Date().toISOString().slice(0, -1) //time w/ ms
		now = now.substring(now.indexOf('T') + 1);
		return (now + " -> ");
	} else {
		return("")
	}
}

function terminalFormating(isColored, termDataMode) {
	let termLine = '';
	dataSerialBuff.forEach((elem, index) => {

		if (isColored) {
			termLine+='<span style="color:' + automaticColorDataset(index + 1) + '">';
		} else {
			termLine+='<span>';
		}
		if (termDataMode === DataModesEnum.Hex) {
			termLine+= "0x";
			if (elem < 15) {
				termLine += "0";
			}
			termLine+= elem.toString(16).toUpperCase() + '</span>';
		} else {
			termLine+= elem.toString() + '</span>';
		}
		if (index < dataSerialBuff.length - 1) {
			if (termDataMode === DataModesEnum.Hex) {
				termLine+= " ";
			} else {
				termLine+= configSerialPlot.separator;
			}
		}
	});
	termLine+='\r\n'.toString();
	return (termLine);
}

// function terminalHex() {
// 	let termLine = '';
// 	dataSerialBuff.forEach((elem, index) => {
// 		termLine += elem.toString(16).toUpperCase() + " ";
// 	});
// 	termLine+='\r\n'.toString();
// 	return (termLine);
// }

function updateTerminal() {

	terminalSel.prepend('<span>' + termialTime() + terminalFormating(termColor, termDataMode) + '</span>'); //put first on top
	
	countTermLines = countTermLines + 1;
	if (countTermLines > maxTermLine) {
		terminalSel.children().last().remove();
		countTermLines = countTermLines - 1;
	}	
}