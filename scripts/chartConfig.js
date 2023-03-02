/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Jean Alinei
 * @ Modified time: 2022-09-08 14:25:31
 * @ Description: Chart legend related UI handlers
 */
 
const relBtn = $("#relBtn");
const absBtn = $('#absBtn');
const resetBtn = $("#resetBtn");
const minYAxisField = $("#minYAxisField");
const maxYAxisField = $("#maxYAxisField");
const legendPositionBtn = $('#legendPositionBtn');
const resetRelBtn = $('#resetRelBtn');
const refreshField = $("#refreshTime");

let refreshValue = 200;

function switchRelAbsBtn(){
    if(absTimeMode){
        absBtn.hide();
        relBtn.show();
        resetRelBtn.show();
        absTimeMode = false;
    } else {
        relBtn.hide();
        absBtn.show();
        resetRelBtn.hide();
        absTimeMode = true;
    }
}

$(()=>{
    initLegendConfigTable();

    refreshField.on("input", function(e){
        if(refreshField.val().length > 1){
            refreshValue = parseInt(refreshField.val());
            myChart.options.scales['x'].realtime.refresh = refreshValue;
            myChart.update('none');
        }
	})

    resetBtn.on('click', function() {
        myChart.resetZoom();
    })

    minYAxisField.on('input', function(){
		if (minYAxisField.val().length > 0) {
			myChart.options.scales.y.min = parseInt(minYAxisField.val());
		}
	});
    
    maxYAxisField.on('input', function(){
		if (maxYAxisField.val().length > 0) {
			myChart.options.scales.y.max = parseInt(maxYAxisField.val());
		}
	});

    $("#legendShownBtn").on('click', function(){
        $(this).hide();
        myChart.options.plugins.legend.display = false;
        myChart.update();
        $("#legendHiddenBtn").show();
    });

    $("#legendHiddenBtn").hide();
    $("#legendHiddenBtn").on('click', function(){
        $(this).hide();
        myChart.options.plugins.legend.display = true;
        myChart.update();
        $("#legendShownBtn").show();
    });

    relBtn.hide();
    absBtn.show();
    absTimeMode = true;

    resetRelBtn.hide();
    resetRelBtn.on('click', ()=>{
        chartStartTime = Date.now();
    });

    $(".relAbsBtn").on('click', ()=>{
        switchRelAbsBtn();
    });

    legendPositionBtn.on('click', ()=>{
        switchlegendPositionBtn();
    });

    if (appChartEnabled = 1){
        updateLegendTable(); //Defined in shared.js
    }
});

function switchlegendPositionBtn(){
    switch(myChart.options.plugins.legend.position){
        case('top'):
        myChart.options.plugins.legend.position = 'right';
        myChart.update();
        legendPositionBtn.html('<i class="fa-solid fa-arrow-right"></i>&nbsp;Position');
        break;
        case('right'):
        myChart.options.plugins.legend.position = 'bottom';
        myChart.update();
        legendPositionBtn.html('<i class="fa-solid fa-arrow-down"></i>&nbsp;Position');
        break;
        case('bottom'):
        myChart.options.plugins.legend.position = 'left';
        myChart.update();
        legendPositionBtn.html('<i class="fa-solid fa-arrow-left"></i>&nbsp;Position');
        break;
        case('left'):
        myChart.options.plugins.legend.position = 'top';
        myChart.update();
        legendPositionBtn.html('<i class="fa-solid fa-arrow-up"></i>&nbsp;Position');
        break;
    }
}

function initLegendConfigTable(){
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