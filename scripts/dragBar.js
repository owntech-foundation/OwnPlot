/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Your name
 * @ Modified time: 2022-09-07 13:44:23
 * @ Description:
 */

const { split } = require("lodash");

$(() => {   
	const vertSplit = Split(['#sideBar', '#chartAndTerminalDiv'],{
		sizes: [25,75],
		gutterSize: 3,
		// onDrag: cbVertSplitHandler,
	});
	vertSplit.pairs[0].gutter.id = "gutterVert";
	$("#gutterVert").hover(gutterVHandlerIn, gutterVHandlerOut);

	
	const horSplit = Split(['#chartZone', '#terminalBar'],{
		direction: 'vertical',
		sizes: [75,25],
		gutterSize: 4, 	
		// onDrag: cbHorizSplitHandler,
	});
	horSplit.pairs[0].gutter.id = "gutterHoriz";
	$("#gutterHoriz").hover(gutterHHandlerIn, gutterHHandlerOut);

	// function cbHorizSplitHandler(){
	// 	$('#myChart').height($('#chartZone').css('height'));
	// 	// $('#myChart').css('height') = $('#chartZone').height;
	// }

	// function cbVertSplitHandler(){
	// 	console.log('toto');
	// }
});

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