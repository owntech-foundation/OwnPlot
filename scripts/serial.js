/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-09-07 14:01:57
 * @ Description:
 */

//const fs = require('fs'); // do not include or it will break this script
const { SerialPort } = require('serialport');
const tableify = require('tableify');
const { DataTable } = require('datatables.net');

/*
 *	UI handlers
 */

// -------------------------------------- //


/*
 *	JQuery selectors
 */

const customBaudRateField = $("#customBaudRateInput");
const baudRateSelect = $("#baudRateSelect");
const customBaudRateForm = $("#customBaudRateForm");
const upRecordRadio = $("#upRecordRadio");//moved from shared.js
const timestampRecordCheck = $("#timestampRecordCheck");//moved from shared.js
const sPrecisionTimestampRecordRadio = $("#sPrecisionTimestampRecordRadio");//moved from shared.js

let separatorField = $("#separator");
let nbTypeField = $("#nbType");
let endiannessField = $("#endianness");
let dataFormatField = $("#dataFormat");
let asciiForm = $("#asciiForm");
let binaryForm = $("#binaryForm");
let skipByteBtn = $("#skipByteBtn");
/*
let loopBtn = $('#fileLoopBtn');
let fileSelectionBtn = $('#fileSelectionBtn');
let interval = $('#intervalTime');
*/

// -------------------------------------- //


const RECORD_MAX_SIZE = Math.pow(10,9); //max 1Gb of recorded data //moved from shared.js
const endCom = [13, 10]; //ascii for \r & \n

let recording = false;    //moved from shared.js
let absTimeRecord = false;//moved from shared.js
let recordStartTime;      //moved from shared.js
let textToExport = "";    //moved from shared.js
let recordSeparator = ",";//moved from shared.js

let port;
let portHaveChanged;
let byteSkip = false;
let pendingData = Buffer.alloc(0);
let timeBuff = [];
//let customForm = $("#customForm");
//let selectedFile;
//let fileReaderInterval;
//let intervalValue = 100;

let configSerialPort = { //configSerialPort ?
	dataFormat: 'ascii',
	separator: ':',
	path: "",
	nbType: "uint8",
	nbSize: 2,
	endianness: 'LE',
	baudRate: 115200
};

// -------------------------------------- //


function switchDataForms(){
	$(asciiForm).hide();
	$(binaryForm).hide();
	//$(customForm).hide();
	switch(configSerialPort.dataFormat){
		case 'binary':
			binaryForm.show();
			break;
		// case 'custom':
		// 	customForm.show();
		// 	break;
		case 'ascii':
		default:
			asciiForm.show();
			break;
	}
}

function updateCustomBaudRateVisibility() {
    $("#baudRateSelect option:selected").each(function() {
        if ($( this ).val() == "Custom") {
            customBaudRateForm.show();
        } else {
            customBaudRateForm.hide();
        }
    });
}

