/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-09-08 14:25:31
 * @ Description: Chart legend related UI handlers
 */
 

const ejs = require('ejs');
// const { DatasetController } = require("chart.js");
// const { data } = require("jquery");
// const { proto } = require("once");

var chart1, chart2;

/*
 *	UI handlers
 */

// -------------------------------------- //


/*
 *	JQuery selectors
 */

const relBtn = $("#relBtn");
const absBtn = $('#absBtn');
const resetBtn = $("#resetBtn");
const y2Btn = $("#y2Btn");
const rmY2Btn = $("#rmY2Btn");
const y2Config = $("#y2Config");
const yAxisSelector = $("#yAxisSelector");
const minYAxisField = $("#minYAxisField");
const maxYAxisField = $("#maxYAxisField");
const minY2AxisField = $("#minY2AxisField");
const maxY2AxisField = $("#maxY2AxisField");
const legendPositionBtn = $('#legendPositionBtn');
const resetRelBtn = $('#resetRelBtn');
const refreshField = $("#refreshTime");

const nbChannelsInput = $("#nbChannels");
const colorSchemeSelect = $("#colorSchemeSelect");

// -------------------------------------- //


class ChartApp {
    constructor(appID) {
        this.appID = appID;
        console.log(this.appID);
		this.template = fs.readFileSync("template/apps/chartApp.ejs", 'utf-8');
		this.renderedHtml = ejs.render(this.template, { app_id: this.appID });
		$("#chartApp").append(this.renderedHtml);

        this.chartSel = $('#myChart_' + appID);
        
        this.refreshValue = 200;
        this.numberOfDatasets = 0;
        this.plotRunning = false;
        this.dataStructure = {
            x: [],
            y: []
        };

        console.log("datastruct");
        console.log(this.dataStructure);
        nbChannelsInput.val(nbChannels);
        if (appChartEnabled = 1) {
            ////this.initLegendConfigTable();
            this.initColorSchemeSelect();
            this.#initChart();
            $('#monotoneInterpolationBtn').on('click', function(){
                this.myChart.data.datasets.forEach(dataset => {
                    this.myChart.data.datasets[dataset.index].cubicInterpolationMode = 'monotone';
                    this.myChart.data.datasets[dataset.index].tension = 0.4;
                    this.myChart.data.datasets[dataset.index].stepped = 0;
                })
            });
            $('#linearInterpolationBtn').on('click', function(){
                this.myChart.data.datasets.forEach(dataset => {
                    this.myChart.data.datasets[dataset.index].cubicInterpolationMode = 'linear';
                    this.myChart.data.datasets[dataset.index].tension = 0.4;
                    this.myChart.data.datasets[dataset.index].stepped = 0;
                })
            });
            $('#stepInterpolationBtn').on('click', function(){
                this.myChart.data.datasets.forEach(dataset => {
                    this.myChart.data.datasets[dataset.index].cubicInterpolationMode = 'standard';
                    this.myChart.data.datasets[dataset.index].tension = 0.4;
                    this.myChart.data.datasets[dataset.index].stepped = 'before';
                })
            });
		

            nbChannelsInput.attr("value", this.numberOfDatasets); //initialize input field to the number of datasets
            nbChannelsInput.attr("max", NB_MAX_DATASETS);
            nbChannelsInput.on('change', this.updateNbChannels);
            //enterKeyupHandler(nbChannelsInput, updateNbChannels);
        }

        //initLegendConfigTable();

        refreshField.on("input", function(e) {
            if(refreshField.val().length > 1) {
                this.refreshValue = parseInt(refreshField.val());
                this.myChart.options.scales['x'].realtime.refresh = this.refreshValue;
                this.myChart.update('none');
            }
        })
    
        resetBtn.on('click', function() {
            this.myChart.resetZoom();
        })
    
        rmY2Btn.hide();
        y2Config.hide();
    
        y2Btn.on('click', function() {
            this.myChart.options.scales.y2.display = true;
            y2Config.show();
            y2Btn.hide();
            rmY2Btn.show();
            yAxisSelector.show();
        })
    
        rmY2Btn.on('click', function() {
            this.myChart.options.scales.y2.display = false;
            rmY2Btn.hide();
            y2Btn.show();
            // y2Config.hide();
        })
    
        minYAxisField.on('input', function(){
            if (minYAxisField.val().length > 0) {
                this.myChart.options.scales.y.min = parseInt(minYAxisField.val());
            }
        });
        
        maxYAxisField.on('input', function(){
            if (maxYAxisField.val().length > 0) {
                this.myChart.options.scales.y.max = parseInt(maxYAxisField.val());
            }
        });
    
        minY2AxisField.on('input', function(){
            if (minY2AxisField.val().length > 0) {
                this.myChart.options.scales.y2.min = parseInt(minY2AxisField.val());
            }
        });
        
        maxY2AxisField.on('input', function(){
            if (maxY2AxisField.val().length > 0) {
                this.myChart.options.scales.y2.max = parseInt(maxY2AxisField.val());
            }
        });
    
        $("#legendShownBtn").on('click', function(){
            $(this).hide();
            this.myChart.options.plugins.legend.display = false;
            this.myChart.update();
            $("#legendHiddenBtn").show();
        });
    
        $("#legendHiddenBtn").hide();
        $("#legendHiddenBtn").on('click', function(){
            $(this).hide();
            this.myChart.options.plugins.legend.display = true;
            this.myChart.update();
            $("#legendShownBtn").show();
        });
    
        relBtn.hide();
        absBtn.show();
        this.absTimeMode = true;
    
        resetRelBtn.hide();
        resetRelBtn.on('click', () => {
            chartStartTime = Date.now(); //shared.js
        });
    
        $(".relAbsBtn").on('click', () => {
            this.switchRelAbsBtn();
        });
    
        legendPositionBtn.on('click', () => {
            this.switchlegendPositionBtn();
        });
    
        // if (appChartEnabled = 1) { 
        //     /////////////////////////updateLegendTable(); //Defined in shared.js
        // }

    }

