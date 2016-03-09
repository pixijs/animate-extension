"use strict";

const electron = require('electron');
const app = electron.app;
const argv = require('yargs').argv;

app.on('ready', function() {

    if (!argv.src) {
        alert("Source must be path to data output.");
    }
    else if (!/\.json$/i.test(argv.src)) {
        alert("Data file must be valid JSON.");
    }
    else {
        // Main entry point for the application
        const Publisher = require('./lib/publisher');
        const publisher = new Publisher(argv.src, argv.debug);

        try {
            publisher.run();
        }
        catch(e) {
            alert(e.message);
        }
    }
    app.quit();
});

function alert(message) {
    const dialog = require('dialog');
    const nativeImage = require('electron').nativeImage;
    dialog.showMessageBox({
        type: 'error',
        message: 'A publishing error occured', 
        detail: message,
        buttons: ['Close'],
        icon: nativeImage.createFromPath(__dirname + '/assets/icon.png')
    });
}