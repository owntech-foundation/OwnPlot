/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-09-07 14:01:55
 * @ Description:
 */

const fs = require('fs')

const sendInput = $("#sendInput");
const sendBtn = $("#sendBtn");
const addCommandBtn = $("#addCommandBtn");
const addCommandName = $("#addCommandName");
const addCommandData = $("#addCommandData");
const addCommandColor = $("#addCommandColor");
const buttonConfigSelect = $("#buttonConfigSelect");
const saveConfigInputGroup = $("#saveConfigInputGroup");
const saveConfigButton = $("#saveConfigButton");
const saveConfigName = $("#saveConfigName");

const encoder = new TextEncoder();
const configButtonPath = "./config/buttons";

let commandButtons = [];
let filesConfigButton = [];

$(() => {
    disableSend();
    updateCommandButtons();

    enterKeyupHandler(sendInput, ()=>{
        send(sendInput.val());
        //not available in this version: printDebugTerminal('sent---> ' + sendInput.val());
    });

    sendBtn.on('click', () => {
        send(sendInput.val());
        //not available in this version: printDebugTerminal('sent---> ' + sendInput.val());
    });

    enterKeyupHandler(addCommandName, addCommandSubmitHandler);
    enterKeyupHandler(addCommandData, addCommandSubmitHandler);
    
    addCommandBtn.on('click', function(){
        addCommandSubmitHandler();
    });

    saveConfigButton.on('click', function(){
        saveCommandButtons(saveConfigName.val());
    });
    updateCommandFilesList();
});

function addCommandSubmitHandler(){
    let button={  
        //color: addCommandColor.val(),
        text: addCommandName.val(),
        command: addCommandData.val(),
        defaultColor: true, //color choice for commands is disabled for now
        isClear: false
    };
    // if(button.color == "#fffffe"){
    //     button.defaultColor = true; //we use fffffe as a default color and hope no one uses this specific color intentionnally
    // }
    // let brightness = parseInt(button.color.slice(1,3), 16);
    // brightness += parseInt(button.color.slice(3,5), 16);
    // brightness += parseInt(button.color.slice(5,7), 16);
    // if(brightness > 450){
    //     button.isClear=true;
    // }
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

function saveCommandButtons(filename) {
    const data = JSON.stringify(commandButtons)

    fs.writeFile(configButtonPath + "/" + filename + ".json", data, 'utf8', err => {
        if (err) {
            console.log(`Error writing file: ${err}`)
        } else {
            console.log(`File is written successfully!`)
            updateCommandFilesList(filename);
        }
    })
}

function loadCommandButtons(file) {
    commandButtons = [];
    fs.readFile(configButtonPath + "/" + file, 'utf8', (err, data) => {
        if (err) {
            console.log(`Error reading file from disk: ${err}`)
        } else {
            commandButtons = JSON.parse(data);
            updateCommandButtons();
        }
    })
}

function updateNewFiledVisibility() {
    $("#buttonConfigSelect option:selected").each(function() {
        if ($( this ).val() == "new") {
            saveConfigInputGroup.show();
        } else {
            saveConfigInputGroup.hide();
            loadCommandButtons($( this ).val());
        }
    });
}

function updateCommandFilesList(selectedItem) {
    let configSelecthtml = "";

    let itemNewSelected = "";
    if (selectedItem == "") {
        itemNewSelected = "selected";
    }

    configSelecthtml += "<option " + itemNewSelected + " value='new'>-- new --</option>";


    fs.readdir(configButtonPath, (err, files) => {
        if (err)
            console.log(err);
        else {
            filesConfigButton = files;
            filesConfigButton.forEach(file => {
                let itemSelected = "";
                if (selectedItem + ".json" == file) {
                    itemSelected = "selected";
                }
                configSelecthtml += "<option " + itemSelected + " value='" + file + "'>" + file + "</option>";
            buttonConfigSelect.html(configSelecthtml);
            })
            updateNewFiledVisibility();
        }
    })

    buttonConfigSelect.change(function() {
        updateNewFiledVisibility();
    })
}

function updateCommandButtons() {
    if(commandButtons.length){
        $("#commandButtonContainer").empty();
        commandButtons.forEach((elem, index) => {
            let iconHtml = "";
            if (elem.icon != "undefined") {
                iconHtml = '<i class="' + elem.icon + '"></i>&nbsp;';
            }
            let buttonHtml = '<div class="mb-2">';
            buttonHtml += '<div class="input-group">';
            if(elem.defaultColor){
                buttonHtml += '<button type="button" class="btn btn-primary col-8 commandButton" id="cmdBtn-' + index + '">' + iconHtml + elem.text + '</button>';
            } else {
                if(elem.isClear){
                    buttonHtml += '<button type="button" class="btn btn-primary col-8 commandButton" id="cmdBtn-' + index + '" style="background-color:' + elem.color + '; border-color:'+ elem.color +'; color:#000">' + iconHtml + elem.text + '</button>';
                } else {
                    buttonHtml += '<button type="button" class="btn btn-primary col-8 commandButton" id="cmdBtn-' + index + '" style="background-color:' + elem.color + '; border-color:'+ elem.color +';">' + iconHtml + elem.text + '</button>';
                }
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
        $("#commandButtonContainer").show();
    } else {
        $("#commandButtonContainer").hide();
    }
    if(portIsOpen){
        enableSend();
    } else {
        disableSend();
    }
}

async function send(stringToSend){
    await port.write(encoder.encode(stringToSend), (err) => {
        // if (err) {
        //     printDebugTerminal(err);
        // } not available in this version
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
