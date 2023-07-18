/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Jean Alinei
 * @ Modified time: 2022-09-08 12:20:33
 * @ Description:
 */

let isFirstKeyupListenerActive = false;

function openKeyBindingsModal(buttonId) {
  const button = document.getElementById(buttonId);
  const buttonTextArray = [];
  const messageElement = document.getElementById('duplicateMessage');

  for (const actionButtonId in buttonActions) {
    const actionButton = document.getElementById(actionButtonId);
    const buttonText = actionButton.textContent.trim();
    buttonTextArray.push(buttonText);
  }

  const modal = document.getElementById('keyBindingsModal');
  modal.style.display = 'block';

  const handleKeyup = (event) => {    
    button.textContent = event.code;
    localStorage.setItem(buttonId, event.code);
    buttonTextArray.length = 0;
    for (const actionButtonId in buttonActions) {
      const actionButton = document.getElementById(actionButtonId);
      const buttonText = actionButton.textContent.trim();
      buttonTextArray.push(buttonText);
    }
    modal.style.display = 'none';

    const keyDuplicates = getDuplicates(buttonTextArray);
    messageElement.textContent = keyDuplicates.length >= 1
      ? "WARNING : Two or more buttons have the same key binding."
      : "";
    messageElement.style.color = keyDuplicates.length >= 1
      ? "red"
      : "";

    document.removeEventListener('keyup', handleKeyup);
    isFirstKeyupListenerActive = false;

  };

  document.addEventListener('keyup', handleKeyup);
}



const buttons = document.querySelectorAll('.key-binding-btn');
buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const buttonId = button.getAttribute('id');
    openKeyBindingsModal(buttonId);
    isFirstKeyupListenerActive = true;
  });
});



function getDuplicates(array) {
  return array.filter((item, index) => array.indexOf(item) !== index);
}



const resetButton = document.getElementById('keyBindingsReset');
resetButton.addEventListener('click', () => {
  buttons.forEach((button) => {
    const buttonId = button.getAttribute('id');
    localStorage.removeItem(buttonId);
    loadDefaultButtonText(button, buttonId);
  });
  const messageElement = document.getElementById('duplicateMessage');
  messageElement.textContent = "";
});



function retrieveButtonConfigurations() {
  buttons.forEach((button) => {
    const buttonId = button.getAttribute('id');
    const savedButtonText = localStorage.getItem(buttonId);
    if (savedButtonText) {
      button.textContent = savedButtonText;
    } else {
      loadDefaultButtonText(button, buttonId);
    }
  });
  const messageElement = document.getElementById('duplicateMessage');
  const buttonTextArray = [];
  buttons.forEach((button) => {
    const buttonText = button.textContent.trim();
    buttonTextArray.push(buttonText);
  });
  const keyDuplicates = getDuplicates(buttonTextArray);
  messageElement.textContent = keyDuplicates.length >= 1
    ? "WARNING: Two or more buttons have the same key binding."
    : "";
  messageElement.style.color = keyDuplicates.length >= 1
    ? "red"
    : "";
}

function loadDefaultButtonText(button, buttonId) {
  fetch('config/keybindings/default_key_config.json')
    .then((response) => response.json())
    .then((defaultConfig) => {
      const defaultText = defaultConfig[buttonId];
      button.textContent = defaultText;
      localStorage.setItem(buttonId, defaultText);
    })
    .catch((error) => {
      console.error('Failed to load default button text:', error);
    });
}



window.addEventListener('DOMContentLoaded', () => {
  retrieveButtonConfigurations();
});



const buttonActions = {
  action1Btn: '#openPortBtn',
  action2Btn: '#clearPortBtn',
  action3Btn: '#pausePortBtn',
  action4Btn: '#nav-command-tab',
  action5Btn: '#nav-settings-tab',
  action6Btn: '#nav-chartConfig-tab',
  action7Btn: '#nav-record-tab',
  action8Btn: '#nav-mockPorts-tab',
  action9Btn: '#nav-keyBindings-tab'
};



document.addEventListener('keyup', (event) => {
  event.preventDefault();
  if (!isFirstKeyupListenerActive){
    for (const buttonId in buttonActions) {
      const button = document.getElementById(buttonId);
      const buttonText = button.textContent.trim();
      if (event.code === buttonText) {
        //event.preventDefault();
        $(buttonActions[buttonId]).trigger('click');
        break;
      }
    }
  } 
});
