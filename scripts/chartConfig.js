relBtn = $("#relBtn");
absBtn = $('#absBtn');

absTimeMode = true;

function switchRelAbsBtn(){
    if(absTimeMode){
        $(absBtn).hide();
        $(relBtn).show();
        absTimeMode = false;
        console.log("switched to relative");
    } else {
        $(relBtn).hide();
        $(absBtn).show();
        absTimeMode = true;
        console.log("switched to absolute");
    }
}

$(()=>{
    $(relBtn).hide();
    $(absBtn).show();
    absTimeMode = true;

    $(".relAbsBtn").on('click', ()=>{
        switchRelAbsBtn();
    })
});