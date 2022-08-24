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

    addCommandName.on("keyup", (e) => {
        if (e.key == "Enter") {
            addCommandSubmitHandler();
        }
    });
    addCommandData.on("keyup", (e) => {
        if (e.key == "Enter") {
            addCommandSubmitHandler();
        }
    });
    addCommandBtn.on('click', function(){
        addCommandSubmitHandler();
    });
});

function addCommandSubmitHandler(){
    let button={  
        color: addCommandColor.val(),
        text: addCommandName.val(),
        command: addCommandData.val()
    };
    if(button.text == ""){
        addCommandName[0].select();
    } else if(button.command == ""){
        addCommandData[0].select();
    } else {
        addCommandButton(button);
    }
}

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
        let buttonHtml = '<div class="col-6 mb-2">';
        buttonHtml += '<div class="input-group">';
        if(elem.color != "#fffffe"){
            buttonHtml += '<button type="button" class="btn btn-primary commandButton" id="cmdBtn-' + index + '" style="background-color:' + elem.color + '">' + iconHtml + elem.text + '</button>';
        } else {
            buttonHtml += '<button type="button" class="btn btn-primary commandButton" id="cmdBtn-' + index + '">' + iconHtml + elem.text + '</button>';
        }
        buttonHtml += '<button type="button" class="btn btn-danger removeCommandButton" id="rmvBtn' + index + '"><i class="fa-solid fa-trash-can"></i></button>';
        buttonHtml += '</div>';
        buttonHtml += '</div>';
        $("#commandButtonContainer").append(buttonHtml);
        $('#cmdBtn-' + index).on('click', function() { //check if port is opened
            send(elem.command);
        });
    });
    $(".removeCommandButton").on("click", function(){
        let buttonIndex = getIntInString($(this).attr("id"));
        commandButtons.splice(buttonIndex, 1);
        updateCommandButtons();
    });
    if($("#openPortBtn")[0].innerHTML == 'Port opened'){
        enableSend();
    } else {
        disableSend();
    }
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
    $(".commandButton").prop("disabled", false);
}

function disableSend() {
    sendInput.prop("disabled", true);
    sendBtn.prop("disabled", true);
    $(".commandButton").prop("disabled", true);
}
