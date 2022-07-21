/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-08 15:06:14
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-07-20 18:30:41
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

		port.on("data", function(data) {
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
		});
	}
}
