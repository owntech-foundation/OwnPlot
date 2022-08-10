let availableSerialPorts = [];
let availableSerialPortsLength = 0;
let selectedPort;

$(function(){

	$('.pauseBtn').hide(); //hide run & clear buttons as no port is chosen
	$('.clearBtn').hide();
	noPortBtn($('#openPortBtn'));
	
	listPorts();
	
	$("#AvailablePorts").on('change', function(){
		selectedPort = $(this).children("option:selected").val();
		if(availableSerialPortsLength > 0 && selectedPort != "default"){
			$('.pauseBtn').show();
			$('.clearBtn').show();
			if(selectedPort != configSerialPlot.path){
				closePortBtn($('#openPortBtn'));
				//pause & clear btn are unclickable while port is closed
				pauseBtn($('.pauseBtn'));
				$('.pauseBtn').addClass('disabled');
				$('.clearBtn').addClass('disabled');
			} else {
				openPortBtn($('#openPortBtn'));
			}
		} else {
			noPortBtn($('#openPortBtn'));
		}
	});

	$('.pauseBtn').on('click', function(){
		if($(this).attr('aria-pressed') === "true"){
			runBtn($('.pauseBtn'));
		} else {
			pauseBtn($('.pauseBtn'));
		}
	});

	$('.clearBtn').on('click', ()=>{
		flushChart(myChart);
		$('.clearBtn').addClass('disabled');
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
			pauseBtn('.pauseBtn');
			$('.pauseBtn').addClass('disabled');
			port.close();
			closePortBtn(this);
		}
	});

});

