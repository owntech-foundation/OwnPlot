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

function updateLegendTable(){
    let table = [];

    myChart.data.datasets.forEach(dataset => {
        table.push({
            index: dataset.index,
            label: dataset.label,
            color: dataset.backgroundColor
        });
    });

    let tableHTML = tableify(table);
    tableHTML = "<table class='table table-hover' id='legendTable'>" + tableHTML.substring(7, tableHTML.length); //"<table>".length = 7, we replace it to insert class & id
    $("#legendConfigDiv").html(tableHTML);
    $("#legendTable").DataTable({
		"paging": false,
		"searching": false,
		"info": false
	});
    // for (let index = 0; index < myChart.data.datasets.length; index++) {
    //     const element = myChart.data.datasets[index];
    // }
}