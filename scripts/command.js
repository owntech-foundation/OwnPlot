const sendInput = $("#sendInput");
const sendBtn = $("#sendBtn");
const addCommandBtn = $("#addCommandBtn");
const addCommandName = $("#addCommandName");
const addCommandData = $("#addCommandData");
const addCommandColor = $("#addCommandColor");

const encoder = new TextEncoder();

let commandButtons = [];

$(() => {
    disableSend();

    sendInput.on("keyup", (e) => {
        if (e.key == "Enter") {
            send(sendInput.val());
            printDebugTerminal('sent---> ' + sendInput.val());
        }
    });

    sendBtn.on('click', () => {
        send(sendInput.val());
        printDebugTerminal('sent---> ' + sendInput.val());
    });
    updateCommandButtons();

    addCommandBtn.on('click', function(){
        let button={  
            color: addCommandColor.val(),
            text: addCommandName.val(),
            command: addCommandData.val()
        };
        addCommandButton(button);
    });
});

function addCommandButton(newButton) {
    newButton.icon = "fa-solid fa-paper-plane";
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
            iconHtml = '<i class="' + elem.icon + '"></i>&nbsp;';
        }
        $("#commandButtonContainer").append('<div class="col-6"><button type="button" class="btn btn-primary commandButton" id="cmdBtn-' + index + '" style="background-color:' + elem.color + '">' + iconHtml + elem.text + '</button></div>');
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
    sendInput.prop("disabled", false);
    sendBtn.prop("disabled", false);
}

function disableSend() {
    sendInput.prop("disabled", true);
    sendBtn.prop("disabled", true);
}