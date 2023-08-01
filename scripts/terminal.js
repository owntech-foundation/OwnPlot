/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-09-07 13:44:33
 * @ Description:
 */

const ejs = require('ejs');

var term1, term2;

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
	elem.html('<i class="fa-solid fa-code"></i>&nbsp;Hexadecimal');
	termDataMode = DataModesEnum.Hex;
}

function terminalDecimalMode(elem) {
	elem.attr('aria-pressed', 'false');
	elem.removeClass('btn-success');
	elem.addClass('btn-default');
	elem.html('<i class="fa-solid fa-arrow-down-1-9"></i></i>&nbsp;Decimal');
	termDataMode = DataModesEnum.Decimal;
}

/*
 *	JQuery selectors
 */

let clearBtn =  $('#clearPortBtn');
let terminalBtnTimestamp = $('#terminalBtnTimestamp');
let terminalBtnFormatted = $('#terminalBtnFormatted');
let terminalBtnDataMode = $('#terminalBtnDataMode');
let termBufSizeInput = $('#termBufSizeInput');

// -------------------------------------- //


const DataModesEnum = {
	Decimal: 'Decimal',
	Hex: 'Hex'
};
let termDataMode = DataModesEnum.Decimal;
let formattedMode = false;

let termSize = 20;
const MIN_TERM_LINES = 0;
const MAX_TERM_LINES = 1000;

class TerminalApp {
	constructor(appID) {
		this.appID = appID;
		this.template = fs.readFileSync("template/apps/terminal.ejs", 'utf-8');
		this.renderedHtml = ejs.render(this.template, { app_id: this.appID });
		console.log(this.renderedHtml);
		$("#chartAndTerminalDiv").append(this.renderedHtml);

		this.terminalSel = $('#terminalData_' + appID);

		this.countTermLines = 0;

		termBufSizeInput.val(termSize);
		termBufSizeInput.on('change', this.terminalSizeInputHandler);
		enterKeyupHandler(termBufSizeInput, this.terminalSizeInputHandler);
	
		terminalTimestampBtnEnable(terminalBtnTimestamp); //default behaviour
		terminalBtnTimestamp.on('click', function(){
			if(terminalBtnTimestamp.attr('aria-pressed') === "true"){
				//if it is enabled then disable it
				terminalTimestampBtnDisable(terminalBtnTimestamp);
			} else {
				terminalTimestampBtnEnable(terminalBtnTimestamp);
			}
		});
	
		terminalFormattedEnable(terminalBtnFormatted); //default behaviour
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
	}
	
	clearTerminal() {
		this.terminalSel.empty();
		this.terminalSel.append('<span>terminal cleared</span>');
		this.countTermLines = 0;
	}
	
	terminalTime() {
		let timeStr = "";
		if (terminalBtnTimestamp.attr('aria-pressed') === "true") {
			let dataTime; //we get the time of the last data received
			if(formattedMode){
				dataTime = timeBuff[0]; //we get the time of the beginning of the data line as it may be sent in multiple times
			} else { //raw data
				dataTime = timeBuff[timeBuff.length-1]; //we get the time of the last data received
			}
	
			if(absTimeMode){
				timeStr = dateToPreciseTimeString(new Date(dataTime));
			} else { //relative time
				timeStr = millisecondsElapsed(chartStartTime, dataTime);
			}
			timeStr+= " -> ";
		}
		return(timeStr);
	}

	changeTerminalSize() {
		while(this.countTermLines > termSize) {
			this.terminalSel.children().last().remove();
			this.countTermLines = this.countTermLines - 1;
		}
	}

	terminalSizeInputHandler() {
		termSize = termBufSizeInput.val();
		if(termSize > MAX_TERM_LINES) {
			termSize = MAX_TERM_LINES;
		} else if(termSize < MIN_TERM_LINES) {
			termSize = MIN_TERM_LINES;
		}
		this.changeTerminalSize();
	}

	valueToString(val) { ///TODO: move this ?
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

	terminalFormating() {
		let termLine = '';
		if (formattedMode){
			if(dataSerialBuff.length >= numberOfDatasets) {
				for (let index = 0; index < numberOfDatasets; index++) {
					termLine+='<span style="color:' + myChart.data.datasets[index].backgroundColor + '">';
					termLine+= this.valueToString(dataSerialBuff[index]); //takes care of the base (dec or hex)
					termLine+= '</span>';
				}
				termLine = termLine.substring(0,termLine.length - (1+'</span>'.length)) + termLine.substring(termLine.length - ('</span>'.length), termLine.length); //erases the last " " which is useless
			}
		} else { //raw print
			rawDataBuff.forEach((elem) => {
				termLine+= this.valueToString(elem); //takes care of the base (dec or hex)
			});
			termLine = termLine.substring(0,termLine.length - 1); //erases the last " " which is useless
			rawDataBuff = Buffer.alloc(0);
		}
		termLine+='\r\n';
		return (termLine);
	}

	updateTerminal() {
		if(plotOnPause() == false && termSize > 0){
			let dataString = this.terminalFormating();
			// doesn't print empty lines
			if (dataString !== '\r\n'){
				if (this.countTermLines == 0){
					this.terminalSel.empty(); //erases the "terminal cleared" on print
				}
				this.terminalSel.prepend('<span>' + this.appID + "| " + this.terminalTime() + dataString + '</span>'); //put first on top
				this.countTermLines = this.countTermLines + 1;
				$('#clearPortBtn').prop('disabled', false);
			}
			if (this.countTermLines > termSize) {
				this.terminalSel.children().last().remove();
				this.countTermLines = this.countTermLines - 1;
			}
		}
	}

	printMessageToTerminal(message) {
		let messageElement = $('<span>' + message + '<span>');
		this.terminalSel.prepend(messageElement);
		this.countTermLines++;
	
		if(this.countTermLines > termSize) {
			this.terminalSel.children().last().remove();
			this.countTermLines--;
		}
	}
}

$(() => {
	term1 = new TerminalApp("app1000");
	term2 = new TerminalApp("app2000");

});

termBufSizeInput.on('input', function() {
	termSize = termBufSizeInput.val();
	if (termSize > MAX_TERM_LINES) {
		termSize = MAX_TERM_LINES;
		termBufSizeInput.val(termSize);
	}
});
