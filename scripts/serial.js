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
let loopBtn = $('#fileLoopBtn');
let fileSelectionBtn = $('#fileSelectionBtn');
let selectedFile;

let fileReaderInterval;
let interval = $('#intervalTime');
let intervalValue = 100;



let configSerialPort = { //configSerialPort ?
	dataFormat: 'ascii',
	separator: ':',
	path: "",
	nbType: "uint8",
	nbSize: 2,
	endianness: 'LE',
	baudRate: 115200
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//MOCK PORTS CREATION
const { SerialPortMock } = require('serialport');

const mockpath1 = 'Mock Port 1 : Sinus Signal'
const mockpath2 = 'Mock Port 2 : Triangle Signal'
const mockpath3 = 'Mock Port 3 : Square Signal'
const mockpath4 = 'Mock Port 4 : File Reader'

SerialPortMock.binding.createPort(mockpath1)
SerialPortMock.binding.createPort(mockpath2)
SerialPortMock.binding.createPort(mockpath3)
SerialPortMock.binding.createPort(mockpath4)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MOCK PORTS FUNCTIONS

function mockSinusGenerator() {
	const numSignals = 8; // Number of sinus signals
	const frequency = 0.2; // Frequency in Hertz
	const amplitude = 1; // Amplitude

	const startTime = Date.now();

	function mockSendSinusData() {
		sinusInterval = setInterval(() => {
			let signalValues = ""; // Initialize the string to store signal values
			const elapsedTime = Date.now() - startTime;
	
			for (let i = 0; i < numSignals; i++) {
				const phaseShift = (i * (2 * Math.PI)) / numSignals;
				const value = amplitude*Math.sin( 2*Math.PI*frequency*(elapsedTime/1000) + phaseShift); // Calculate sinus signal value
				signalValues += value.toFixed(3); // Append the value to the string
	
				if (i !== numSignals - 1) {
					  signalValues += ":"; // Add ":" as separator between values (except for the last one)
				}
			}
	
			const sinusBuffer = Buffer(`${signalValues}\r\n`); // Create the buffer with signal values
			port.port.emitData(sinusBuffer); // Emit the buffer
		}, intervalValue);
	}
	mockSendSinusData();
}

function mockTriangleGenerator() {
	const numSignals = 8; // Number of sinus signals
	const frequency = 0.1; // Frequency in Hertz
	const amplitude = 1; // Amplitude

	const startTime = Date.now();

	function mockSendTriangleData() {
		triangleInterval = setInterval(() => {
			let signalValues = ""; // Initialize the string to store signal values
			const elapsedTime = Date.now() - startTime;
	
			for (let i = 0; i < numSignals; i++) {
				const period = 1 / frequency;
				const time = (elapsedTime / 1000) % period;
				const phaseShift = i / numSignals;
				const value = amplitude*2*Math.abs((2*time / period + phaseShift) - Math.floor((2*time / period + phaseShift) + 1 / 2)); // Calculate triangle signal value
				signalValues += value.toFixed(3); // Append the value to the string
	
				if (i !== numSignals - 1) {
					  signalValues += ":"; // Add ":" as separator between values (except for the last one)
				}
			}
	
			const triangleBuffer = Buffer(`${signalValues}\r\n`); // Create the buffer with signal values
			port.port.emitData(triangleBuffer); // Emit the buffer
		}, intervalValue);
	}
	mockSendTriangleData();
}

function mockSquareGenerator() {
	const numSignals = 8; // Number of sinus signals
	const frequency = 0.2; // Frequency in Hertz
	const amplitude = 1; // Amplitude

	const startTime = Date.now();

	function mockSendSquareData() {
		squareInterval = setInterval(() => {
			let signalValues = ""; // Initialize the string to store signal values
			const elapsedTime = Date.now() - startTime;
	
			for (let i = 0; i < numSignals; i++) {
				const phaseShift = (i * (2 * Math.PI)) / numSignals;
				const value = amplitude * Math.sign(Math.sin(2 * Math.PI * frequency * (elapsedTime / 1000) + phaseShift)); // Calculate sinus signal value
				signalValues += value.toFixed(3); // Append the value to the string
	
				if (i !== numSignals - 1) {
					  signalValues += ":"; // Add ":" as separator between values (except for the last one)
				}
			}
	
			const squareBuffer = Buffer(`${signalValues}\r\n`); // Create the buffer with signal values
			port.port.emitData(squareBuffer); // Emit the buffer
		}, intervalValue);
	}
	mockSendSquareData();
}

function mockFileReader() {
	let filePath = selectedFile.path;

	let fileLines = fs.readFileSync(filePath, 'utf-8').split('\n');
	let fileLineNumber = 1;

	function mockReadFile() {
		fileReaderInterval = setInterval(() => {
			if (fileLineNumber >= fileLines.length-1) {
				clearInterval(fileReaderInterval);
				if (loopBtn.attr('aria-pressed') === "true") {
					mockFileReader();
				}
				return;
			}
			const line = fileLines[fileLineNumber];
			const values = line.split(',').map(Number);
			const data = values.slice(1);

            const buffer = Buffer.from(data.join(':') + '\r\n');
            port.port.emitData(buffer);

            fileLineNumber++;
		}, intervalValue);
	}
	mockReadFile();
}

function fileSelect() {
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
	fileInput.accept = '.csv, .txt';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', handleFileSelection);
    document.body.appendChild(fileInput);
    fileInput.click();
}

function handleFileSelection(event) {
    selectedFile = event.target.files[0];

    if (selectedFile === undefined) {
        $('#openPortBtn').prop('disabled', true);
    } else {
        $('#openPortBtn').prop('disabled', false);
    }

    // Check if file is a .csv or .txt
    const allowedExtensions = [".csv", ".txt"];
    const fileExtension = selectedFile.name.split('.').pop();
    if (!allowedExtensions.includes("." + fileExtension)) {
        const userConfirmation = confirm("Only .csv or .txt files are supported. Do you still wish to continue?");

        if (userConfirmation) {
            let selectedFileNameElement = document.getElementById('selectedFileName');
            selectedFileNameElement.textContent = selectedFile.name;
            $('#openPortBtn').prop('disabled', false);
        } else {
            $('#openPortBtn').prop('disabled', true);
            // Clear the selected file
            event.target.value = '';
            // Clear the displayed file name
            let selectedFileNameElement = document.getElementById('selectedFileName');
            selectedFileNameElement.textContent = '';
        }
    } else {
        let selectedFileNameElement = document.getElementById('selectedFileName');
        selectedFileNameElement.textContent = selectedFile.name;
        $('#openPortBtn').prop('disabled', false);
    }
}


function fileLoopBtnEnable(elem) {
	elem.attr('aria-pressed', 'true');
	elem.removeClass('btn-warning');
	elem.addClass('btn-success');
}

function fileLoopBtnDisable(elem) {
	elem.attr('aria-pressed', 'false');
	elem.removeClass('btn-success');
	elem.addClass('btn-warning');
}

function enableButtons() {
	loopBtn.prop('disabled', false);
	fileSelectionBtn.prop('disabled', false);
}

function disableButtons() {
	loopBtn.prop('disabled', true);
	fileSelectionBtn.prop('disabled', true);
}