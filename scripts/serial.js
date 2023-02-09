/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-09-07 14:01:57
 * @ Description:
 */

const { SerialPort } = require('serialport');
const tableify = require('tableify');
const { DataTable } = require('datatables.net');
let port;
let portHaveChanged;

let byteSkip = false;
const endCom = [13, 10]; //ascii for \r & \n
let pendingData = Buffer.alloc(0);
let timeBuff = [];

const customBaudRateField = $("#customBaudRateInput");
let separatorField = $("#separator");
let nbTypeField = $("#nbType");
let endiannessField = $("#endianness");
let dataFormatField = $("#dataFormat");

let asciiForm = $("#asciiForm");
let binaryForm = $("#binaryForm");
const baudRateSelect = $("#baudRateSelect");
const customBaudRateForm = $("#customBaudRateForm");
//let customForm = $("#customForm");

let skipByteBtn = $("#skipByteBtn");

let configSerialPlot = {
	dataFormat: 'ascii',
	separator: ':',
	path: "",
	nbType: "uint8",
	nbSize: 2,
	endianness: 'LE',
	baudRate: 115200
};

function switchDataForms(){
	$(asciiForm).hide();
	$(binaryForm).hide();
	//$(customForm).hide();
	switch(configSerialPlot.dataFormat){
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
	listSerialPorts();
	dataFormatField.on('change', function(){
		configSerialPlot.dataFormat = dataFormatField.children("option:selected").val();
		switchDataForms();
	});
	
	separatorField.val(configSerialPlot.separator);
	separatorField.on('input', function(){
		if (separatorField.val().length > 0) {
			configSerialPlot.separator = separatorField.val()[0]; //first char in the separator field
		}
	});

	baudRateSelect.on('change',function(){
		if (baudRateSelect.val() == "Custom"){
			configSerialPlot.baudRate = parseInt(customBaudRateField.val());
			if(port.isOpen){
				port.close();
				openPort(configSerialPlot.baudRate);
			}
		}
		else {
			configSerialPlot.baudRate = parseInt(baudRateSelect.children("option:selected").val());
			if(port.isOpen){
				port.close();
				openPort(configSerialPlot.baudRate);
			}
		}
	});

	customBaudRateField.val(configSerialPlot.baudRate);
	customBaudRateField.on('input', function(){
		if (customBaudRateField.val().length > 0) {
			configSerialPlot.baudRate = parseInt(customBaudRateField.val());
			if(port.isOpen){
				port.close();
				openPort(configSerialPlot.baudRate);
			}
		}
	});

	enterKeyupHandler(separatorField, function(){
		if (separatorField.val().length > 0) {
			configSerialPlot.separator = separatorField.val()[0]; //first char in the separator field
		}
	});

	nbTypeField.on('change',function(){
		configSerialPlot.nbType = nbTypeField.children("option:selected").val();
		switch (configSerialPlot.nbType) {
			case "uint8":
			case "int8":
				configSerialPlot.nbSize = 1;
				break;
			case "uint16":
			case "int16":
				configSerialPlot.nbSize = 2;
				break;
			case "uint32":
			case "int32":
			case "float":
				configSerialPlot.nbSize = 4;
				break;
			case "double":
				configSerialPlot.nbSize = 8;
				break;
			default:
				configSerialPlot.nbSize = 1;
		}
		//not available in this version: printDebugTerminal("number size is now " + configSerialPlot.nbSize + " bytes");
	});

	endiannessField.on('change',function(){
		configSerialPlot.endianness = endiannessField.children("option:selected").val();
	});

});

//Check if ports changed from the last time
//If it's the first time this function is executed, 
//then it will count as a port changed
async function checkPortsChanged(){
	await SerialPort.list().then((updatedPorts, err) => {
		if(err) {
			//not available in this version: printDebugTerminal(err);
			return;
		}
		if (arraysEqual(availableSerialPorts, updatedPorts)) {
			portHaveChanged = false;
		} else {
			availableSerialPorts = updatedPorts;
			portHaveChanged = true;
		}
	})
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
	port = new SerialPort({
		path: configSerialPlot.path,
		baudRate: baudRate,
		autoOpen: false,
	});
	openPortRoutine();
}

function openPortRoutine() {
	if (typeof port !== 'undefined')
	{
		port.open((err) => {
			if (err) {
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
			flushChart(myChart);
			chartStartTime = Date.now();
			portIsOpen = true;
		});

		port.on('close', () => {
			pauseBtn('#pausePortBtn');
			$('#pausePortBtn').prop('disabled', true);
			$('#startRecordBtn').prop("disabled", true);
			//not available in this version: printDebugTerminal("-- Connection closed on port " + port.path + " --");
			closePortBtn($('#openPortBtn'));
			disableSend();
			listSerialPorts();
			portIsOpen = false;
		});

		port.on("data", (data) => {
			flushBuff();
			timeBuff.push(Date.now());
			rawDataBuff = data;
			switch(configSerialPlot.dataFormat){
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
			updateTerminal();
			writeToExport(dataSerialBuff, timeBuff);
		});

		skipByteBtn.on('click', () => {
			byteSkip=true;
		});
	}
}

function flushBuff(){
	if(dataSerialBuff.length >= numberOfDatasets){
		dataSerialBuff = [];
		timeBuff = [];
	}
}

function bufferizeCustom(data){
	//TODO: implement custom data format
}

function bufferizeBinary(data){
	pendingData = Buffer.concat([pendingData, data]);
	if(byteSkip){
		pendingData = pendingData.subarray(1, pendingData.length);
		byteSkip=false;
	}

	let dataSerial = []; //flush dataSerial buffer
	//we only read data from the port when there is at least one data for each channel
	//else, the first dataset only gets filled
	if (pendingData.length >= configSerialPlot.nbSize*numberOfDatasets) {
		for (let i=0; i<=configSerialPlot.nbSize*(numberOfDatasets-1); i+=configSerialPlot.nbSize) {
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
			if (pendingData[i] == configSerialPlot.separator.charCodeAt(0) ||
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
	if (configSerialPlot.endianness == 'LE') {
		switch (configSerialPlot.nbType) {
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
		switch (configSerialPlot.nbType) {
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