$(()=>{
	switchDataForms();
	updateCustomBaudRateVisibility();
	baudRateSelect.change(function() {
        updateCustomBaudRateVisibility();
    })
/*
	interval.on("input", function() {
        if(interval.val().length > 1){
            intervalValue = parseInt(interval.val());
        }
	})

	disableButtons();

	fileSelectionBtn.on('click', function() {
		if (port && port.path === mockpath4 && fileReaderInterval) {
			clearInterval(fileReaderInterval); // Stop the file reader
			port.close(); // Close the mock port
			closePortBtn($('#openPortBtn'));
			fileReaderInterval = null; // Reset the file reader interval
			fileSelect();
		} else {
			fileSelect();
		}
    });

	fileLoopBtnDisable(autoSendBtn);
	loopBtn.on('click', function() {
		if(loopBtn.attr('aria-pressed') === "true"){
			fileLoopBtnDisable(loopBtn);
		} else {
			fileLoopBtnEnable(loopBtn);
		}
	});
*/
	listSerialPorts();
	dataFormatField.on('change', function(){
		configSerialPort.dataFormat = dataFormatField.children("option:selected").val();
		switchDataForms();
	});
	
	separatorField.val(configSerialPort.separator);
	separatorField.on('input', function(){
		if (separatorField.val().length > 0) {
			configSerialPort.separator = separatorField.val()[0]; //first char in the separator field
		}
	});

	baudRateSelect.on('change',function(){
		if (baudRateSelect.val() == "Custom"){
			configSerialPort.baudRate = parseInt(customBaudRateField.val());
			if(port.isOpen){
				port.close();
				openPort(configSerialPort.baudRate);
			}
		}
		else {
			configSerialPort.baudRate = parseInt(baudRateSelect.children("option:selected").val());
			if(port.isOpen){
				port.close();
				openPort(configSerialPort.baudRate);
			}
		}
	});

	customBaudRateField.val(configSerialPort.baudRate);
	customBaudRateField.on('input', function(){
		if (customBaudRateField.val().length > 0) {
			configSerialPort.baudRate = parseInt(customBaudRateField.val());
			if(port.isOpen){
				port.close();
				openPort(configSerialPort.baudRate);
			}
		}
	});

	enterKeyupHandler(separatorField, function(){
		if (separatorField.val().length > 0) {
			configSerialPort.separator = separatorField.val()[0]; //first char in the separator field
		}
	});

	nbTypeField.on('change',function(){
		configSerialPort.nbType = nbTypeField.children("option:selected").val();
		switch (configSerialPort.nbType) {
			case "uint8":
			case "int8":
				configSerialPort.nbSize = 1;
				break;
			case "uint16":
			case "int16":
				configSerialPort.nbSize = 2;
				break;
			case "uint32":
			case "int32":
			case "float":
				configSerialPort.nbSize = 4;
				break;
			case "double":
				configSerialPort.nbSize = 8;
				break;
			default:
				configSerialPort.nbSize = 1;
		}
		//not available in this version: printDebugTerminal("number size is now " + configSerialPort.nbSize + " bytes");
	});

	endiannessField.on('change',function(){
		configSerialPort.endianness = endiannessField.children("option:selected").val();
	});

});

//Check if ports changed from the last time
//If it's the first time this function is executed, 
//then it will count as a port changed

async function checkPortsChanged() {
	let portList = await Promise.all([SerialPort.list(), SerialPortMock.list()]) //portlist is a array of arrays
	portList = portList.flat(); //portlist is now a simple array
	if (arraysEqual(availableSerialPorts, portList)) {
		portHaveChanged = false;
	}else {
		availableSerialPorts = portList;
		portHaveChanged = true;
	}
}

//Everytime a port change, this code is executed
function listSerialPorts(){
	if (availableSerialPorts == false || availableSerialPorts == undefined) {
		$('#AvailablePorts').html('<option value="default" selected>No port available</option>');
	} else {
		//not available in this version: printDebugPortInfo(availableSerialPorts);

		let lpHTML = '<option value="default" selected>Select a port...</option>';
		availableSerialPorts.forEach(p => {
			//if we were on a port when ports changed, we select in the list the current port
			if (port) {
				if(port.path == p.path) {
					lpHTML += ('<option value="' + p.path + '" selected>' + p.path + '</option>');
				} else {
					lpHTML += ('<option value="' + p.path + '">' + p.path + '</option>');
				}
			} else {
				lpHTML += ('<option value="' + p.path + '">' + p.path + '</option>');
			}
		});
		$('#AvailablePorts').html(lpHTML);


	}
}

function printDebugPortInfo(ports){
	let tableHTML = tableify(ports);
	tableHTML = "<table class='table table-hover' id='portTable'>" + tableHTML.substring(7, tableHTML.length); //"<table>".length = 7, we replace it to insert class & id
	$("#debugPortInfo").html(tableHTML);
	$("#portTable").DataTable({
		"paging": false,
		"searching": false,
		"info": false
	});
}

//list ports loop
async function listPorts() {
	await checkPortsChanged().then(()=>{
		if(portHaveChanged){
			listSerialPorts();
		}
	});
	setTimeout(listPorts, 2000);
}

function openPort(baudRate=115200) {
	if (configSerialPort.path.includes("Mock")) {
		port = new SerialPortMock({
			path : configSerialPort.path,
			baudRate : baudRate,
			autoOpen : false,
		});
	} else {
		port = new SerialPort({
			path : configSerialPort.path,
			baudRate : baudRate,
			autoOpen : false,
		});
	}

	openPortRoutine();
};

