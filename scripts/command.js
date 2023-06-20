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
const { ipcRenderer } = require('electron');

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
const saveConfigButtonButton = $("#saveConfigButtonButton");
const deleteButtonButton= $("#deleteButtonButton");
const terminalHistory = $("#terminalHistory");
const MAX_TERMINAL_LINES=1000;
const deleteConfigButton = $("#deleteConfigButton");


const encoder = new TextEncoder();
const configButtonPath = ipcRenderer.sendSync('get-user-data-folder') + "/config/buttons";

let commandButtons = [];
let fileCommandButtons = [];
let filesConfigButton = [];
let deleteMode = false;
let commandBtnTimestamp = $('#commandBtnTimestamp');

$(() => {
    disableSend();
    updateCommandButtons();

    enterKeyupHandler(sendInput, ()=>{
        send(sendInput.val());
        //not available in this version: printDebugTerminal('sent---> ' + sendInput.val());
    });

    sendBtn.on('click', () => {
        const commandConfig = commandButtons.find(button => button.command === sendInput.val());
        if(commandConfig){
            send(sendInput.val());
            console.log(commandConfig);
            appendToTerminal(sendInput.val() + " (" + commandConfig.text + ")");
        }else{
            appendToTerminal(sendInput.val() + " (" + 'unknown command' + ")");
        }
        //not available in this version: printDebugTerminal('sent---> ' + sendInput.val());
    });

    enterKeyupHandler(addCommandName, addCommandSubmitHandler);
    enterKeyupHandler(addCommandData, addCommandSubmitHandler);
    
    addCommandBtn.on('click', function() {
        addCommandSubmitHandler();
    });

    saveConfigButton.on('click', function() {
        if (saveConfigName.val().length > 0) {
            saveCommandButtons(addJsonOrNot(saveConfigName.val()));
        }
    });

    saveConfigButtonButton.on('click', function() {
        let val = $("#buttonConfigSelect option:selected").val()
        if (val == "new") {
            saveCommandButtons(addJsonOrNot(saveConfigName.val()));
        } else {
            saveCommandButtons($("#buttonConfigSelect option:selected").val());
        }
    });

    deleteButtonButton.on('click', function() {
        if (deleteMode) {
            deleteMode = false;
            deleteButtonButton.html("Delete buttons")
        } else {
            deleteMode = true;
            deleteButtonButton.html("Stop deleting buttons")
        }
        updateCommandButtons(); 
    });

    $("#clearHistoryButton").on("click", function() {
        $("#terminalHistory").empty();
    });

    updateCommandFilesList();

    commandTimestampBtnEnable(commandBtnTimestamp); //default behaviour
	commandBtnTimestamp.on('click', function(){
		if(commandBtnTimestamp.attr('aria-pressed') === "true"){
			//if it is enabled then disable it
			commandTimestampBtnDisable(commandBtnTimestamp);
		} else {
			commandTimestampBtnEnable(commandBtnTimestamp);
		}
	});

    $("#buttonConfigSelect").change(function () {
        updateNewFieldVisibility();
        const selectedConfig = $("#buttonConfigSelect option:selected").val();
        if (selectedConfig === "new") {
          deleteConfigButton.prop("disabled", true);
          deleteConfigButton.addClass("disabled"); // Add disabled class
        } else {
          deleteConfigButton.prop("disabled", false);
          deleteConfigButton.removeClass("disabled"); // Remove disabled class
        }
    });

    $("#deleteConfigButton").on('click', function() {
        let selectedConfig = $("#buttonConfigSelect option:selected").val();
        if (selectedConfig != "new") {
            deleteConfig(selectedConfig);
        }
    });    
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

function addJsonOrNot(filename) {
    extention = filename.slice(-5);
    if (extention != ".json" && extention != ".JSON")
    {
        return (filename + ".json");
    }
    return (filename);
}

function saveCommandButtons(filename) {
    const data = JSON.stringify(commandButtons)

    fs.writeFile(configButtonPath + "/" + filename, data, 'utf8', err => {
        if (err) {
            console.log(`Error writing file: ${err}`)
        } else {
            console.log(`File ${filename} is written successfully!`)
            updateCommandFilesList(filename);
        }
    })
}

function loadCommandButtons(file) {
    commandButtons = [];
    fileCommandButtons = [];

    fs.readFile(configButtonPath + "/" + file, 'utf8', (err, data) => {
        if (err) {
            console.log(`Error reading file from disk: ${err}`)
        } else {
            commandButtons = JSON.parse(data);
            fileCommandButtons = commandButtons.slice(); //copy of the array
            updateCommandButtons();
        }
    })
}

function updateNewFieldVisibility() {
    $("#buttonConfigSelect option:selected").each(function() {
        if ($( this ).val() == "new") {
            commandButtons = [];
            fileCommandButtons = [];
            updateCommandButtons(); //empty the buttons and update
            saveConfigInputGroup.show();
        } else {
            saveConfigInputGroup.hide();
            console.log($( this ).val());
            loadCommandButtons($( this ).val());
        }
    });

    // Enable and activate the delete configuration button
    deleteConfigButton.prop("disabled", false);
    deleteConfigButton.removeClass("disabled");
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
            filesConfigButton.forEach((file) => {
                let itemSelected = "";
                if (selectedItem == file) {
                    itemSelected = "selected";
                }
                configSelecthtml += "<option " + itemSelected + " value='" + file + "'>" + file + "</option>";
            buttonConfigSelect.html(configSelecthtml);
            });

            // Update the configuration select element
            buttonConfigSelect.html(configSelecthtml);

            // Set the selected item if provided
            if (selectedItem) {
                buttonConfigSelect.val(selectedItem);
            }

            updateNewFieldVisibility();

            // Disable the delete button if -- new -- is selected
            const selectedConfig = $("#buttonConfigSelect option:selected").val();
            if (selectedConfig === "new") {
                deleteConfigButton.prop("disabled", true);
            }
        }
    })

    buttonConfigSelect.change(function() {
        updateNewFieldVisibility();
    })
}

