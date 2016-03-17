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

        // For measuring performance
        const startTime = process.hrtime()[1];

        // Include classes
        const Publisher = require('./lib/Publisher');
        const DataUtils = require('./lib/utils/DataUtils');

        // Create a new publisher
        const publisher = new Publisher(
            argv.src, // path to the javascript file
            argv.compress, // If the output should be compressed
            argv.debug // Don't delete the source file
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
    dialog.showMessageBox({
        type: 'error',
        message: 'A publishing error occured', 
        detail: argv.debug && message instanceof Error ? message.stack : String(message),
        buttons: ['Close'],
        icon: nativeImage.createFromPath(__dirname + '/assets/icon.png')
    });
}