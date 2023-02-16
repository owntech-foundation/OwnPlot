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

const { app } = require("electron");

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

const MIN_TERM_LINES = 0;
const MAX_TERM_LINES = 500;

$(() => {});

class TerminalApp { //extends App
	constructor(appNbr) {
		this.appNbr = appNbr;
		this.#init();
	}

	#init() {
		this.termDataMode = DataModesEnum.Decimal;
		this.formattedMode = false;
		this.termSize = 20;
		this.countTermLines = 0;
		this.terminalSel = $('#terminalData_app_' + this.appNbr);
		termBufSizeInput.val(this.termSize);
		termBufSizeInput.on('change', this.sizeInputHandler);
		enterKeyupHandler(termBufSizeInput, this.sizeInputHandler);
	
		this.terminalTimestampBtnEnable(terminalBtnTimestamp); //default behaviour
		terminalBtnTimestamp.on('click', function(){
			if(terminalBtnTimestamp.attr('aria-pressed') === "true"){
				//if it is enabled then disable it
				this.terminalTimestampBtnDisable(terminalBtnTimestamp);
			} else {
				this.terminalTimestampBtnEnable(terminalBtnTimestamp);
			}
		});
	
		this.terminalFormattedEnable(terminalBtnFormatted); //default behaviour
		terminalBtnFormatted.on('click', function(){
			if(terminalBtnFormatted.attr('aria-pressed') === "true"){
				//if it is enabled then disable it
				this.terminalFormattedDisable(terminalBtnFormatted);
			} else {
				this.terminalFormattedEnable(terminalBtnFormatted);
			}
		});
	
		this.terminalDecimalMode(terminalBtnDataMode);
		terminalBtnDataMode.on('click', function(){
			if(terminalBtnDataMode.attr('aria-pressed') === "true"){
				//if it is enabled then disable it
				this.terminalDecimalMode(terminalBtnDataMode);
			} else {
				this.terminalHexMode(terminalBtnDataMode);
			}
		});
	}
	
	sizeInputHandler() {
		this.termSize = termBufSizeInput.val();
		if(this.termSize > MAX_TERM_LINES){
			this.termSize = MAX_TERM_LINES;
		} else if(this.termSize < MIN_TERM_LINES){
			this.termSize = MIN_TERM_LINES;
		}
		this.changeSize();
	}

	changeSize() {
		while(this.countTermLines > this.termSize){
			this.terminalSel.children().last().remove();
			this.countTermLines = this.countTermLines - 1;
		}
	}

	clear() {
		this.terminalSel.empty();
		this.terminalSel.append('<span>terminal cleared</span>');
		this.countTermLines = 0;
	}

	time() {
		let timeStr = "";
		if (terminalBtnTimestamp.attr('aria-pressed') === "true") {
			let dataTime; //we get the time of the last data received
			if(this.formattedMode){
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

	valueToString(val){
		let str = "";
		if (this.termDataMode === DataModesEnum.Hex) {
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
	
	format() {
		let termLine = '';
		if (this.formattedMode) {
			if(dataSerialBuff.length >= numberOfDatasets){
				for (let index = 0; index < numberOfDatasets; index++) {
					termLine += '<span'
					//termLine += 'style="color:' + myChart.data.datasets[index].backgroundColor + '"'
					termLine += '>';
					termLine += this.valueToString(dataSerialBuff[index]); //takes care of the base (dec or hex)
					termLine += '</span>';
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

	print(text) {
		if (text !== '\r\n') { // do not print empty lines please
			if (this.countTermLines == 0) {
				this.terminalSel.empty(); //erases the "terminal cleared" on print
			}
			this.terminalSel.prepend('<span>' + this.time() + text + '</span>'); //put first on top
			this.countTermLines = this.countTermLines + 1;
			$('#clearPortBtn').prop('disabled', false);
		}
		if (this.countTermLines > this.termSize) {
			this.terminalSel.children().last().remove();
			this.countTermLines = this.countTermLines - 1;
		}
	}

	update() {
		if(this.termSize > 0) { //plotOnPause() == false && 
			let dataString = this.format();
			this.print(dataString);
		}
	}

	/*
	*	UI handlers
	*/

	terminalTimestampBtnEnable(elem) {
		elem.attr('aria-pressed', 'true');
		elem.removeClass('btn-warning');
		elem.addClass('btn-success');
	}

	terminalTimestampBtnDisable(elem) {
		elem.attr('aria-pressed', 'false');
		elem.removeClass('btn-success');
		elem.addClass('btn-warning');
	}

	terminalHexMode(elem) {
		elem.attr('aria-pressed', 'true');
		elem.removeClass('btn-default');
		elem.addClass('btn-success');
		elem.html('<i class="fa-solid fa-code"></i>&nbsp;Hexadecimal');
		this.termDataMode = DataModesEnum.Hex;
	}
	
	terminalDecimalMode(elem) {
		elem.attr('aria-pressed', 'false');
		elem.removeClass('btn-success');
		elem.addClass('btn-default');
		elem.html('<i class="fa-solid fa-arrow-down-1-9"></i></i>&nbsp;Decimal');
		this.termDataMode = DataModesEnum.Decimal;
	}

	terminalFormattedEnable(elem) {
		elem.attr('aria-pressed', 'true');
		elem.removeClass('btn-warning');
		elem.addClass('btn-success');
		elem.html('<i class="fa-solid fa-droplet"></i>&nbsp;Formatted');
		this.formattedMode = true;
	}
	
	terminalFormattedDisable(elem) {
		elem.attr('aria-pressed', 'false');
		elem.removeClass('btn-success');
		elem.addClass('btn-warning');
		elem.html('<i class="fa-solid fa-droplet-slash"></i>&nbsp;Raw Data');
		this.formattedMode = false;
	}
}