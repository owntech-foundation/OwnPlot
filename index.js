let configSerialPlot = {
	separator: ':',
	path: "",
	nbType: "uint8",
	nbSize: 2
}

let availableSerialPorts = [];
let availableSerialPortsLength = 0;
let selectedPort;

$(function(){

	$('#openPortBtn').css("visibility","hidden"); //hide the run button as no port is chosen
	noPortBtn($('#pauseBtn'));
	
	listPorts();

	let separatorField = $("#separator");
	separatorField.val(configSerialPlot.separator);
	separatorField.on('input',function(){
		if (separatorField.val().length > 0) {
			configSerialPlot.separator = separatorField.val()[0]; //first char in the separator field
		}
	});

	let nbTypeField = $("#nbType");
	nbTypeField.on('change',function(){
		configSerialPlot.nbType = nbTypeField.children("option:selected").val();
		console.log("nbType changed to " + configSerialPlot.nbType);
	});

	$("#AvailablePorts").on('change', function(){
		selectedPort = $(this).children("option:selected").val();
		if(availableSerialPortsLength > 0 && selectedPort != "default"){				
			if(selectedPort != configSerialPlot.path){
				closePortBtn($('#openPortBtn'));
				//pause btn is unclickable while port is closed
				pauseBtn($('#pauseBtn'));
				$('#pauseBtn').addClass('disabled');
			} else {
				openPortBtn($('#openPortBtn'));
				runBtn($('#pauseBtn'));
			}
		} else {
			$('#openPortBtn').css("visibility","hidden");
			noPortBtn($('#pauseBtn'));
		}
	});

	$('#pauseBtn').on('click', function(){
		if($(this).attr('aria-pressed') === "true"){
			runBtn(this);
		} else {
			pauseBtn(this);
		}
	});

	$('#openPortBtn').on('click', function(){
		if($(this).attr('aria-pressed') === "true"){
			//Close the last port before opening a new one, and clear the chart
			if(port){
				if(port.isOpen){
					port.close();
				}
			}
			configSerialPlot.path = selectedPort;
			openPort();
		} else {
			//pause btn is unclickable while port is closed
			pauseBtn('#pauseBtn');
			$('#pauseBtn').addClass('disabled');
			port.close();
			closePortBtn(this);
		}
	});

});