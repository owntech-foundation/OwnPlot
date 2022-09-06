/**
 * @ Author: Guillaume Arthaud & Matthias Riffard (OwnTech Fundation)
 * @ Website: https://www.owntech.org/
 * @ Mail: guillaume.arthaud.pro@gmail.com
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Matthias Riffard
 * @ Modified time: 2022-09-05 15:26:56
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

	updateHeight($("#terminalBar"));
	updateHeight($("#sideBar"));
	$(window).on('resize', function(){
		setTimeout(function() {
			updateHeight($("#terminalBar"));
			updateHeight($("#sideBar"));
		}, 50); //Set a first height quickly to avoid blinking
		setTimeout(function() {
			updateHeight($("#terminalBar"));
			updateHeight($("#sideBar"));
		}, 200); //Set definitive height after a longer delay, so that the eventual animation is done
	});
    
    collapseHead.on('click', function(){
		const head = this;
        $($(this).attr('data-target')).collapse("toggle"); // Collapse doesn't work only with data-bs-toggle, i can't figure why
    });
});

function updateHeight(elemSelector){
	elemSelector.css("height", Math.floor($(window).height() - elemSelector.offset().top)+1);
}