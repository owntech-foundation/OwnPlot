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

const navLink = $(".nav-link");
const navTabContent = $("#nav-tabContent");
const collapseHead = $(".collapseHead");

let currentTab = $(".nav-link.active").attr("id");
$(()=>{
	$("nav-ownTech-logo").on('click', function(){
		window.location.href='https://www.w3docs.com';
	});

	//updateHeight($("#terminalBar")); //TODO: for each app
	updateHeight($("#app100"));
	updateHeight($("#app200"));


	
	updateHeight($("#sideBar"));
	$(window).on('resize', function(){
		setTimeout(function() {
			//updateHeight($("#terminalBar")); //for each appp

			updateHeight($("#app100"));
			updateHeight($("#app200"));

			
			updateHeight($("#sideBar"));
		}, 50); //Set a first height quickly to avoid blinking
		setTimeout(function() {
			//updateHeight($("#terminalBar")); //for each app

			updateHeight($("#app100"));
			updateHeight($("#app200"));

			updateHeight($("#sideBar"));
		}, 200); //Set definitive height after a longer delay, so that the eventual animation is done
	});
    
    $(".collapseHead").on('click', function(){
		const head = this;
        $($(this).attr('data-target')).collapse("toggle"); // Collapse doesn't work only with data-bs-toggle, i can't figure why
    });
});

function updateHeight(elemSelector){
	elemSelector.css("height", Math.floor($(window).height() - elemSelector.offset().top)+1);
}