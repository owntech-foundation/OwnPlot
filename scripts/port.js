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
				pauseBtn($('#pausePortBtn'));
				$('#pausePortBtn').prop('disabled', true);
				$('#clearPortBtn').prop('disabled', true);
			} else {
				openPortBtn($('#openPortBtn'));
			}
		} else {
			noPortBtn($('#openPortBtn'));
		}
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
			configSerialPlot.path = selectedPort;
			openPort();
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
	$(elem).html('<i class="fa-solid fa-plug-circle-xmark"></i><br>No port');
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
}

function closePortBtn(elem) {
	$(elem).html('<i class="fa-solid fa-toggle-off"></i><br>Closed');
	$(elem).removeClass('btn-success');
	$(elem).removeClass('btn-secondary');
	$(elem).addClass('btn-warning');
	$(elem).attr('aria-pressed', true);
	$(elem).prop('disabled', false);
	$(elem).show();
}