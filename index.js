var configSerialPlot = {
	separator: ':',
	path: ""
}

var availableSerialPorts = [];
var availableSerialPortsLength = 0;
let selectedPort;

$(document).ready(function(){
	$('#openPortBtn').css("visibility","hidden"); //hide the run button as no port is chosen
	noPortBtn($('#pauseBtn'));
	separatorField = $("#separator");
	separatorField.val(configSerialPlot.separator);
	separatorField.on('input',function(e){
		if (separatorField.val().length > 0) {
			configSerialPlot.separator = separatorField.val()[0]; //first char in the separator field
		}
	});

	$("#AvailablePorts").change(function(){
		selectedPort = $(this).children("option:selected").val();
		if(availableSerialPortsLength > 0 && selectedPort != "default"){				
			if(selectedPort != configSerialPlot.path){
				closePortBtn($('#openPortBtn'));
				//pause btn is unclickable while port is closed
				pauseBtn($('#pauseBtn'));
				$('#pauseBtn').addClass('disabled');
			} else {
				openPortBtn($('#openPortBtn'));
				runBtn($('#pauseBtn'));
			}
		} else {
			$('#openPortBtn').css("visibility","hidden");
			noPortBtn($('#pauseBtn'));
		}
	});

	$('#pauseBtn').click(function()
	{
		if($(this).attr('aria-pressed') === "true"){
			runBtn(this);
		} else {
			pauseBtn(this);
		}
	});

	$('#openPortBtn').click(function()
	{
		if($(this).attr('aria-pressed') === "true"){
			//Close the last port before opening a new one, and clear the chart
			if(port){
				if(port.isOpen){
					port.close();
				}
			}
			configSerialPlot.path = selectedPort;
			openPort();
		} else {
			//pause btn is unclickable while port is closed
			pauseBtn('#pauseBtn');
			$('#pauseBtn').addClass('disabled');
			port.close();
			closePortBtn(this);
		}
	});

});

var dataSerialBuff = [];
let indexData = 0;

function getSerialData(index) {
	return(dataSerialBuff[index]);
}

function onRefresh(chart) {
	var now = Date.now();
	chart.data.datasets.forEach(function(dataset) {
		dataset.data.push({
			x: now,
			y: getSerialData(dataset.index)
		});
	});
}

function flushChart(chart){
	chart.data.datasets.forEach((dataset) => {
		dataset.data.splice(0,1000);
	});
}

var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};
var color = Chart.helpers.color;

const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
	type: 'line',
	data: {
		labels: ['Red'],
		datasets: [{
			index: 0,
			label: 'Dataset 1',
			backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
			borderColor: chartColors.red,
			fill: false,
			lineTension: 0,
			data: []
		},{
			index: 1,
			label: 'Dataset 2',
			backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
			borderColor: chartColors.blue,
			fill: false,
			lineTension: 0,
			data: []
		},{
			index: 2,
			label: 'Dataset 3',
			backgroundColor: color(chartColors.green).alpha(0.5).rgbString(),
			borderColor: chartColors.green,
			fill: false,
			lineTension: 0,
			data: []
		}]
	},
	options: {
		scales: {
			xAxes: [{
				type: 'realtime',
				realtime: {
					duration: 20000,
					refresh: 200,
					delay: 100,
					onRefresh: onRefresh,
					pause: true
				}
			}],
			yAxes: [{
				scaleLabel: {
					display: true,
					labelString: 'value'
				}
			}]
		},
	}
});
