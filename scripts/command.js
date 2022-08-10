const sendInput = $("#sendInput");
const sendBtn = $("#sendBtn");

const encoder = new TextEncoder();

let commandButtons = [];

$(() => {
    disableSend();

    sendInput.on("keyup", (e) => {
        if (e.key == "Enter") {
            send(sendInput.val());
            console.log('sent---> ' + sendInput.val());
        }
    });

    sendBtn.on('click', () => {
        send(sendInput.val());
        console.log('sent---> ' + sendInput.val());
    });
    updateCommandButtons();
});

function addCommandButton() {
    let newButton = {
        color: "#ff00ff",
        icon: "fa-solid fa-code",
        text: "stop button",
        command: "s"
    }
    commandButtons.push(newButton);
    updateCommandButtons();
}

function removeCommandButton(index) {
    commandButtons.splice(index, 1);
    updateCommandButtons();
}

function updateCommandButtons() {
    $("#commandButtonContainer").empty();
    commandButtons.forEach((elem, index) => {
        let iconHtml = "";
        if (elem.icon != "undefined") {
            iconHtml = '<i class="' + elem.icon + '"></i>&nbsp;'
        }
        $("#commandButtonContainer").append('<button type="button" class="btn btn-primary commandButton" id="cmdBtn-' + index + '" >' + iconHtml + elem.text + '</button>');
        $('#cmdBtn-' + index).on('click', function() { //check if port is opened
            send(elem.command);
        });
    });

}

async function send(stringToSend){
    await port.write(encoder.encode(stringToSend), (err) => {
        if (err) {
            printDebugTerminal(err);
        }
       });
}

function enableSend() {
    sendInput.attr("disabled", false);
    sendBtn.attr("disabled", false);
}

function disableSend() {
    sendInput.attr("disabled", true);
    sendBtn.attr("disabled", true);
}