/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-26 11:12:38
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-07-29 17:30:45
 */

const DataModesEnum = {
	Decimal: 'Decimal',
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

function terminalDecimalMode(elem) {
	elem.attr('aria-pressed', 'false');
	elem.removeClass('btn-success');
	elem.addClass('btn-default');
	elem.html('<i class="fa-solid fa-arrow-down-1-9"></i></i>&nbsp;Decimal mode');
	termDataMode = DataModesEnum.Decimal;
}

let clearBtn =  $('.clearBtn');
let terminalBtnTimestamp = $('#terminalBtnTimestamp');
let terminalBtnFormatted = $('#terminalBtnFormatted');
let terminalBtnDataMode = $('#terminalBtnDataMode');
let terminalSel = $('#terminalPre');
let formattedMode = false;
let termDataMode = DataModesEnum.Decimal;

let countTermLines = 0;
let maxTermLine = 50;

$(function() {
	clearBtn.on('click', function(){
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

	terminalDecimalMode(terminalBtnDataMode);
	terminalBtnDataMode.on('click', function(){
		if(terminalBtnDataMode.attr('aria-pressed') === "true"){
			//if it is enabled then disable it
			terminalDecimalMode(terminalBtnDataMode);
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

function valueToString(val){
	let str = "";
	if (termDataMode === DataModesEnum.Hex) {
		str+= "0x";
		if (val < 16) {
			str += "0";
		}
		//the parseint is here to solve compatibility issues with ascii mode
		str+= parseInt(val.toString()).toString(16).toUpperCase();
	} else {
		str+= val.toString();
	}
	str+= " ";
	return str;
}

function terminalFormating() {
	let termLine = '';
	if (formattedMode){
		dataSerialBuff.forEach((elem, index) => {
			termLine+='<span style="color:' + automaticColorDataset(index + 1) + '">';
			termLine+= valueToString(elem); //takes care of the base (dec or hex)
			termLine+= '</span>';
		});
		termLine = termLine.substring(0,termLine.length - (1+'</span>'.length)) + termLine.substring(termLine.length - ('</span>'.length), termLine.length); //erases the last " " which is useless
	} else { //raw print
		rawDataBuff.forEach((elem) => {
			termLine+= valueToString(elem); //takes care of the base (dec or hex)
		});
		termLine = termLine.substring(0,termLine.length - 1); //erases the last " " which is useless
		rawDataBuff = Buffer.alloc(0);
	}
	termLine+='\r\n';
	return (termLine);
}

function updateTerminal() {
	if(plotOnPause() == false){
		let dataString = terminalFormating();
		// doesn't print empty lines
		if (dataString !== '\r\n'){
			if (countTermLines == 0){
				terminalSel.empty(); //erases the "terminal cleared" on print
			}
			terminalSel.prepend('<span>' + termialTime() + dataString + '</span>'); //put first on top
			countTermLines = countTermLines + 1;
			$('.clearBtn').removeClass('disabled');
		}
		if (countTermLines > maxTermLine) {
			terminalSel.children().last().remove();
			countTermLines = countTermLines - 1;
		}
	}
}