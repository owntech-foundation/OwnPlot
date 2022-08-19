let availableSerialPorts;
let selectedPort;

$(function(){
	noPortBtn($('#openPortBtn'));
	
	listPorts();
	
	$("#AvailablePorts").on('change', function(){
		selectedPort = $(this).children("option:selected").val();
		if(availableSerialPorts.length > 0 && selectedPort != "default"){
			if(selectedPort != configSerialPlot.path){
				closePortBtn($('#openPortBtn'));
				//pause & clear btn are unclickable while port is closed
				pauseBtn($('.pauseBtn'));
				$('.pauseBtn').prop('disabled', true);
				$('.clearBtn').prop('disabled', true);
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
		$('.clearBtn').prop('disabled', true);
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
			$('.pauseBtn').prop('disabled', true);
			port.close();
			closePortBtn(this);
		}
	});

});

