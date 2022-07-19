/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-08 15:06:14
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-07-19 18:13:00
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
		document.getElementById('ports').innerHTML = tableHTML

		if (availableSerialPortsLength !=  ports.length) {
			console.log("Ports changed !")
			console.log(ports)
			lpHTML = '<option value="default" selected>Select a port...</option>';
			availableSerialPortsLength = ports.length;
			availableSerialPorts = ports //copy of array to access anywhere
			ports.forEach(p => {
				lpHTML += ('<option value="' + p.path + '">' + p.path + '</option>');
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

listPorts();

function openPort() {
		port = new SerialPort({
		path: configSerialPlot.path,
		baudRate: 115200,
		autoOpen: false,
	});
	//TODO: do something about the ressource busy thing
	openPortRoutine();
}

//const separator = 58; //:
const endCom = [13, 10];
let pendingData = [];
let currentData = [];

function openPortRoutine(){
	if (typeof port !== 'undefined')
	{
		//console.log("port exist");
		//TODO: finish the pending packet thing
		port.open(function (err) {
			if (err) {
			  return console.log('Error opening port: ', err.message);
			}
		});
		port.on('open', function() {
			console.log("-- Connection opened on port " + port.path + " --");
			openPortBtn('#openPortBtn');
			runBtn('#pauseBtn');
		});

		port.on("data", function(data) {
			let clone = [...data]
			currentData = [];
			currentData = pendingData.concat(clone);
			pendingData = []; //flush the pending data buffer
			if (currentData[currentData.length - 2 ] != endCom[0] ||
				currentData[currentData.length - 1 ] != endCom[1]) //if the last chars are NOT \r \n
			{
				console.log("Packet not complete");
				pendingData = currentData; //add the prev pendingdat
			}
			else
			{
				console.log(currentData);
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
				dataSerialBuff = dataSerial;
			}
			//console.log("data :");
			//console.log(data);
		});
	}
}
