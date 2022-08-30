const navLink = $(".nav-link");
const navTabContent = $("#nav-tabContent");
const collapseHead = $(".collapseHead");

let currentTab = $(".nav-link.active").attr("id");
let tabShown = true;
$(()=>{
    collapseHead.on('click', function(){
        $($(this).attr('href')).collapse("toggle"); // Collapse doesn't work only with data-bs-toggle, i can't figure why
    });
    /*
    navTabContent.collapse("show");
    navLink.on("click", function() {
        if($(this).attr("id") == currentTab){
            if(tabShown){
                navTabContent.one("hidden.bs.collapse", function(){
                    $(this).hide(); //This avoids the tab content reopening that happens idk why. We do it only once each time otherwise other pannels collapsing will trigger this
                });
                navTabContent.collapse("hide");
                tabShown = false;
            } else {
                scrollDown(navTabContent);
                tabShown = true;
            }
        } else {
            scrollDown(navTabContent);
            tabShown = true;
            currentTab = $(this).attr("id");
        }
    });
    */
});

function scrollDown(elementToShow){
    navTabContent.show(0); //display with no animation otherwise the following animation will try to scroll to nothing and will stop instantly
    $('html, body').animate({
        scrollTop: elementToShow.offset().top
    }, 0); //scroll down the element
    elementToShow.collapse("show");  //allows the use collapse("hide") later
}