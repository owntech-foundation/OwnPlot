/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-22 16:23:22
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-09-07 13:43:39
 * @ Description:
 */

let availableSerialPorts = [];
let selectedPort;
let isPortClosedMessageDisplayed;
let isPortOpenMessageDisplayed;
let portIsOpen = false; //moved from shared.js

//TODO: remove those
function pauseBtn(elem) {
	$(elem).html('<i class="fa-solid fa-pause"></i><br>Paused');
	$(elem).removeClass('btn-success');
	$(elem).removeClass('btn-secondary');
	$(elem).addClass('btn-warning');
	$(elem).attr('aria-pressed', true);
	$(elem).prop("disabled", false);
	chart1.pausePlot();
}

function runBtn(elem) {
	$(elem).html('<i class="fa-solid fa-running"></i><br>Running');
	$(elem).removeClass('btn-warning');
	$(elem).removeClass('btn-secondary');
	$(elem).addClass('btn-success');
	$(elem).attr('aria-pressed', false);
	$(elem).prop("disabled", false);
	chart1.runPlot();
}

$(function() {
	noPortBtn($('#openPortBtn'));
	listPorts();
	
	$("#AvailablePorts").on('change', function() {
		selectedPort = $(this).children("option:selected").val();
	
		if (selectedPort === mockpath4) {
			enableButtons();
		} else {
			disableButtons();
		}	
	
		if (availableSerialPorts.length > 0) {
			if (selectedPort != configSerialPort.path) {
				if (portIsOpen) {
					port.close(); // Close the currently open port
					portIsOpen = false; // Set the portIsOpen flag to false
				}
				// Pause & clear buttons are unclickable while port is closed
				pauseBtn($('#pausePortBtn'));
				$('#pausePortBtn').prop('disabled', true);
				$('#clearPortBtn').prop('disabled', true);
				if (selectedPort === "default") {
					noPortBtn($('#openPortBtn'));
				} else {
					closePortBtn($('#openPortBtn'));
					if (selectedPort === mockpath4 && selectedFile === undefined) {
						$('#openPortBtn').prop('disabled', true);
					}
				}
			} else {
				if (portIsOpen) {
					openPortBtn($('#openPortBtn'));
					runBtn($('#pausePortBtn'));
				} else {
					closePortBtn($('#openPortBtn'));
				}
			}
		}
		this.blur();
	});
	

	$('#pausePortBtn').on('click', function(){
		if($(this).attr('aria-pressed') === "true"){
			runBtn($('#pausePortBtn'));
		} else {
			pauseBtn($('#pausePortBtn'));
		}
	});

	$('#clearPortBtn').on('click', ()=>{
		flushChart(myChart);
		chartStartTime = Date.now();
		$('#clearPortBtn').prop('disabled', true);
	});

	$('#openPortBtn').on('click', function(){
		if($(this).attr('aria-pressed') === "true"){
			//Close the last port before opening a new one, and clear the chart
			if(port){
				if(port.isOpen){
					port.close();
				}
			}
			configSerialPort.path = selectedPort;
			openPort(configSerialPort.baudRate);
		} else {
			//pause btn is unclickable while port is closed
			pauseBtn('#pausePortBtn');
			$('#pausePortBtn').prop('disabled', true);
			port.close();
			closePortBtn(this);
		}
	});
});

function noPortBtn(elem) {
	$(elem).html('<i class="fa-solid fa-plug-circle-xmark"></i><br><span class="nonBreakable">No port</span>');
	$(elem).removeClass('btn-warning');
	$(elem).removeClass('btn-success');
	$(elem).addClass('btn-secondary');
	$(elem).prop('disabled', true);
}

function openPortBtn(elem) {
	$(elem).html('<i class="fa-solid fa-toggle-on"></i><br>Open');
	$(elem).removeClass('btn-warning');
	$(elem).removeClass('btn-secondary');
	$(elem).addClass('btn-success');
	$(elem).attr('aria-pressed', false);
	$(elem).prop('disabled', false);
	$(elem).show();

	// Print message in terminal
	if (!isPortOpenMessageDisplayed){
		//term1.printMessageToTerminal('<span style="color: gray;">' + selectedPort +' port is <span style="color: green;">open</span></span>\n'); /////////////////////////////////////
		isPortOpenMessageDisplayed=true;
		isPortClosedMessageDisplayed=false;
	}	
}

function closePortBtn(elem) {
	$(elem).html('<i class="fa-solid fa-toggle-off"></i><br>Closed');
	$(elem).removeClass('btn-success');
	$(elem).removeClass('btn-secondary');
	$(elem).addClass('btn-warning');
	$(elem).attr('aria-pressed', true);
	$(elem).prop('disabled', false);
	$(elem).show();

	// Print message in terminal
	if (!isPortClosedMessageDisplayed){
		//term1.printMessageToTerminal('<span style="color: gray;">' + selectedPort +' port is <span style="color: red;">closed</span></span>\n'); /////////////////////////////////////
		isPortClosedMessageDisplayed=true;
		isPortOpenMessageDisplayed=false;
	}	
}



$(document).ready(function() {

	var portCounter = 1;

	$("#addPortBtn").click(function() {
        portCounter++;

        var newPortDiv = $("#port1Section").clone(); // Create a new "port1SelectionDiv" by cloning the existing one

        // Update IDs and attributes to make them unique
        newPortDiv.attr("id", "port" + portCounter + "Section");

		newPortDiv.find(".collapseHead").attr("id", "port" + portCounter + "SelectionHref");
        newPortDiv.find(".collapseHead").attr("data-target", "#port" + portCounter + "SelectionDiv");
        newPortDiv.find(".collapseHead").attr("aria-controls", "port" + portCounter + "SelectionDiv");

		newPortDiv.find(".input-group-text").attr("id", "port" + portCounter + "SelectionTitle");
		newPortDiv.find(".port1SelectionTitle span").text("Port " + portCounter);

		newPortDiv.find(".collapse").attr("id", "port" + portCounter + "SelectionDiv");

		// Add a delete button to the new port section
		newPortDiv.append('<button class="btn btn-danger col-12 deletePortBtn" data-port="'+ portCounter +'"><i class="fa-solid fa-plug-circle-minus"></i>&nbsp;Delete Port</button>');

		console.log(newPortDiv)

        // Append the new port div after the last port div
        newPortDiv.insertBefore($("[id^='addPortBtn']:last"));
    });

	// Handle delete button click within cloned sections
	$(document).on("click", ".deletePortBtn", function() {
		var portToDelete = $(this).data("port");
		$("#port" + portToDelete + "Section").remove();

		// Decrement portCounter
		portCounter--;

		// Update the IDs and attributes of remaining sections
		for (var i = portToDelete + 1; i <= portCounter + 1; i++) {
			var portSection = $("#port" + i + "Section");
			portSection.attr("id", "port" + (i - 1) + "Section");
			portSection.find(".collapseHead").attr("id", "port" + (i - 1) + "SelectionHref");
			portSection.find(".collapseHead").attr("data-target", "#port" + (i - 1) + "SelectionDiv");
			portSection.find(".collapseHead").attr("aria-controls", "port" + (i - 1) + "SelectionDiv");
			portSection.find(".input-group-text").attr("id", "port" + (i - 1) + "SelectionTitle");
			portSection.find(".port1SelectionTitle span").text("Port " + (i - 1));
			portSection.find(".collapse").attr("id", "port" + (i - 1) + "SelectionDiv");
			portSection.find(".deletePortBtn").data("port", i - 1);
		}
	});
});

function listAvailableCharts(){
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

function listAvailableTerminals(){
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