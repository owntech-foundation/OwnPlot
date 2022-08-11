/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-11 09:12:37
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-08-11 18:14:05
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
		updateLegendTable();
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
		lineTension: 0,
		data: []
	}
	myChart.data.datasets.push(newDataset);
	myChart.update();
}

// Chart layout setting //

let chartColors = {
	blue: '#304ffe',
	green: '#64dd17',
	red: '#ed0202',
	orangeYellow: '#ffd600',
	purple: '#aa00ff',
	blueGreen: '#00bfa5',
	orange: '#ff6f00',
	lilac: '#ddcff4',
	pink: '#ec407a',
	deepSkyBlue: '#00bfff',
	deepGreen: '#2e7d32',
	violet: '#e040fb',
	darkTurquoise: '#00ced1',
	brown: '#5d4037',
	apple: '#00c853',
	sapphire: '#0f52ba',
	grey: '#a0bbc4',
	marroon: '#9e9d24',
	gold: '#ffa000',
	anthracite: '#455a64',
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
			borderColor: automaticColorDataset(1),
			lineTension: 0,
			data: []
		},{
			index: 1,
			label: 'Dataset 2',
			backgroundColor: automaticColorDataset(2),
			borderColor: automaticColorDataset(2),
			lineTension: 0,
			data: []
		},{
			index: 2,
			label: 'Dataset 3',
			backgroundColor: automaticColorDataset(3),
			borderColor: automaticColorDataset(3),
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
