/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-11 09:12:37
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-08-08 15:00:33
 */

const { data } = require("jquery");
const { proto } = require("once");

function pauseBtn(elem) {
	$(elem).html('<i class="fa-solid fa-pause"></i>&nbsp;Paused');
	$(elem).removeClass('btn-success');
	$(elem).removeClass('btn-secondary');
	$(elem).removeClass('disabled');
	$(elem).addClass('btn-warning');
	$(elem).attr('aria-pressed', 'true');
	$(elem).attr('aria-disabled', 'true');
	pausePlot();
}

function runBtn(elem) {
	$(elem).html('<i class="fa-solid fa-running"></i>&nbsp;Running');
	$(elem).removeClass('btn-warning');
	$(elem).removeClass('btn-secondary');
	$(elem).removeClass('disabled');
	$(elem).addClass('btn-success');
	$(elem).attr('aria-pressed', 'false');
	$(elem).attr('aria-disabled', 'false');
	runPlot();
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

let dataSerialBuff = Buffer.alloc(0);
let rawDataBuff = Buffer.alloc(0);
let indexData = 0;
const nbMaxDatasets = 20;

let nbChannelsInput = $("#nbChannels");

$(() => {
	
	nbChannelsInput.attr("value", numberOfDatasets); //initialize input field to the number of datasets
	nbChannelsInput.attr("max", nbMaxDatasets);
	nbChannelsInput.on('change', () => {
		let nbChannels = nbChannelsInput.val();
		while(numberOfDatasets < nbChannels && numberOfDatasets < nbMaxDatasets){
			addDataset();
		}
		while(numberOfDatasets > nbChannels && numberOfDatasets > 0){
			removeDataset();
		}
	});
});

function pausePlot(){
	myChart.options.scales['x'].realtime.pause = true;
}

function runPlot(){
	myChart.options.scales['x'].realtime.pause = false;
}

function plotOnPause(){
	return myChart.options.scales['x'].realtime.pause;
}

function getSerialData(index) {
	return(dataSerialBuff[index]);
}

function refreshCallback(chart) {
	if (plotOnPause() == false) {
		if(dataSerialBuff.length >= numberOfDatasets){
			chart.data.datasets.forEach((dataset) => {
				dataset.data.push({
					x: timeBuff[0],
					y: getSerialData(dataset.index)
				});
			});
		}
	}
}

function flushChart(chart) {
	chart.data.datasets.forEach((dataset) => {
		dataset.data = [];
	});
	myChart.update();
}

function removeDataset() {
	myChart.stop();
	numberOfDatasets--;
	myChart.data.datasets.pop();
	myChart.update();
}

function addDataset() {
	myChart.stop();
	numberOfDatasets++;
	let newDataset = {
		index: numberOfDatasets-1, //index begins to 0
		label: 'Dataset ' + numberOfDatasets, //TODO: hide label
		backgroundColor: automaticColorDataset(numberOfDatasets), //color(chartColors.red).alpha(0.5).rgbString(),
		borderColor: automaticColorDataset(numberOfDatasets), //chartColors.red, //TODO: add auto picker for colors
		fill: false,
		lineTension: 0,
		data: []
	}
	myChart.data.datasets.push(newDataset);
	myChart.update();
}

// Chart layout setting //

let chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	greenApple: 'rgb(120, 235,12)',
	grey: 'rgb(201, 203, 207)'
};
let color = Chart.helpers.color;

function automaticColorDataset(elemNumber) {
	let index = (elemNumber - 1) % (Object.keys(chartColors).length);
	return (Object.entries(chartColors).at(index)[1]);
}

let labelsPrinted;

const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
	type: 'line',
	data: {
		labels: ['Red'],
		datasets: [{
			index: 0,
			label: 'Dataset 1',
			backgroundColor: automaticColorDataset(1),
			borderColor: chartColors.red,
			fill: false,
			lineTension: 0,
			data: []
		},{
			index: 1,
			label: 'Dataset 2',
			backgroundColor: automaticColorDataset(2),
			borderColor: chartColors.orange,
			fill: false,
			lineTension: 0,
			data: []
		},{
			index: 2,
			label: 'Dataset 3',
			backgroundColor: automaticColorDataset(3),
			borderColor: chartColors.yellow,
			fill: false,
			lineTension: 0,
			data: []
		}]
	},
	options: {
		scales: {
			x: {
				type: 'realtime',
				realtime: {
					duration: 20000,
					refresh: 200,
					delay: 100,
					onRefresh: refreshCallback,
					pause: true
				},
				ticks: {
					callback: function(value, index, ticks) {
						if(absTimeMode){
							return value;
						}
						let tickLabel = Math.floor(elapsedTime(ticks[index].value));
						if(index>0){
							if(labelsPrinted.includes(tickLabel)){
								tickLabel = undefined;
							} else {
								labelsPrinted.push(tickLabel);
							}
						} else {
							labelsPrinted = [tickLabel,];
						}
						return tickLabel;
                    }
				}
			},
			y: {
				title: {
					display: true,
					labelString: 'value'
				}
			}
		}
	}
});