function openPortRoutine() {
	if (typeof port !== 'undefined')
	{
		port.open((err) => {
			if (err) {
				console.log('openPortRoutine error')
				console.log(err)
				return //not available in this version: printDebugTerminal('Error opening port: ', err.message);
			}
		});

		port.on('open', () => {
			//not available in this version: printDebugTerminal("-- Connection opened on port " + port.path + " --");
			openPortBtn('#openPortBtn');
			runBtn('#pausePortBtn');
			$('#clearPortBtn').show();
			$('#clearPortBtn').prop('disabled', false);
			$('#startRecordBtn').prop("disabled", false);
			enableSend();
			chart1.flushChart(); //TODO: fix this
			chartStartTime = Date.now();
			portIsOpen = true;

			//Sinus Generator
			if (port.path === mockpath1) {
				mockSinusGenerator();
			}
			//Triangle Generator
			if (port.path === mockpath2) {
				mockTriangleGenerator();
			}
			//Square Generator
			if (port.path === mockpath3) {
				mockSquareGenerator();
			}
			//File Reader
			if (port.path === mockpath4) {
				mockFileReader();
			}
  
		});

		port.on('close', () => {
			pauseBtn('#pausePortBtn');
			$('#pausePortBtn').prop('disabled', true);
			$('#startRecordBtn').prop("disabled", true);
			//not available in this version: printDebugTerminal("-- Connection closed on port " + port.path + " --");
			disableSend();
			portIsOpen = false;

			//Sinus Generator
			if (port.path === mockpath1) {
				clearInterval(sinusInterval);
			}
			//Triangle Generator
			if (port.path === mockpath2) {
				clearInterval(triangleInterval);
			}
			//Square Generator
			if (port.path === mockpath3) {
				clearInterval(squareInterval);
			}
			//File Reader
			if (port.path === mockpath4) {
				clearInterval(fileReaderInterval);
			}
		});

		port.on("data", (data) => {
			flushBuff();
			timeBuff.push(Date.now());
			rawDataBuff = data;
			switch(configSerialPort.dataFormat){
				case "binary":
					bufferizeBinary(data);
					break;
				// case "custom":
				// 	bufferizeCustom(data);
				// 	break;
				case "ascii":
				default:
					bufferizeAscii(data);
					break;
			}
			//term1.updateTerminal(); ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			//term2.updateTerminal(); ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

			writeToExport(dataSerialBuff, timeBuff);
			if (chart1.plotRunning === true) { ////////////////////////////////////////////////
				chart1.dataStructure.x.push(Date.now());
				chart1.dataStructure.y.push(dataSerialBuff);
			}
		});

		skipByteBtn.on('click', () => {
			byteSkip=true;
		});
	}
}

