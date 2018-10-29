const electron = require('electron');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const osc = require('osc');
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

//store all the active UDP Port Objects in an Array
const usedPorts = [];

ipcMain.on('generateNewOscServer', (event, args) => {
    const port = args.port || null;
    let freePort = true;
    // check if port is already in use
    usedPorts.map( (udpServer) => {
        if(udpServer.options.localPort === port){
            freePort = false;
        }
    })
    if(freePort) {
        //reference for the address to send osc messages to the client
        let address = 'osc'
        //create new OSC UDP Server and store it into array
        usedPorts.push(new osc.UDPPort({
            localAddress: "0.0.0.0",
            localPort: port,
            remoteAddress: "127.0.0.1",
            remotePort: port
        }))

        //when the Port is ready adjust the address for communication
        //so we can reach the right Component in the Renderprocess
        usedPorts[usedPorts.length -1].on('ready', () => {
            console.log('New OSC Server ready on UDP Port ', port);
            address = 'osc'+port;
            const message = 'New OSC Server ready on UDP Port '+port;
            event.sender.send(address, message);
        })

        //when an OSC Message comes in on the Port, format the Message with 
        //additional infos and send it to the Component in the Renderprocess 
        usedPorts[usedPorts.length -1].on("message", function (oscMessage) {
            //TODO - format osc messages
            console.log("OSC Message - UDP(",port,"): ", oscMessage);
            const message = 'New OSC Message from UDP Port '+port+ ':';
            event.sender.send(address, message);
            event.sender.send(address, oscMessage);
        });

        //open UDP Port
        usedPorts[usedPorts.length -1].open();
    } else {
        //throw Error when UDP Port is already in use
        throw new Error('UDP Port ', port, ' already in use');
    }
})

/****************
 * OSC Over UDP *
 ****************/
/*
const getIPAddresses = function () {
    const os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (const deviceName in interfaces) {
        const addresses = interfaces[deviceName];
        for (let i = 0; i < addresses.length; i++) {
            const addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

// OSC Main Server Process
const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 57121
});

udpPort.on("ready", function () {
    const ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", udpPort.options.localPort);
    });
    usedPorts.push(udpPort);
    console.log('this is how a udp port looks: ', udpPort.options.localPort);
});

udpPort.on("message", function (oscMessage, timetag, info) {
    console.log("OSC Message - UDP( main ): ", oscMessage);
});

udpPort.on("error", function (err) {
    console.log(err);
});

udpPort.open();
*/