const { Worker } = require('worker_threads');

//MULTITHREADING FOR TERMINALS
let terminalBtnCreation = $('#terminalBtnCreation');

terminalBtnCreation.on('click', function() {
    const terminalThread = new Worker('./scripts/terminal.js');
    terminalThread.postMessage('create new terminal'); 
});
