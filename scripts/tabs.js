const navLink = $(".nav-link");
const navTabContent = $("#nav-tabContent");
const collapseHead = $(".collapseHead");

let currentTab = $(".nav-link.active").attr("id");
let tabShown = true;
$(()=>{    
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
        $($(this).attr('href')).collapse("toggle"); // Collapse doesn't work only with data-bs-toggle, i can't figure why
    });
});

function scrollDown(elementToShow){
    navTabContent.show(0); //display with no animation otherwise the following animation will try to scroll to nothing and will stop instantly
    $('html, body').animate({
        scrollTop: elementToShow.offset().top
    }, 0); //scroll down the element
    elementToShow.collapse("show");  //allows the use collapse("hide") later
}

function updateHeight(elemSelector){
	elemSelector.css("height", Math.floor($(window).height() - elemSelector.offset().top)+1);
}