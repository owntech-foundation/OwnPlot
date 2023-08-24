const buttons = document.querySelectorAll('.key-binding-btn');
const resetButton = document.getElementById('keyBindingsReset');
const buttonActions = {
  action1Btn: '#openPortBtn',
  action2Btn: '#clearPortBtn',
  action3Btn: '#pausePortBtn',
  action4Btn: '#nav-command-tab',
  action5Btn: '#nav-settings-tab',
  action6Btn: '#nav-chartConfig-tab',
  action7Btn: '#nav-record-tab',
  action8Btn: '#nav-ports-tab',
  action9Btn: '#nav-keyBindings-tab'
};
let isFirstKeyupListenerActive = false;



function openKeyBindingsModal(buttonId) {
  const button = document.getElementById(buttonId);
  const buttonTextArray = [];
  const modal = document.getElementById('keyBindingsModal');

  for (const actionButtonId in buttonActions) {
    const actionButton = document.getElementById(actionButtonId);
    const buttonText = actionButton.textContent.trim();
    buttonTextArray.push(buttonText);
  }

  modal.style.display = 'block';

  const handleKeyup = (event) => {
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Meta');
  
    const lastModifier = modifiers.length > 0 ? modifiers[modifiers.length-1] : '';
    const keyCombination = lastModifier !== '' ? lastModifier + '+' + event.code : event.code;
    button.textContent = keyCombination;
  
    try {
      localStorage.setItem(buttonId, keyCombination);
    } catch (error) {
      console.error('Failed to store key combination in localStorage:', error);
      return;
    }
  
    buttonTextArray.length = 0;
    for (const actionButtonId in buttonActions) {
      const actionButton = document.getElementById(actionButtonId);
      const buttonText = actionButton.textContent.trim();
      buttonTextArray.push(buttonText);
    }

    modal.style.display = 'none';
  
    handleDuplicates(buttonTextArray);

    document.removeEventListener('keyup', handleKeyup);
    isFirstKeyupListenerActive = false;
  };
  document.addEventListener('keyup', handleKeyup);
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const buttonId = button.getAttribute('id');

    openKeyBindingsModal(buttonId);
    isFirstKeyupListenerActive = true;
  });
});

function handleDuplicates(buttonTextArray) {
  const messageElement = document.getElementById('duplicateMessage');
  const keyDuplicates = getDuplicates(buttonTextArray);

  messageElement.textContent = keyDuplicates.length >= 1
    ? "WARNING: Two or more buttons have the same key binding."
    : "";
  messageElement.style.color = keyDuplicates.length >= 1
    ? "red"
    : "";
}

function getDuplicates(array) {
  return array.filter((item, index) => array.indexOf(item) !== index);
}



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

  const buttonTextArray = [];
  buttons.forEach((button) => {
    const buttonText = button.textContent.trim();
    buttonTextArray.push(buttonText);
  });
  handleDuplicates(buttonTextArray);
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





// Document event listener
document.addEventListener('keyup', (event) => {
  event.preventDefault();
  if (!isFirstKeyupListenerActive) {
    let foundMatch = false;
    for (const buttonId in buttonActions) {
      const button = document.getElementById(buttonId);
      const keyCombination = localStorage.getItem(buttonId);
      if (keyCombination) {
        const [storedModifiers, storedKey] = keyCombination.split('+');
        const isCtrlKey = event.ctrlKey;
        const isAltKey = event.altKey;
        const isShiftKey = event.shiftKey;
        const isMetaKey = event.metaKey;

        const matchModifiers =
          storedModifiers.includes('Ctrl') === isCtrlKey &&
          storedModifiers.includes('Alt') === isAltKey &&
          storedModifiers.includes('Shift') === isShiftKey &&
          storedModifiers.includes('Meta') === isMetaKey;

        // Check if there's a match with modifiers and the key
        if (matchModifiers && storedKey === event.code && !$(buttonActions[buttonId]).prop('disabled')) {
          $(buttonActions[buttonId]).trigger('click');
          foundMatch = true;
          break;
        }

        // Check if there's a match without modifiers and only the key
        if (!keyCombination.includes('+') && storedKey === event.code && !$(buttonActions[buttonId]).prop('disabled')) {
          $(buttonActions[buttonId]).trigger('click');
          foundMatch = true;
          break;
        }
      }
    }

    // If no match is found, try to trigger actions with single key bindings (no modifiers)
    if (!foundMatch) {
      for (const buttonId in buttonActions) {
        const button = document.getElementById(buttonId);
        const keyCombination = localStorage.getItem(buttonId);
        if (keyCombination && !keyCombination.includes('+') && keyCombination === event.code && !$(buttonActions[buttonId]).prop('disabled')) {
          $(buttonActions[buttonId]).trigger('click');
          break;
        }
      }
    }
  }
});
