'use strict';

const $ = document.querySelector.bind(document);
const electron = require('electron');
const ipc = electron.ipcRenderer;


// Set the page title
let config = ipc.sendSync('config');

// Set the canvas dimensions
let preview = $("#preview");
preview.style.width = config.width + "px";
preview.style.height = config.height + "px";

// For scrolling
let body = document.body;
body.style.minWidth = config.width + "px";
body.style.minHeight = config.height + "px";
body.style.backgroundColor = "#" + config.background;

// Listen when the preview is complete
preview.addEventListener('did-finish-load', function() {
    ipc.send('init');

    // Insert CSS to improve the preview
    preview.insertCSS(`
        body{
            margin:0;
            overflow:hidden;
            background:#${config.background}
        } 
        canvas{
            width: 100%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }`);

    // Show after reload
    preview.style.display = "flex";
    
    if (config.devTools) {
        preview.openDevTools();
    }
});

// Auto-show the dev-tools if console error
preview.addEventListener('console-message', function(e) {
    if (e.level == 2) {
        preview.openDevTools();
    }
});

// Menu toggle dev tools action
ipc.on('toggle-dev-tools', function() {
    if (preview.isDevToolsOpened()) {
        preview.closeDevTools();
    } else {
        preview.openDevTools();
    }
});

// Menu reload action
ipc.on('reload', function() {
    preview.style.display = "none";
    preview.reload();
});

// Set any saved settings
ipc.on('settings', function(event, settings) {
    body.className = settings.scaleToFit ? 'scaleToFit' : 'noScale';
});

// Load the preview
preview.src = "file://" + config.src;