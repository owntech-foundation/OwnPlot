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

$(() => {   
	var vertSplit = Split(['#sideBar', '#chartAndTerminalDiv'],{
		sizes: [25,75],
		gutterSize: 3,
		// onDrag: cbVertSplitHandler,
	});

	var horSplit = Split(['#chartZone', '#terminalBar'],{
		direction: 'vertical',
		sizes: [75,25],
		gutterSize: 3, 	

		// onDrag: cbHorizSplitHandler,
	});

	// function cbHorizSplitHandler(){
	// 	$('#myChart').height($('#chartZone').css('height'));
	// 	// $('#myChart').css('height') = $('#chartZone').height;
	// }

	// function cbVertSplitHandler(){
	// 	console.log('toto');
	// }
});