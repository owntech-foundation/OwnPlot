const relBtn = $("#relBtn");
const absBtn = $('#absBtn');

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
    $(relBtn).hide();
    $(absBtn).show();
    absTimeMode = true;

    $(".relAbsBtn").on('click', ()=>{
        switchRelAbsBtn();
    });

    updateLegendTable();
});