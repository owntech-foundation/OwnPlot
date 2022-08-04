const sendInput = $("#sendInput");
const sendBtn = $("#sendBtn");

const encoder = new TextEncoder();

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
});

async function send(stringToSend){
    await port.write(encoder.encode(stringToSend));
}

function enableSend(){
    sendInput.attr("disabled", false);
    sendBtn.attr("disabled", false);
}

function disableSend(){
    sendInput.attr("disabled", true);
    sendBtn.attr("disabled", true);
}