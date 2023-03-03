/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Jean Alinei
 * @ Modified time: 2022-09-08 12:20:33
 * @ Description:
 */
 
// const { DatasetController } = require("chart.js");
const { data } = require("jquery");
const { proto } = require("once");

const colorThemes = {
	ColorBlind10: ColorBlind10,
	OfficeClassic6: OfficeClassic6,
	HueCircle19: HueCircle19,
	Tableau20: Tableau20
}; // See assets/colorSchemes/
let chartColors = colorThemes[Object.keys(colorThemes)[0]];

const lineStylesEnum = {
	full: [],
	short: [1, 1],
	medium: [10, 10],
	long: [20, 5],
	alternate: [15, 3, 3, 3]
};

const pointStylesEnum = {
	circle: 'circle',
	cross: 'cross',
	triangle: 'triangle',
	square: 'rect'
};

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

let dataSerialBuff = Buffer.alloc(0);
let plotSerialBuff = Buffer.alloc(0);
let plotTimeBuff = Buffer.alloc(0);
let rawDataBuff = Buffer.alloc(0);
const NB_MAX_DATASETS = 20;
let plotRunning = false;

let ctx;
let myChart;

const nbChannelsInput = $("#nbChannels");
const colorSchemeSelect = $("#colorSchemeSelect");

$(() => {

	if (appChartEnabled = 1){
		initColorSchemeSelect();
		initChart();
		myChart.data.datasets.forEach(dataset => {
			myChart.data.datasets[dataset.index].cubicInterpolationMode = 'monotone';
			myChart.data.datasets[dataset.index].tension = 0.4;
		})
		nbChannelsInput.attr("value", numberOfDatasets); //initialize input field to the number of datasets
		nbChannelsInput.attr("max", NB_MAX_DATASETS);
		nbChannelsInput.on('change', updateNbChannels);
		enterKeyupHandler(nbChannelsInput, updateNbChannels);
	}
});

function updateNbChannels(){
	let nbChannels = nbChannelsInput.val();
	while(numberOfDatasets < nbChannels && numberOfDatasets < NB_MAX_DATASETS){
		addDataset();
	}
	while(numberOfDatasets > nbChannels && numberOfDatasets > 0){
		removeDataset();
	}
	updateLegendTable();
}

function pausePlot(){
	myChart.options.scales['x'].realtime.pause = true;
	plotRunning = false;
}

function runPlot(){
	myChart.options.scales['x'].realtime.pause = false;
	plotRunning = true;
}

function plotOnPause(){
	return myChart.options.scales['x'].realtime.pause;
}

function getSerialData(index) {
	return(dataSerialBuff[index]);
}

function getSerialDataStructure(index) {
	dataStructure.y.slice(0, numberOfDatasets).forEach(getYData, index);
}

function flushDataStructure(){
	dataStructure.x = [];
	dataStructure.y = [];
}

function refreshCallback(chart) {
	if (plotRunning) {
		if(dataSerialBuff.length >= numberOfDatasets){
			chart.data.datasets.forEach((dataset) => {
				const dataValues = dataStructure.y.map(array => array[dataset.index]);
                const data = dataStructure.x.map((x, index) => {
                    return { x: x, y: dataValues[index] };
                });
				data.forEach((dataPoint) => {
					dataset.data.push({ x: dataPoint.x, y: dataPoint.y });
				});
			});
		};
	}
	flushDataStructure();
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
	let index = numberOfDatasets-1; //index begins to 0
	let newDataset = {
		index: index,
		label: 'Dataset ' + numberOfDatasets,
		backgroundColor: automaticColorDataset(index),
		borderColor: automaticColorDataset(index),
		lineTension: 0,
		hidden: false,
		data: [],
		pointStyleName: 'circle',
		pointStyle: pointStylesEnum[this.pointStyleName],
		pointRadius: 3,
		lineStyleName: 'full',
		lineBorderDash: lineStylesEnum[this.lineStyleName],
		lineBorderWidth: 3,
	}
	myChart.data.datasets.push(newDataset);
	myChart.update();
}

