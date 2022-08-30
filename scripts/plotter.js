/**
 * @ Author: Guillaume Arthaud
 * @ Email: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-07-11 09:12:37
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-08-29 16:52:23
 */

const { data } = require("jquery");
const { proto } = require("once");

function pauseBtn(elem) {
	$(elem).html('<i class="fa-solid fa-pause"></i><br>Paused');
	$(elem).removeClass('btn-success');
	$(elem).removeClass('btn-secondary');
	$(elem).addClass('btn-warning');
	$(elem).attr('aria-pressed', true);
	$(elem).prop("disabled", false);
	pausePlot();
}

function runBtn(elem) {
	$(elem).html('<i class="fa-solid fa-running"></i><br>Running');
	$(elem).removeClass('btn-warning');
	$(elem).removeClass('btn-secondary');
	$(elem).addClass('btn-success');
	$(elem).attr('aria-pressed', false);
	$(elem).prop("disabled", false);
	runPlot();
}

function noPortBtn(elem) {
	$(elem).html('<i class="fa-solid fa-plug-circle-xmark"></i><br>No port');
	$(elem).removeClass('btn-warning');
	$(elem).removeClass('btn-success');
	$(elem).addClass('btn-secondary');
	$(elem).prop('disabled', true);
}

function openPortBtn(elem) {
	$(elem).html('Port opened');
	$(elem).removeClass('btn-warning');
	$(elem).removeClass('btn-secondary');
	$(elem).addClass('btn-success');
	$(elem).attr('aria-pressed', false);
	$(elem).prop('disabled', false);
	$(elem).show();
}

function closePortBtn(elem) {
	$(elem).html('Port closed');
	$(elem).removeClass('btn-success');
	$(elem).removeClass('btn-secondary');
	$(elem).addClass('btn-warning');
	$(elem).attr('aria-pressed', true);
	$(elem).prop('disabled', false);
	$(elem).show();
}

let dataSerialBuff = Buffer.alloc(0);
let rawDataBuff = Buffer.alloc(0);
let indexData = 0;
const nbMaxDatasets = 20;

let nbChannelsInput = $("#nbChannels");

$(() => {
	initChart();
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

const lineStylesEnum = {
	full: [],
	short: [1, 1],
	medium: [10, 10],
	long: [20, 5],
	alternate: [15, 3, 3, 3]
};

function addDataset() {
	myChart.stop();
	numberOfDatasets++;
	let newDataset = {
		index: numberOfDatasets-1, //index begins to 0
		label: 'Dataset ' + numberOfDatasets,
		backgroundColor: automaticColorDataset(numberOfDatasets),
		borderColor: automaticColorDataset(numberOfDatasets),
		lineTension: 0,
		hidden: false,
		data: [],
		pointStyle: 'circle',
		pointRadius: 3,
		lineStyle: 'full',
		lineBorderDash: lineStylesEnum[this.lineStyle],
		lineBorderWidth: 3,
	}
	myChart.data.datasets.push(newDataset);
	myChart.update();
}

// Chart layout setting //

const chartColors = {
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
	cornsilk: '#fff8dc',
	apple: '#00c853',
	sapphire: '#0f52ba',
	grey: '#a0bbc4',
	marroon: '#9e9d24',
	gold: '#ffa000',
	anthracite: '#455a64',
};

function automaticColorDataset(elemNumber) {
	let index = (elemNumber - 1) % (Object.keys(chartColors).length);
	return (Object.entries(chartColors).at(index)[1]);
}

let timeTicksPrinted;

const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
	type: 'line',
	data: {
		labels: ['Red'],
		datasets: []
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
						let tickLabel = Math.floor(millisecondsElapsed(chartStartTime, ticks[index].value));
						if(index>0){
							if(timeTicksPrinted.includes(tickLabel)){
								tickLabel = undefined;
							} else {
								timeTicksPrinted.push(tickLabel);
							}
						} else {
							timeTicksPrinted = [tickLabel,];
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
		},
		plugins: {
			legend: {
				position: 'right',
				labels: {
					//replace the default colored box which border was linked to the dash pattern of the dataset (it was ugly)
					usePointStyle: true,
					pointStyle: 'rect',
					pointStyleWidth: 30
				},
				onClick: function(e, legendItem, legend) {
					if($("#nav-chartConfig-tab").hasClass("active") == false || tabShown == false){
						$("#nav-chartConfig-tab").trigger('click');
					}
					let legendItemInput = $($("#legendTable").find("tr")[legendItem.datasetIndex+1]).find("input")[0];
					setTimeout(() => {
						legendItemInput.focus();
						legendItemInput.select();
					}, 400);
				}
			}
		}
	}
});

function initChart(){
	//we add three datasets by default, as there are three channels on the ownTech card
	addDataset();
	addDataset();
	addDataset();
}

//TODO: unused for now. Keep this code for later to toggle between light and dark mode
function darkModePlot() {
	let x = myChart.config.options.scales.x;
	let y = myChart.config.options.scales.y;
	
	x.grid.borderColor = 'white';
	y.grid.borderColor = 'white';
	x.grid.color = 'rgba(255, 255, 255, 0.5)';
	y.grid.color = 'rgba(255, 255, 255, 0.5)';	
}

