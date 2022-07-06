// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { SerialPort } = require('serialport')
const tableify = require('tableify')
let prevPorts

async function checkPorts(){
	await SerialPort.list().then((ports) => {
		console.log("==== ports showdown ====")
		console.log(prevPorts)
		console.log(ports)
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
      document.getElementById('error').textContent = err.message
      return
    } else {
      document.getElementById('error').textContent = ''
    }
    console.log('ports', ports);

    if (ports.length === 0) {
      document.getElementById('error').textContent = 'No ports discovered'
    }

    tableHTML = tableify(ports)
    document.getElementById('ports').innerHTML = tableHTML

	lpHTML = ""
	ports.forEach(p => {
		lpHTML += ('<option value="' + p.path + '">' + p.path + '</option>')
	});

	document.getElementById('AvailablePorts').innerHTML = lpHTML;
  })
}

async function printSerialPort(){
	await SerialPort.list
}

// function listPorts() {
// 	if (checkPorts()) {
// 		listSerialPorts();
// 	}
//   setTimeout(listPorts, 2000);
// }

// Set a timeout that will check for new serialPorts every 2 seconds.
// This timeout reschedules itself.
// setTimeout(listPorts, 2000);

//listSerialPorts()

const port = new SerialPort({
	path: '/dev/cu.usbserial-1220',
	baudRate: 115200,
})


//const separator = 58; //:
const endCom = [13, 10];
let pendingData = [];
let currentData = [];

//TODO: finish the pending packet thing
port.on("open", function() {
	console.log("-- Connection opened --");
	port.on("data", function(data) {
		console.log("========================");

		currentData = [];
		currentData = data;
		console.log(currentData);

		if (currentData[currentData.length - 2 ] != endCom[0] || currentData[currentData.length - 1 ] != endCom[1])
		{
			console.log("Packet not complete");
			pendingData = currentData; //add the prev pendingdata
			console.log("Pending data :");
			console.log(pendingData);
		}
		else
		{
			pendingData = []; //flush the pending data buffer
			let dataSerial = []; //flush dataSerial buffer
			let dataStart = 0;
			for (let i = 0; i < data.length; i++) {
				if (data[i] == configSerialPlot.separator.charCodeAt(0) ||
				(data[i] == endCom[0] && data[i + 1] == endCom[1]))
				{
					dataSerial.push(data.slice(dataStart, i));
					dataStart = i + 1;
				}
			}
			dataSerialBuff = dataSerial;
		}
		console.log("data :");
		console.log(data);
	});
});