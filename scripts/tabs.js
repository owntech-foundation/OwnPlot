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
        $($(this).attr('href')).collapse("toggle"); // Collapse doesn't work only with data-bs-toggle, i can't figure why
    });
});

function updateHeight(elemSelector){
	elemSelector.css("height", Math.floor($(window).height() - elemSelector.offset().top)+1);
}