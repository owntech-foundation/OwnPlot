/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-08 15:06:14
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-07-28 10:32:50
 */

const { SerialPort } = require('serialport');
const tableify = require('tableify');
let prevPorts;
let port;

let byteSkip = false;
const endCom = [13, 10]; //ascii for \r & \n
let pendingData = Buffer.alloc(0);

let separatorField = $("#separator");
let nbTypeField = $("#nbType");
let endiannessField = $("#endianness");
let dataFormatField = $("#dataFormat");

let asciiForm = $("#asciiForm");
let binaryForm = $("#binaryForm");
let customForm = $("#customForm");

let skipByteBtn = $("#skipByteBtn");

let configSerialPlot = {
	dataFormat: 'ascii',
	separator: ':',
	path: "",
	nbType: "uint8",
	nbSize: 2,
	endianness: 'LE'
};

function switchDataForms(){
	$(asciiForm).hide();
	$(binaryForm).hide();
	$(customForm).hide();
	switch(configSerialPlot.dataFormat){
		case 'binary':
			binaryForm.show();
			break;
		case 'custom':
			customForm.show();
			break;
		case 'ascii':
		default:
			asciiForm.show();
			break;
	}
}

$(function(){
	switchDataForms();
	dataFormatField.on('change', function(){
		configSerialPlot.dataFormat = dataFormatField.children("option:selected").val();
		switchDataForms();
		console.log("data format changed to " + configSerialPlot.dataFormat);
	});
	
	separatorField.val(configSerialPlot.separator);
	separatorField.on('input',function(){
		if (separatorField.val().length > 0) {
			configSerialPlot.separator = separatorField.val()[0]; //first char in the separator field
		}
	});

	nbTypeField.on('change',function(){
		configSerialPlot.nbType = nbTypeField.children("option:selected").val();
		console.log("nbType changed to " + configSerialPlot.nbType);
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
		console.log("nb size is now " + configSerialPlot.nbSize + " bytes");
	});

	endiannessField.on('change',function(){
		configSerialPlot.endianness = endiannessField.children("option:selected").val();
		console.log("endianness changed to " + configSerialPlot.endianness);
	});
});

//Check if ports changed from the last time
//If it's the first time this function is executed, 
//then it will count as a port changed
async function checkPortsChanged(){
	await SerialPort.list().then((ports) => {
		if (prevPorts == ports) {
			return false;
		}
		prevPorts = ports;
		return true;
	})
}

//Everytime a port change, this code is executed
async function listSerialPorts(){
	await SerialPort.list().then((ports, err) => {
		if(err) {
			document.getElementById('#error').textContent = err.message;
			return;
		} else {
			document.getElementById('error').textContent = '';
		}

		if (ports.length === 0) {
			document.getElementById('error').textContent = 'No ports discovered';
		}

		tableHTML = tableify(ports);
		document.getElementById('ports').innerHTML = tableHTML;

		if (availableSerialPortsLength !=  ports.length) {
			let lpHTML = '<option value="default" selected>Select a port...</option>';
			availableSerialPortsLength = ports.length;
			availableSerialPorts = ports; //copy of array to access anywhere
			ports.forEach(p => {
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
			document.getElementById('AvailablePorts').innerHTML = lpHTML;
		}
	})
}

//list ports loop
async function listPorts() {
	if (checkPortsChanged()) {
		listSerialPorts();
	}
	setTimeout(listPorts, 2000);
}

function openPort() {
	port = new SerialPort({
		path: configSerialPlot.path,
		baudRate: 115200,
		autoOpen: false,
	});
	openPortRoutine();
}

function openPortRoutine() {
	if (typeof port !== 'undefined')
	{
		port.open((err) => {
			if (err) {
				return console.log('Error opening port: ', err.message);
			}
		});

		port.on('open', () => {
			console.log("-- Connection opened on port " + port.path + " --");
			openPortBtn('#openPortBtn');
			runBtn('#pauseBtn');
			enableSend();
			flushChart(myChart);
		});

		port.on('close', () => {
			pauseBtn('#pauseBtn');
			$('#pauseBtn').addClass('disabled');
			console.log("-- Connection closed on port " + port.path + " --");
			closePortBtn($('#openPortBtn'));
			disableSend();
			listSerialPorts();
		});

		port.on("data", (data) => {
			switch(configSerialPlot.dataFormat){
				case "binary":
					bufferizeBinary(data);
					break;
				case "custom":
					bufferizeCustom(data);
					break;
				case "ascii":
				default:
					bufferizeAscii(data);
					break;
			}
		});

		skipByteBtn.on('click', () => {
			byteSkip=true;
		});
	}
}

function bufferizeCustom(data){
	//TODO: implement custom data format
}

function bufferizeBinary(data){
	let currentData = Buffer.concat([pendingData, data]);
	if(byteSkip){
		currentData = currentData.subarray(1, currentData.length);
		byteSkip=false;
	}
	pendingData = Buffer.alloc(0); //flush the pending data buffer

	let dataSerial = []; //flush dataSerial buffer
	//we only read data from the port when there is at least one data for each channel
	//else, the first dataset only gets filled
	if (currentData.length >= configSerialPlot.nbSize*numberOfDatasets) {
		for (let i=0; i<=configSerialPlot.nbSize*(numberOfDatasets-1); i+=configSerialPlot.nbSize) {
			dataSerial.push(readBuf(currentData, i));
		}
		dataSerialBuff = dataSerial;
		currentDataBuff = data;
	} else {
		pendingData = currentData;
	}
	
}

function bufferizeAscii(data){
	let currentData = Buffer.concat([pendingData, data]);
	pendingData = Buffer.alloc(0); //flush the pending data buffer

	if (currentData[currentData.length - 2 ] != endCom[0] ||
		currentData[currentData.length - 1 ] != endCom[1])
	{
		//if the last chars are NOT \r \n
		//therefore the packet is not complete
		//we stash the currentdata in pending data
		pendingData = currentData;
	}
	else
	{
		let dataSerial = []; //flush dataSerial buffer
		let dataStart = 0;
		for (let i = 0; i < currentData.length; i++) {
			if (currentData[i] == configSerialPlot.separator.charCodeAt(0) ||
			(currentData[i] == endCom[0] && currentData[i + 1] == endCom[1]))
			{
				dataSerial.push(currentData.slice(dataStart, i));
				dataStart = i + 1;
			}
		}
		currentDataBuff = currentData;
		dataSerialBuff = dataSerial;
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
