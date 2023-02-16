const fs = require('fs-extra');

exports.default = async function(context) {

fs.copy('./war', './resources/app', (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('CircuitJs precompiled files directory copied successfully in App repository.');
    }
    });

}