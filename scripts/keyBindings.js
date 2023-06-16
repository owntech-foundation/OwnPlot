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
  
    // Listen for keydown event
    document.addEventListener('keydown', function(event) {
      // Replace the button text with the pressed key
      button.textContent = event.key;
  
      // Close the modal
      modal.style.display = 'none';
  
      // Remove the event listener to prevent further key presses
      document.removeEventListener('keydown', arguments.callee);
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





$(document).on('keydown', function(event) {
    var action1Btn = document.getElementById('action1Btn');
    var action1BtnText = action1Btn.textContent.trim();
    var action2Btn = document.getElementById('action2Btn');
    var action2BtnText = action2Btn.textContent.trim();
    var action3Btn = document.getElementById('action3Btn');
    var action3BtnText = action3Btn.textContent.trim();
    var action4Btn = document.getElementById('action4Btn');
    var action4BtnText = action4Btn.textContent.trim();

    if (event.key === action1BtnText) {
        event.preventDefault(); // Prevent the default key behavior (e.g., scrolling down the page)
        $('#openPortBtn').trigger('click'); // Trigger a click event on the selected button
    }
    if (event.key === action2BtnText) {
        event.preventDefault();
        $('#clearPortBtn').trigger('click');
    }
    if (event.key === action3BtnText) {
        event.preventDefault();
        $('#pausePortBtn').trigger('click');
    }
    if (event.key === action4BtnText) {
        event.preventDefault();
        $('#nav-command-tab').trigger('click');
    }
});