// Chart layout setting //

function initColorSchemeSelect(){
	let optionsHTML;
	Object.keys(colorThemes).forEach((themeName)=>{
		optionsHTML += "<option>" + themeName + "</option>";
	})
	colorSchemeSelect.html(optionsHTML);
	colorSchemeSelect.on('change', function(){
		chartColors = colorThemes[$(this).val()];
		updateChartColors();
		myChart.update();
		updateLegendTable();
	});
}

function automaticColorDataset(elemNumber) {
	let index = elemNumber % (Object.keys(chartColors).length);
	return chartColors[index];
}

function updateChartColors(){
	myChart.data.datasets.forEach(function(dataset){
		dataset.backgroundColor = automaticColorDataset(dataset.index);
		dataset.borderColor = automaticColorDataset(dataset.index);
	})
}

let timeTicksPrinted;

function legendClickHandler(e, legendItem, legend){
	if($("#nav-chartConfig-tab").hasClass("active") == false){
		$("#nav-chartConfig-tab").trigger('click');
	}
	if($("#legendSetupDiv").is('.collapse:not(.show)')){
		$("#legendSetupDiv").collapse("show");
		$("#legendSetupDiv").one(("shown.bs.collapse"), ()=>{
			//wait for the collapse animation to happen, otherwise focus below won't work
			let legendItemInput = $("#legendConfigDiv").find('.labelInput')[legendItem.datasetIndex+1];
			legendItemInput.focus();
			legendItemInput.select();
		});
	} else {
		let legendItemInput = $("#legendConfigDiv").find('.labelInput')[legendItem.datasetIndex+1];
		legendItemInput.focus();
		legendItemInput.select();
	}
}

function initChart(){	
	ctx = $('#myChart')[0].getContext('2d');
	myChart = new Chart(ctx, {
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
						refresh: refreshValue,
						delay: 500,
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
				},
				y2: {
					type: 'linear',
					display: false,
					position: 'right',
			
					// grid line settings
					grid: {
					  drawOnChartArea: false, // only want the grid lines for one axis to show up
					},
				},
			},
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: true,
					position: 'right',
					labels: {
						//replace the default colored box which border was linked to the dash pattern of the dataset (it was ugly)
						usePointStyle: true,
						pointStyle: 'rect',
						pointStyleWidth: 30
					},
					onClick: legendClickHandler,
					onHover: function(event, legendItem, legend){
						$(this.ctx.canvas).css('cursor', 'pointer');
					},
					onLeave: function(event, legendItem, legend){
						$(this.ctx.canvas).css('cursor', 'default');
					},
				},
				zoom: {
					// Assume x axis has the realtime scale
					pan: {
						enabled: true,        // Enable panning
						mode: 'xy',   
					},
					zoom: {
						pinch: {
							enabled: true       // Enable pinch zooming
						},
						scaleMode: 'y',			//Allow y axis zoom when on y scale
						wheel: {
							enabled: true       // Enable wheel zooming
						},
					  	mode: 'x'             // Allow zooming in the x direction
					},

					limits: {
						x: {
							minDelay: null,     // Min value of the delay option
							maxDelay: 20000,     // Max value of the delay option
							minDuration: 200,  // Min value of the duration option
							maxDuration: 20000   // Max value of the duration option
						}
					}
				}
			},
		}
	});

	//we add three datasets by default, as there are three channels on the ownTech card
	addDataset();
	addDataset();
	addDataset();
}

//unused for now. Keep this code for later to toggle between light and dark mode
function darkModePlot() {
	let x = myChart.config.options.scales.x;
	let y = myChart.config.options.scales.y;
	
	x.grid.borderColor = 'white';
	y.grid.borderColor = 'white';
	x.grid.color = 'rgba(255, 255, 255, 0.5)';
	y.grid.color = 'rgba(255, 255, 255, 0.5)';	
}

