const { WriteStream } = require("original-fs");

const sendInput = $("#sendInput");
const sendBtn = $("#sendBtn");

const encoder = new TextEncoder();

$(() => {
    sendInput.on("keyup", (e) => {
        if (e.key == "Enter") {
            send(sendInput.val());
            console.log('sent---> ' + sendInput.val());
        }
    });

    sendBtn.on('click', () => {
        console.log(sendInput.val());
    });
});

async function send(stringToSend){
    await port.write(encoder.encode(stringToSend));
}