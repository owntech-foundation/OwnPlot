const sendInput = $("#sendInput");
const sendBtn = $("#sendBtn");

const encoder = new TextEncoder();

let commandButtons = [
    {
        color: "#ff0000",
        text: "test button",
        command: "t"
    }
];

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
        text: "test button",
        command: "t"
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
        $("#commandButtonContainer").append('<button type="button" class="btn btn-primary commandButton" id="cmdBtn-' + index + '" >' + elem.text + '</button>');
    });
}

async function send(stringToSend){
    await port.write(encoder.encode(stringToSend));
}

function enableSend() {
    sendInput.attr("disabled", false);
    sendBtn.attr("disabled", false);
}

function disableSend() {
    sendInput.attr("disabled", true);
    sendBtn.attr("disabled", true);
}