function writeToExport(dataBuf, timeBuff) {//moved from shared.js
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

function flushBuff(){
	if(dataSerialBuff.length >= chart1.numberOfDatasets){
		dataSerialBuff = [];
		timeBuff = [];
	}
}

function bufferizeCustom(data){
	//TODO: implement custom data format
}

function bufferizeBinary(data){
	pendingData = Buffer.concat([pendingData, data]);
	if(byteSkip) {
		pendingData = pendingData.subarray(1, pendingData.length);
		byteSkip=false;
	}

	let dataSerial = []; //flush dataSerial buffer
	//we only read data from the port when there is at least one data for each channel
	//else, the first dataset only gets filled
	if (pendingData.length >= configSerialPort.nbSize*chart1.numberOfDatasets) {
		for (let i=0; i<=configSerialPort.nbSize*(chart1.numberOfDatasets-1); i+=configSerialPort.nbSize) {
			dataSerial.push(readBuf(pendingData, i));
		}
		dataSerialBuff = dataSerial;
		pendingData = Buffer.alloc(0);
	}
}

function bufferizeAscii(data){
	pendingData = Buffer.concat([pendingData, data]);

	if (pendingData[pendingData.length - 2 ] == endCom[0] ||
		pendingData[pendingData.length - 1 ] == endCom[1])
	{
		//if the last chars are NOT \r \n
		//therefore the packet is not complete
		//we stash the pending data
		let dataSerial = [];
		let dataStart = 0;
		for (let i = 0; i < pendingData.length; i++) {
			if (pendingData[i] == configSerialPort.separator.charCodeAt(0) ||
			(pendingData[i] == endCom[0] && pendingData[i + 1] == endCom[1]))
			{
				dataSerial.push(pendingData.slice(dataStart, i));
				dataStart = i + 1;
			}
		}
		dataSerialBuff = dataSerial;
		pendingData = Buffer.alloc(0);
	}
}

function readBuf(buf, offset){
	if (configSerialPort.endianness == 'LE') {
		switch (configSerialPort.nbType) {
			case "uint8":
				return buf.readUInt8(offset);
			case "uint16":
				return buf.readUInt16LE(offset);
			case "uint32":
				return buf.readUInt32LE(offset);		
			case "int8":
				return buf.readInt8LE(offset);		
			case "int16":
				return buf.readInt16LE(offset);
			case "int32":
				return buf.readInt32LE(offset);
			case "float":
				return buf.readFloatLE(offset);
			case "double":
				return buf.readDoubleLE(offset);
			default:
				return buf[offset];
		}
	} else {
		switch (configSerialPort.nbType) {
			case "uint8":
				return buf.readUInt8(offset);
			case "uint16":
				return buf.readUInt16BE(offset);
			case "uint32":
				return buf.readUInt32BE(offset);		
			case "int8":
				return buf.readInt8BE(offset);		
			case "int16":
				return buf.readInt16BE(offset);
			case "int32":
				return buf.readInt32BE(offset);
			case "float":
				return buf.readFloatBE(offset);
			case "double":
				return buf.readDoubleBE(offset);
			default:
				return buf[offset];
		}
	}
}


$(document).ready(function() {

	var portCounter = 1;

	$("#addPortBtn").click(function() {
        portCounter++;

        var newPortDiv = $("#port1Section").clone(); // Create a new "port1SelectionDiv" by cloning the existing one

        // Update IDs and attributes to make them unique
        newPortDiv.attr("id", "port" + portCounter + "Section");

		newPortDiv.find(".collapseHead").attr("id", "port" + portCounter + "SelectionHref");
        newPortDiv.find(".collapseHead").attr("data-target", "#port" + portCounter + "SelectionDiv");
        newPortDiv.find(".collapseHead").attr("aria-controls", "port" + portCounter + "SelectionDiv");

		newPortDiv.find(".input-group-text").attr("id", "port" + portCounter + "SelectionTitle");
		newPortDiv.find(".port1SelectionTitle span").text("Port " + portCounter);

		newPortDiv.find(".collapse").attr("id", "port" + portCounter + "SelectionDiv");

		// Add a delete button to the new port section
		newPortDiv.append('<button class="btn btn-danger col-12 deletePortBtn" data-port="'+ portCounter +'">Delete Port</button>');

		console.log(newPortDiv)

        // Append the new port div after the last port div
        newPortDiv.insertBefore($("[id^='addPortBtn']:last"));
    });

	// Handle delete button click within cloned sections
	$(document).on("click", ".deletePortBtn", function() {
		var portToDelete = $(this).data("port");
		$("#port" + portToDelete + "Section").remove();

		// Decrement portCounter
		portCounter--;

		// Update the IDs and attributes of remaining sections
		for (var i = portToDelete + 1; i <= portCounter + 1; i++) {
			var portSection = $("#port" + i + "Section");
			portSection.attr("id", "port" + (i - 1) + "Section");
			portSection.find(".collapseHead").attr("id", "port" + (i - 1) + "SelectionHref");
			portSection.find(".collapseHead").attr("data-target", "#port" + (i - 1) + "SelectionDiv");
			portSection.find(".collapseHead").attr("aria-controls", "port" + (i - 1) + "SelectionDiv");
			portSection.find(".input-group-text").attr("id", "port" + (i - 1) + "SelectionTitle");
			portSection.find(".port1SelectionTitle span").text("Port " + (i - 1));
			portSection.find(".collapse").attr("id", "port" + (i - 1) + "SelectionDiv");
			portSection.find(".deletePortBtn").data("port", i - 1);
		}
	});
});