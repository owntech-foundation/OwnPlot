const relBtn = $("#relBtn");
const absBtn = $('#absBtn');
const legendPositionBtn = $('#legendPositionBtn');

function switchRelAbsBtn(){
    if(absTimeMode){
        $(absBtn).hide();
        $(relBtn).show();
        absTimeMode = false;
    } else {
        $(relBtn).hide();
        $(absBtn).show();
        absTimeMode = true;
    }
}

$(()=>{
    initLegendConfigTable();

    $(relBtn).hide();
    $(absBtn).show();
    absTimeMode = true;

    $(".relAbsBtn").on('click', ()=>{
        switchRelAbsBtn();
    });

    legendPositionBtn.on('click', ()=>{
        switchlegendPositionBtn();
    });

    updateLegendTable(); //Defined in shared.js
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