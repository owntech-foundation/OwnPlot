//var port = "/dev/cu.usbserial-11220";

const { SerialPort } = require('serialport')

// Create a port
const port = new SerialPort({
	path: '/dev/cu.usbserial-11220',
	baudRate: 115200,
})

port.on("open", function() {
	console.log("-- Connection opened --");
	port.on("data", function(data) {
		console.log("Data received: " + data);
	});
});