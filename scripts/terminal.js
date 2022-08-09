/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-26 11:12:38
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-08-09 17:09:55
 */

/*
 *	UI handlers
 */

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

/*
 *	JQuery selectors
 */

let clearBtn =  $('.clearBtn');
let terminalBtnTimestamp = $('#terminalBtnTimestamp');
let terminalBtnFormatted = $('#terminalBtnFormatted');
let terminalBtnDataMode = $('#terminalBtnDataMode');
let terminalSel = $('#terminalData');
let termBufSizeInput = $('#termBufSizeInput');

// -------------------------------------- //


const DataModesEnum = {
	Decimal: 'Decimal',
	Hex: 'Hex'
};
let termDataMode = DataModesEnum.Decimal;
let formattedMode = false;

let countTermLines = 0;
let termSize = 30;
const minTermLines = 1;
const maxTermLine = 500;

$(() => {
	termBufSizeInput.on('change', () => {
		termSize = termBufSizeInput.val();
		if(termSize > maxTermLine){
			termSize = maxTermLine;
		} else if(termSize < minTermLines){
			termSize = minTermLines;
		}
		changeTerminalSize();
	});

	clearBtn.on('click', function(){
		clearTerminal();
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

function changeTerminalSize(){
	while(countTermLines > termSize){
		terminalSel.children().last().remove();
		countTermLines = countTermLines - 1;
	}
}

function clearTerminal(){
	terminalSel.empty();
	terminalSel.append('<span>terminal cleared</span>');
	countTermLines = 0;
}

function termialTime() {
	let timeStr = "";
	if (terminalBtnTimestamp.attr('aria-pressed') === "true") {
		let dataTime; //we get the time of the last data received
		if(formattedMode){
			dataTime = timeBuff[0]; //we get the time of the beginning of the data line as it may be sent in multiple times
		} else { //raw data
			dataTime = timeBuff[timeBuff.length-1]; //we get the time of the last data received
		}

		if(absTimeMode){
			timeStr = dateToTimeString(new Date(dataTime));
		} else { //relative time
			timeStr = elapsedTime(dataTime);
		}
		timeStr+= " -> ";
	}
	return(timeStr);
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
		if (countTermLines > termSize) {
			terminalSel.children().last().remove();
			countTermLines = countTermLines - 1;
		}
	}
}
