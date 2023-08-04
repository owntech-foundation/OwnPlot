

const { SerialPortMock } = require('serialport');


/*
 *	JQuery selectors
 */

let loopBtn = $('#fileLoopBtn');
let fileSelectionBtn = $('#fileSelectionBtn');
let interval = $('#intervalTime');

// -------------------------------------- //


/*
 *	UI handlers
 */

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

// -------------------------------------- //


let selectedFile;
let intervalValue = 100;
let fileReaderInterval;

const mockpath1 = 'Mock Port 1 : Sinus Signal'
const mockpath2 = 'Mock Port 2 : Triangle Signal'
const mockpath3 = 'Mock Port 3 : Square Signal'
const mockpath4 = 'Mock Port 4 : File Reader'

SerialPortMock.binding.createPort(mockpath1)
SerialPortMock.binding.createPort(mockpath2)
SerialPortMock.binding.createPort(mockpath3)
SerialPortMock.binding.createPort(mockpath4)

$(() => {
    disableButtons();

    interval.on("input", function() {
        if(interval.val().length > 1){
            intervalValue = parseInt(interval.val());
        }
	})

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
});

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