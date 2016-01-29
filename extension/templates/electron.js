const electron = require('electron'); 
const app = electron.app;  // Control application life
const BrowserWindow = electron.BrowserWindow;  // Native browser window 

// Keep a global reference of the window object
var mainWindow = null; 

// Quit when all windows are closed. 
app.on('window-all-closed', function() { 
    app.quit(); 
});

// Clear when closed
app.on('before-quit', function() {
    if (mainWindow) {
        mainWindow.removeAllListeners('close');
        mainWindow.close();
    }
});

// This method will be called when Electron has finished 
// initialization and is ready to create browser windows. 
app.on('ready', function() { 
    mainWindow = new BrowserWindow({
        width: ${width},
        height: ${height}
    }); 
    mainWindow.loadURL('file://' + __dirname + '/${htmlPath}'); 
    mainWindow.webContents.openDevTools(); 
    mainWindow.on('closed', function() { 
        mainWindow = null; 
    }); 
});