const compareArrays = (a, b) =>
    a.length === b.length &&
    a.every((element, index) => element === b[index]);

function updateCommandButtons() {

    if (commandButtons.length > 0) {
        deleteButtonButton.show();
    } else {
        deleteButtonButton.hide();
        deleteMode = false;
    }

    if (!compareArrays(commandButtons, fileCommandButtons)) { //local and file differs
        saveConfigButtonButton.show();
    } else {
        saveConfigButtonButton.hide();
    }

    if (commandButtons.length){
        $("#commandButtonContainer").empty();
        commandButtons.forEach((elem, index) => {
            let iconHtml = "";
            if (elem.icon != "undefined") {
                iconHtml = '<i class="' + elem.icon + '"></i>&nbsp;';
            }
            let buttonHtml = '<div class="mb-2">';
            buttonHtml += '<div class="input-group">';
            if(elem.defaultColor){
                buttonHtml += '<button type="button" class="btn btn-primary form-control commandButton" id="cmdBtn-' + index + '">' + iconHtml + elem.text + '</button>';
            } else {
                if(elem.isClear){
                    buttonHtml += '<button type="button" class="btn btn-primary form-control commandButton" id="cmdBtn-' + index + '" style="background-color:' + elem.color + '; border-color:'+ elem.color +'; color:#000">' + iconHtml + elem.text + '</button>';
                } else {
                    buttonHtml += '<button type="button" class="btn btn-primary form-control commandButton" id="cmdBtn-' + index + '" style="background-color:' + elem.color + '; border-color:'+ elem.color +';">' + iconHtml + elem.text + '</button>';
                }
            }
            if (deleteMode == true) {
                buttonHtml += '<button type="button" class="btn btn-danger removeCommandButton" id="rmvBtn' + index + '"><i class="fa-solid fa-trash-can deleteAnnim"></i></button>';
            }
            buttonHtml += '</div>';
            buttonHtml += '</div>';
            $("#commandButtonContainer").append(buttonHtml);
            $('#cmdBtn-' + index).on('click', function() { //check if port is opened
                send(elem.command);
                appendToTerminal(elem.command + " (" + elem.text + ")");
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

function appendToTerminal(command) {
    const commandElement = $("<span></span>").text(command);
    const timestampElement = $("<span></span>").text(commandTime());
    const lineElement = $("<div></div>").append(timestampElement, commandElement);
    terminalHistory.prepend(lineElement);

    // Remove the oldest lines if the number of lines exceeds the limit
    const commandElements = terminalHistory.children();
    if (commandElements.length > MAX_TERMINAL_LINES) {
        commandElements.slice(MAX_TERMINAL_LINES).remove();
    }
}

function commandTimestampBtnEnable(elem) {
	elem.attr('aria-pressed', 'true');
	elem.removeClass('btn-warning');
	elem.addClass('btn-success');
}

function commandTimestampBtnDisable(elem) {
	elem.attr('aria-pressed', 'false');
	elem.removeClass('btn-success');
	elem.addClass('btn-warning');
}

function commandTime() {
	let timeStr = "";
	if (commandBtnTimestamp.attr('aria-pressed') === "true") {
		let dataTime = new Date(); //we get the time of the last data received
		if(absTimeMode){
			timeStr = dateToPreciseTimeString(dataTime);
		} else { //relative time
			timeStr = millisecondsElapsed(chartStartTime, dataTime);
		}
		timeStr+= " -> ";
	}
	return(timeStr);
}

function deleteConfig(configName) {
    const filePath = configButtonPath + "/" + configName;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log(`Error deleting file: ${err}`);
      } else {
        console.log(`File ${configName} is deleted successfully!`);
  
        // Update the configuration files list
        updateCommandFilesList("");
  
        // Reset the selected option to -- new --
        buttonConfigSelect.val("new");
      }
    });
}
