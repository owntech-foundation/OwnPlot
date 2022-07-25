/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-11 09:12:37
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-07-25 15:54:46
 */

const { auto } = require("@popperjs/core");
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

function terminalTimestampBtnEnable(elem) {
	elem.attr('aria-pressed', 'true');
	elem.removeClass('btn-warning');
	elem.addClass('btn-success');
}

function terminalTimestampBtnDisable(elem) {
	elem.attr('aria-pressed', 'false');
	elem.removeClass('btn-success');
	elem.addClass('btn-warning');
}

let terminalBtnTimestamp = $('#terminalBtnTimestamp');
let terminalBtnClear =  $('#terminalBtnClear');
let terminalSel = $('#terminalPre');


$(function() {
	terminalTimestampBtnDisable(terminalBtnTimestamp); //default behavior

	terminalBtnTimestamp.on('click', function(){
		if(terminalBtnTimestamp.attr('aria-pressed') === "true"){
			//if it is enabled then disable it
			terminalTimestampBtnDisable(terminalBtnTimestamp);
		} else {
			terminalTimestampBtnEnable(terminalBtnTimestamp);
		}
	});

	terminalBtnClear.on('click', function(){
		terminalSel.empty();
		terminalSel.append('<span>terminal cleared</span>');
		countTermLines = 1;
	});
});

let dataSerialBuff = [];
let currentDataBuff = [];
let countTermLines = 0;
let maxTermLine = 50;

function termialTime() {
	if (terminalBtnTimestamp.attr('aria-pressed') === "true") {
		let now = new Date().toISOString().slice(0, -1)
		now = now.substring(now.indexOf('T') + 1);
		return (now + " -> ");
	} else {
		return("")
	}
}

function updateTerminal() {
	terminalSel.prepend('<span>' + termialTime() + currentDataBuff.toString() + '</span>'); //put first on top
	countTermLines = countTermLines + 1;
	if (countTermLines > maxTermLine) {
		terminalSel.children().last().remove();
		countTermLines = countTermLines - 1;
	}	
}

let indexData = 0;
function getSerialData(index) {
	if (myChart.options.scales.xAxes[0].realtime.pause == false) {
		if (index == 0) {
			updateTerminal();
		}
		return(dataSerialBuff[index]);
	}
}

function onRefresh(chart) {
	if(dataSerialBuff.length >= numberOfDatasets){
		let now = Date.now();
		chart.data.datasets.forEach(function(dataset) {
			dataset.data.push({
				x: now,
				y: getSerialData(dataset.index)
			});
		});
	}
}

function flushChart(chart) {
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

function automaticColorDataset(elemNumber) {
	let index = (elemNumber - 1) % (Object.keys(chartColors).length);
	console.log(Object.entries(chartColors).at(index)[1]);
	console.log(chartColors.red);
	return (Object.entries(chartColors).at(index)[1]);
}

function addDataset() {	
	numberOfDatasets++;
	let testDataset = {
		index: numberOfDatasets,
		label: 'Dataset ' + numberOfDatasets, //TODO: hide label
		backgroundColor: automaticColorDataset(numberOfDatasets), //color(chartColors.red).alpha(0.5).rgbString(),
		borderColor: automaticColorDataset(numberOfDatasets), //chartColors.red, //TODO: add auto picker for colors
		fill: false,
		lineTension: 0,
		data: []
	}
	myChart.data.datasets.push(testDataset);
}

let numberOfDatasets = 3;

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
			backgroundColor: color(chartColors.orange).alpha(0.5).rgbString(),
			borderColor: chartColors.orange,
			fill: false,
			lineTension: 0,
			data: []
		},{
			index: 2,
			label: 'Dataset 3',
			backgroundColor: color(chartColors.yellow).alpha(0.5).rgbString(),
			borderColor: chartColors.yellow,
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