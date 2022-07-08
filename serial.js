/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-08 15:06:14
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-07-08 17:03:07
 */

const { SerialPort } = require('serialport')
let prevPorts

async function checkPorts(){
await SerialPort.list().then((ports) => {
	// console.log("==== ports showdown ====")
	// console.log(prevPorts)
	// console.log(ports)
	if (prevPorts == ports) {
		console.log("false")
		return false;
	}
	prevPorts = ports;
	return true;
})
}

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

async function printSerialPort(){
	await SerialPort.list
}


function listPorts() {
	if (checkPorts()) {
		listSerialPorts();
	}
	setTimeout(listPorts, 2000);
}