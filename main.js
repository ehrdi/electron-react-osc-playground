const electron = require('electron');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const http = require('http');

let win;
let dev = false

// lookup if the app is started in dev mode
// defaultApp is true when the App is started by being passed as a parameter to the default App.
// when there is "electron-prebuilt" or "electron" somehwere in the Path the App is also started in dev mode.
if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
  dev = true
}

function createWindow() {
    //create browser window
    win = new BrowserWindow({ width: 1200, height: 900 });

    //Webpack
    if(dev && process.argv.indexOf('--noDevServer') === -1) {
        win.loadURL('http://localhost:8080/index.html');
    } else {
        win.loadURL('file://'+path.join(__dirname, 'dist', 'index.html'));
    }

    win.once('ready-to-show', () => {
        win.show();
        //open dev tools in dev mode
        if(dev) {
            win.webContents.openDevTools();
        }
    })

    win.on('closed', () => {
        win = null;
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    // on macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if(process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    // on macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
})

/****************
 * Main Process *
 ****************/
ipcMain.on('async-message', (event, arg) => {
    console.log(arg);
    event.sender.send('async-reply', 'pong');
})