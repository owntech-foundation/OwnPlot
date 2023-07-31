/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-09-07 13:44:23
 * @ Description:
 */
 
const { split } = require("lodash");

let appChartEnabled;
let appSimulationEnabled;
let horSplit;

var appsList = ['#appZone', '#app1000', '#app2000']
	
function appsSplit() {
	horSplit = Split([appsList[0], appsList[1], appsList[2]],{
		direction: 'vertical',
		gutterSize: 3,
	});
	// for (var i = 0; i < appsList.length - 1; i++) {
	// 	console.log(appsList[i] + " " + appsList[i + 1]);

	// 	horSplit = Split([appsList[i], appsList[i + 1]],{
	// 	direction: 'vertical',
	// 	sizes: [100 / appsList.length, 100 / appsList.length],
	// 	gutterSize: 3,
	// 	});
	// 	horSplit.pairs[i].gutter.id = "gutterHoriz_" + i;
	// 	$("#gutterHoriz_" + i).hover(gutterHHandlerIn, gutterHHandlerOut);
	// }
}

$(() => {

	/* Prevent overflowing of appBody because of ChartJS responsiveness */

	// Get the initial height of the topBar element
	var topbarHeight = $('#topBar').outerHeight(true);
	// Set the initial value of the --topbar-height custom property
	$('#appBody').css('--topbar-height', topbarHeight + 'px');

		// Listen for changes to the height of the topBar element
	$(window).resize(function() {
		var newTopbarHeight = $('#topBar').outerHeight(true);
		if (newTopbarHeight !== topbarHeight) {
			// Update the value of the --topbar-height custom property
			$('#appBody').css('--topbar-height', newTopbarHeight + 'px');
			topbarHeight = newTopbarHeight;
		}
	});

	const vertSplit = Split(['#sideBar', '#chartAndTerminalDiv'],{
		sizes: [25,75],
		gutterSize: 3,
	});
	vertSplit.pairs[0].gutter.id = "gutterVert";
	$("#gutterVert").hover(gutterVHandlerIn, gutterVHandlerOut);

	appsSplit();

	$(".chartApp").on('click', function(e){
		$("#chartApp").show();
		$("#simulationApp").hide();
		appChartEnabled = 1;
		appSimulationEnabled = 0;
	})

	$(".simulationApp").on('click', function(e){
		$("#chartApp").hide();
		$("#simulationApp").show();
		appChartEnabled = 0;
		appSimulationEnabled = 1;
	})
})

function gutterVHandlerIn(){
	$("#gutterVert").css('background-color', "#00694c");
};
function gutterVHandlerOut(){
	$("#gutterVert").css('background-color', "#5f626b");
};
function gutterHHandlerIn(){
	$("#gutterHoriz").css('background-color', "#00694c");
};
function gutterHHandlerOut(){
	$("#gutterHoriz").css('background-color', "#5f626b");
};