    #initChart() {
        let ctx = this.chartSel[0].getContext('2d');
        this.myChart = new Chart(ctx, {
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
                            refresh: this.refreshValue,
                            delay: 500,
                            onRefresh: this.refreshCallback,
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
                            $(ctx.canvas).css('cursor', 'pointer');
                        },
                        onLeave: function(event, legendItem, legend){
                            $(ctx.canvas).css('cursor', 'default');
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
        this.addDataset();
        this.addDataset();
        this.addDataset();
    }

    flushChart() {
        this.myChart.data.datasets.forEach((dataset) => {
            dataset.data = [];
        });
        this.myChart.update();
    }
    
    removeDataset() {
        this.myChart.stop();
        this.numberOfDatasets--;
        this.myChart.data.datasets.pop();
        this.myChart.update();
    }
    
    addDataset() {
        this.myChart.stop();
        this.numberOfDatasets++;
        let index = this.numberOfDatasets-1; //index begins to 0
        let newDataset = {
            index: index,
            label: 'Dataset ' + this.numberOfDatasets,
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
        this.myChart.data.datasets.push(newDataset);
        this.myChart.update();
    }
    
    switchlegendPositionBtn() {
        switch(this.myChart.options.plugins.legend.position) {
            case('top'):
                this.myChart.options.plugins.legend.position = 'right';
                this.myChart.update();
                legendPositionBtn.html('<i class="fa-solid fa-arrow-right"></i>&nbsp;Position');
                break;
            case('right'):
                this.myChart.options.plugins.legend.position = 'bottom';
                this.myChart.update();
                legendPositionBtn.html('<i class="fa-solid fa-arrow-down"></i>&nbsp;Position');
                break;
            case('bottom'):
                this.myChart.options.plugins.legend.position = 'left';
                this.myChart.update();
                legendPositionBtn.html('<i class="fa-solid fa-arrow-left"></i>&nbsp;Position');
                break;
            case('left'):
                this.myChart.options.plugins.legend.position = 'top';
                this.myChart.update();
                legendPositionBtn.html('<i class="fa-solid fa-arrow-up"></i>&nbsp;Position');
                break;
        }
    }

    updateNbChannels() { ///WEIRD
        nbChannels = nbChannelsInput.val();
        if (nbChannels > NB_MAX_DATASETS) {
            nbChannels = NB_MAX_DATASETS;
            nbChannelsInput.val(nbChannels);
        }
        while(this.numberOfDatasets < nbChannels && this.numberOfDatasets < NB_MAX_DATASETS){
            addDataset();
        }
        while(this.numberOfDatasets > nbChannels && this.numberOfDatasets > 0){
            removeDataset();
        }
        updateLegendTable();
    }

    pausePlot() {
        this.myChart.options.scales['x'].realtime.pause = true;
        this.plotRunning = false;
    }
    
    runPlot() {
        this.myChart.options.scales['x'].realtime.pause = false;
        this.plotRunning = true;
    }
    
    plotOnPause() { //terminal.js ?
        return this.myChart.options.scales['x'].realtime.pause;
    }

    /*
    initLegendConfigTable() {
        let optionsHTML;
        Object.keys(lineStylesEnum).forEach(styleName => {
            optionsHTML += '<option>' + styleName + '</option>';
        });
        $("#lineStyleSelectNULL").html(optionsHTML);
        
        optionsHTML = "";
        Object.keys(pointStylesEnum).forEach(styleName => {
            optionsHTML += '<option>' + styleName + '</option>';
        });
        $("#pointStyleSelectNULL").html(optionsHTML);
    }*/
    getSerialDataStructure(index) {
        this.dataStructure.y.slice(0, this.numberOfDatasets).forEach(getYData, index);
    }

    flushDataStructure() {
        this.dataStructure.x = [];
        this.dataStructure.y = [];
    }
    
    refreshCallback() {
        if (this.plotRunning) {
            if(dataSerialBuff.length >= this.numberOfDatasets){
                this.mychart.data.datasets.forEach((dataset) => {
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
        //this.flushDataStructure();
        // console.log(this.dataStructure);
        // console.log(this.dataStructure.x);

        // this.dataStructure.x = [];
        // this.dataStructure.y = [];
    }

    
    initColorSchemeSelect() {
        let optionsHTML;
        Object.keys(colorThemes).forEach((themeName)=>{
            optionsHTML += "<option>" + themeName + "</option>";
        })
        colorSchemeSelect.html(optionsHTML);
        colorSchemeSelect.on('change', function(){
            chartColors = colorThemes[$(this).val()];
            updateChartColors();
            this.myChart.update();
            updateLegendTable();
        });
    }
    
    updateChartColors() {
        this.myChart.data.datasets.forEach(function(dataset) {
            dataset.backgroundColor = automaticColorDataset(dataset.index);
            dataset.borderColor = automaticColorDataset(dataset.index);
        })
    }

    switchRelAbsBtn() {
        if(this.absTimeMode){
            absBtn.hide();
            relBtn.show();
            resetRelBtn.show();
            this.absTimeMode = false;
        } else {
            relBtn.hide();
            absBtn.show();
            resetRelBtn.hide();
            this.absTimeMode = true;
        }
    }
}


$(()=>{
	//chart2 = new ChartApp("app200");
    chart1 = new ChartApp("app100");
});




////////////////////////////////////////////////////////////////////////////////////


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

const NB_MAX_DATASETS = 10;

let dataSerialBuff = Buffer.alloc(0);
let plotSerialBuff = Buffer.alloc(0);
let plotTimeBuff = Buffer.alloc(0);
let rawDataBuff = Buffer.alloc(0);
let nbChannels = 3;

function initLegendConfigTable() {
	let optionsHTML;
	Object.keys(lineStylesEnum).forEach(styleName => {
		optionsHTML += '<option>' + styleName + '</option>';
	});
	$("#lineStyleSelectNULL").html(optionsHTML);
	
	optionsHTML = "";
	Object.keys(pointStylesEnum).forEach(styleName => {
		optionsHTML += '<option>' + styleName + '</option>';
	});
	$("#pointStyleSelectNULL").html(optionsHTML);
}


// nbChannelsInput.on('input', function() {
// 	nbChannels = nbChannelsInput.val();
// 	if (nbChannels > NB_MAX_DATASETS) {
// 		nbChannels = NB_MAX_DATASETS;
//         nbChannelsInput.val(nbChannels);
// 	}
// }); 

function getSerialData(index) {
	return(dataSerialBuff[index]);
}


// Chart layout setting //


function automaticColorDataset(elemNumber) {
	let index = elemNumber % (Object.keys(chartColors).length);
	return chartColors[index];
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


// //unused for now. Keep this code for later to toggle between light and dark mode
// function darkModePlot() {
// 	let x = myChart.config.options.scales.x;
// 	let y = myChart.config.options.scales.y;
	
// 	x.grid.borderColor = 'white';
// 	y.grid.borderColor = 'white';
// 	x.grid.color = 'rgba(255, 255, 255, 0.5)';
// 	y.grid.color = 'rgba(255, 255, 255, 0.5)';	
// }

