/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-22 16:23:22
 * @ Modified by: Guillaume Arthaud
 * @ Modified time: 2022-09-07 13:43:49
 * @ Description:
 */

// Function to handle button click and key events
function openModal(buttonId) {
    // Store the button element
    var button = document.getElementById(buttonId);

    // Open the modal
    var modal = document.getElementById('myModal');
    modal.style.display = 'block';
  
    // Listen for keyup event
    document.addEventListener('keyup', function(event) {
      // Replace the button text with the pressed key
      button.textContent = event.code;
  
      // Close the modal
      modal.style.display = 'none';
  
      // Remove the event listener to prevent further key presses
      document.removeEventListener('keyup', arguments.callee);
    });
}
  
// Attach event listener to the button
var buttons = document.querySelectorAll('.key-binding-btn');
buttons.forEach(function(button) {
  button.addEventListener('click', function() {
    var buttonId = this.getAttribute('id');
    openModal(buttonId);
  });
});




// Store the button IDs and their corresponding action triggers
var buttonActions = {
    action1Btn: '#openPortBtn',
    action2Btn: '#clearPortBtn',
    action3Btn: '#pausePortBtn',
    action4Btn: '#nav-command-tab',
    action5Btn: '#nav-settings-tab',
    action6Btn: '#nav-chartConfig-tab',
    action7Btn: '#nav-record-tab',
    action8Btn: '#nav-keyBindings-tab'
};
  
$(document).on('keyup', function(event) {
    var targetButtonId = null;
  
    // Iterate through the buttonActions object to find a match
    for (var buttonId in buttonActions) {
      var button = document.getElementById(buttonId);
      var buttonText = button.textContent.trim();
  
      if (event.code === buttonText) {
        targetButtonId = buttonId;
        break;
      }
    }
  
    if (targetButtonId) {
      event.preventDefault();
      $(buttonActions[targetButtonId]).trigger('click');
    }
});