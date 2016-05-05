"use strict";

const electron = require('electron');
const app = electron.app;
const argv = require('yargs').argv;
const path = require('path');

app.dock.hide();

app.on('ready', function() {

    if (!argv.src) {
        alert("Source must be path to data output.");
    }
    else if (!/\.json$/i.test(argv.src)) {
        alert("Data file must be valid JSON.");
    }
    else {

        // For measuring performance
        const startTime = process.hrtime()[1];

        // Include classes
        const Publisher = require('./Publisher');
        const DataUtils = require('./utils/DataUtils');

        // Create a new publisher
        const publisher = new Publisher(
            argv.src, // path to the javascript file
            argv.compress, // If the output should be compressed
            argv.debug // Don't delete the source file
        );

        // Allow override of snippets for debugging purposes
        publisher.renderer.snippetsPath = path.resolve(
            argv.assets || __dirname, 'snippets'
        );

        try {
            console.log(publisher.run());
        }
        catch(e) {
            alert(e);
        }

        // Output performance information
        if (argv.perf)
        {
            let executionTime = DataUtils.toPrecision(
                (process.hrtime()[1] - startTime) / Math.pow(10, 9), 4
            );
            console.log(`\nExecuted in ${executionTime} seconds\n`);
        }
    }
    app.quit();
});

function alert(message) {
    const dialog = require('dialog');
    const nativeImage = require('electron').nativeImage;

    // Use the assets if it's setup, debugging purposes
    const icon = path.resolve(argv.assets || __dirname, 'assets/icon.png');

    dialog.showMessageBox({
        type: 'error',
        message: 'A publishing error occured', 
        detail: argv.debug && message instanceof Error ? message.stack : String(message),
        buttons: ['Close'],
        icon: nativeImage.createFromPath(icon)
    });
}