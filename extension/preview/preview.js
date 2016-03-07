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
let frame = $("#frame");
frame.style.minWidth = config.width + "px";
frame.style.minHeight = config.height + "px";

// Set the background color
document.body.style.backgroundColor = "#" + config.background;

// Listen when the preview is complete
preview.addEventListener('did-finish-load', function() {
    ipc.send('init');
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
    preview.reload();
});

// Load the preview
preview.src = "file://" + config.src;