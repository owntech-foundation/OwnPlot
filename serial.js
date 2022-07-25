/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-08 15:06:14
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-07-25 10:12:18
 */

const { SerialPort } = require('serialport');
const tableify = require('tableify');
let prevPorts;
let port;

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
		document.getElementById('#error').textContent = err.message
		return
		} else {
		document.getElementById('error').textContent = ''
		}

		if (ports.length === 0) {
		document.getElementById('error').textContent = 'No ports discovered'
		}

		tableHTML = tableify(ports)
		document.getElementById('ports').innerHTML = tableHTML;

		if (availableSerialPortsLength !=  ports.length) {
			console.log("Ports changed !");
			console.log(ports);
			let lpHTML = '<option value="default" selected>Select a port...</option>';
			availableSerialPortsLength = ports.length;
			availableSerialPorts = ports; //copy of array to access anywhere
			ports.forEach(p => {
				//if we were on a port when ports changed, we select in the list the current port
				if (port){
					if(port.path == p.path){
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
function listPorts() {
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

const endCom = [13, 10];
let pendingData = Buffer.alloc(0);

function openPortRoutine(){
	if (typeof port !== 'undefined')
	{
		port.open(function (err) {
			if (err) {
				return console.log('Error opening port: ', err.message);
			}
		});

		port.on('open', function() {
			console.log("-- Connection opened on port " + port.path + " --");
			openPortBtn('#openPortBtn');
			runBtn('#pauseBtn');
			flushChart(myChart);
		});

		port.on('close', () => {
			pauseBtn('#pauseBtn');
			$('#pauseBtn').addClass('disabled');
			console.log("-- Connection closed on port " + port.path + " --");
			closePortBtn($('#openPortBtn'));
			listSerialPorts();
		});

		port.on("data", function (data) {
			let dataSerial = []; //flush dataSerial buffer
			for (let i=0; i<=data.length-configSerialPlot.nbSize; i+=configSerialPlot.nbSize) {
				dataSerial.push(readBuf(data, i));
			}
			dataSerialBuff = dataSerial;
			currentDataBuff = data;
		})

		// port.on("data", function(data) {
		// 	let currentData = Buffer.concat([pendingData, data]);
		// 	pendingData = Buffer.alloc(0); //flush the pending data buffer

		// 	if (currentData[currentData.length - 2 ] != endCom[0] ||
		// 		currentData[currentData.length - 1 ] != endCom[1])
		// 	{
		// 		//if the last chars are NOT \r \n
		// 		//therefore the packet is not complete
		// 		//we stash the currentdata in pending data
		// 		pendingData = currentData;
		// 	}
		// 	else
		// 	{
		// 		let dataSerial = []; //flush dataSerial buffer
		// 		let dataStart = 0;
		// 		for (let i = 0; i < currentData.length; i++) {
		// 			if (currentData[i] == configSerialPlot.separator.charCodeAt(0) ||
		// 			(currentData[i] == endCom[0] && currentData[i + 1] == endCom[1]))
		// 			{
		// 				dataSerial.push(currentData.slice(dataStart, i));
		// 				dataStart = i + 1;
		// 			}
		// 		}
		// 		currentDataBuff = currentData;
		// 		dataSerialBuff = dataSerial;
		// 	}
		// });
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