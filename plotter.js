/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-11 09:12:37
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-07-20 17:11:23
 */

const { proto } = require("once");

function pauseBtn(elem) {
	$(elem).html('<i class="fa-solid fa-pause"></i>&nbsp;Paused');
	$(elem).removeClass('btn-success');
	$(elem).removeClass('btn-secondary');
	$(elem).removeClass('disabled');
	$(elem).addClass('btn-warning');
	$(elem).attr('aria-pressed', 'true');
	$(elem).attr('aria-disabled', 'true');
	myChart.options.scales.xAxes[0].realtime.pause = true;
}

function runBtn(elem) {
	$(elem).html('<i class="fa-solid fa-running"></i>&nbsp;Running');
	$(elem).removeClass('btn-warning');
	$(elem).removeClass('btn-secondary');
	$(elem).removeClass('disabled');
	$(elem).addClass('btn-success');
	$(elem).attr('aria-pressed', 'false');
	$(elem).attr('aria-disabled', 'false');
	myChart.options.scales.xAxes[0].realtime.pause = false;		
}

function noPortBtn(elem) {
	$(elem).html('<i class="fa-solid fa-plug-circle-xmark"></i>&nbsp;No port selected');
	$(elem).removeClass('btn-warning');
	$(elem).removeClass('btn-success');
	$(elem).addClass('btn-secondary');
	$(elem).addClass('disabled');
	$(elem).attr('aria-pressed', 'true');
	$(elem).attr('aria-disabled', 'true');
}

function openPortBtn(elem) {
	$(elem).html('Port opened');
	$(elem).removeClass('btn-warning');
	$(elem).removeClass('btn-secondary');
	$(elem).removeClass('disabled');
	$(elem).addClass('btn-success');
	$(elem).attr('aria-pressed', 'false');
	$(elem).css("visibility","visible");
}

function closePortBtn(elem) {
	$(elem).html('Port closed');
	$(elem).removeClass('btn-success');
	$(elem).removeClass('btn-secondary');
	$(elem).removeClass('disabled');
	$(elem).addClass('btn-warning');
	$(elem).attr('aria-pressed', 'true');
	$(elem).css("visibility","visible");
}


let dataSerialBuff = [];
let currentDataBuff = [];
let terminalSel = $('#terminalPre');
let countTermLines = 0;
let maxTermLine = 10;

function updateTerminal() {
	terminalSel.prepend('<span>' + currentDataBuff.toString() + '</span>'); //put first on top
	countTermLines = countTermLines + 1;
	if (countTermLines > maxTermLine) {
		terminalSel.children().last().remove();
		countTermLines = countTermLines - 1;
	}	
}

let indexData = 0;
function getSerialData(index) {
	if (currentDataBuff.length != 0) {
		if (index == 0) {
			updateTerminal();
		}
		return(dataSerialBuff[index]);
	}

}

function onRefresh(chart) {
	let now = Date.now();
	chart.data.datasets.forEach(function(dataset) {
		dataset.data.push({
			x: now,
			y: getSerialData(dataset.index)
		});
	});
}

function flushChart(chart){
	chart.data.datasets.forEach((dataset) => {
		dataset.data.splice(0,1000);
	});
}


// Chart layout setting //

let chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};
let color = Chart.helpers.color;

const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
	type: 'line',
	data: {
		labels: ['Red'],
		datasets: [{
			index: 0,
			label: 'Dataset 1',
			backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
			borderColor: chartColors.red,
			fill: false,
			lineTension: 0,
			data: []
		},{
			index: 1,
			label: 'Dataset 2',
			backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
			borderColor: chartColors.blue,
			fill: false,
			lineTension: 0,
			data: []
		},{
			index: 2,
			label: 'Dataset 3',
			backgroundColor: color(chartColors.green).alpha(0.5).rgbString(),
			borderColor: chartColors.green,
			fill: false,
			lineTension: 0,
			data: []
		}]
	},
	options: {
		scales: {
			xAxes: [{
				type: 'realtime',
				realtime: {
					duration: 20000,
					refresh: 200,
					delay: 100,
					onRefresh: onRefresh,
					pause: true
				}
			}],
			yAxes: [{
				scaleLabel: {
					display: true,
					labelString: 'value'
				}
			}]
		},
	}
});