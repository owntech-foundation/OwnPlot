/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-11 09:12:37
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-07-11 09:13:02
 */

function pauseBtn(elem) {
	$(elem).html('<i class="fa-solid fa-pause"></i>&nbsp;Paused');
	$(elem).removeClass('btn-success');
	$(elem).addClass('btn-warning');
	$(elem).data('aria-pressed', 'true');
	myChart.options.scales.xAxes[0].realtime.pause = true;
}

function runBtn(elem) {
	$(elem).html('<i class="fa-solid fa-running"></i>&nbsp;Running');
	$(elem).removeClass('btn-warning');
	$(elem).addClass('btn-success');
	$(elem).attr('aria-pressed', 'false');
	myChart.options.scales.xAxes[0].realtime.pause = false;		
}