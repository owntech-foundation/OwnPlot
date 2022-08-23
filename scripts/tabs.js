const navLink = $(".nav-link");
const navTabContent = $("#nav-tabContent");

let currentTab = $(".nav-link.active").attr("id");
let tabShown = true;
$(()=>{
    navTabContent.show(0);
    navTabContent.collapse("show");
    navLink.on("click", function() {
        if($(this).attr("id") == currentTab){
            if(tabShown){
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
    navTabContent.on("hidden.bs.collapse", function(){
        $(this).hide();
    });
});

function scrollDown(elementToShow){
    navTabContent.show(0); //display with no animation otherwise the following animation will try to scroll to nothing and will stop instantly
    $('html, body').animate({
        scrollTop: elementToShow.offset().top
    }, 0); //scroll down the element
    elementToShow.collapse("show");  //allows the use collapse("hide") later
}