/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-22 16:23:22
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-09-07 13:43:39
 * @ Description:
 */

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
				if(portIsOpen){
					openPortBtn($('#openPortBtn'));
					runBtn($('#pausePortBtn'));
				}
			}
		} else {
			noPortBtn($('#openPortBtn'));
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