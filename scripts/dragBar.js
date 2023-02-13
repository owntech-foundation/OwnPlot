/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Jean Alinei
 * @ Modified time: 2022-09-07 13:44:23
 * @ Description:
 */
 
const { split } = require("lodash");

let appChartEnabled;
let appSimulationEnabled;

$(() => {   
	const vertSplit = Split(['#sideBar', '#chartAndTerminalDiv'],{
		sizes: [25,75],
		gutterSize: 3,
	});
	vertSplit.pairs[0].gutter.id = "gutterVert";
	$("#gutterVert").hover(gutterVHandlerIn, gutterVHandlerOut);

	
	const horSplit = Split(['#appZone', '#terminalBar'],{
		direction: 'vertical',
		sizes: [75,25],
		gutterSize: 4, 	
	});
	horSplit.pairs[0].gutter.id = "gutterHoriz";
	$("#gutterHoriz").hover(gutterHHandlerIn, gutterHHandlerOut);

	$(".chartApp").on('click', function(e){
		$("#chartApp").show();
		$("#simulationApp").hide();
		appChartEnabled = 1;
		appSimulationEnabled = 0;
		console.log("toto");
	})

	$(".simulationApp").on('click', function(e){
		$("#chartApp").hide();
		$("#simulationApp").show();
		appChartEnabled = 0;
		appSimulationEnabled = 1;
		console.log("tutu");
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