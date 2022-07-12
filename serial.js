/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-08 15:06:14
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-07-12 11:11:59
 */

const { SerialPort } = require('serialport')
const tableify = require('tableify');
let prevPorts

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

		if (availableSerialPortsLenght !=  ports.length) {
			console.log("Ports changed !")
			console.log(ports)
			lpHTML = ""
			availableSerialPortsLenght = ports.length;
			availableSerialPorts = ports //copy of array to access anywhere
			ports.forEach(p => {
				lpHTML += ('<option value="' + p.path + '">' + p.path + '</option>')
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