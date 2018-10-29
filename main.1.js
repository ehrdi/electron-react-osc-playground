const electron = require('electron');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const osc = require('osc');
const http = require('http');
const express = require('express');
const WebSocket = require('ws');

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

    // fires when window gets closed
    win.on('closed', () => {
        // Dereferenzieren des Fensterobjekts, normalerweise würden Sie Fenster
        // in einem Array speichern, falls Ihre App mehrere Fenster unterstützt. 
        // Das ist der Zeitpunkt, an dem Sie das zugehörige Element löschen sollten.
        win = null;
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    // Unter macOS ist es üblich für Apps und ihre Menu Bar
    // aktiv zu bleiben bis der Nutzer explizit mit Cmd + Q die App beendet.
    if(process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    // Unter macOS ist es üblich ein neues Fenster der App zu erstellen, wenn
    // das Dock Icon angeklickt wird und keine anderen Fenster offen sind.
    if (win === null) {
      createWindow();
    }
})

ipcMain.on('async-message', (event, arg) => {
    console.log(arg);
    event.sender.send('async-reply', 'pong');
})

//store the active UDP Port Objects and all the active Portnumbers in an Array
const usedPorts = [];

ipcMain.on('generateNewOscServer', (event, args) => {
    const port = args.port || null;
    // check if port is already in use
    if(port && usedPorts.indexOf(port) === -1) {
        usedPorts.push(port);

        //create new OSC UDP Server and store it into array
        udpPorts.push(new osc.UDPPort({
            localAddress: "0.0.0.0",
            localPort: port,
            remoteAddress: "127.0.0.1",
            remotePort: port
        }))



    }
    if(oscMsg.address === '/generateNewOscServer') {
        const port = oscMsg.args[0] || 57122

        if(usedPorts.indexOf(port) === -1) {
            usedPorts.push(port);

            udpPorts.push(new osc.UDPPort({
                localAddress: "0.0.0.0",
                localPort: port,
                remoteAddress: "127.0.0.1",
                remotePort: port
            }))

            udpPorts[udpPorts.length -1].on('ready', () => {
                console.log('New OSC Server ready on UDP Port ', port);
                socketPort.send({
                    address: "/udpPortReady",
                    args: [
                        { 
                            type: "i",
                            value: port
                        }
                    ]
                });
            })

            udpPorts[udpPorts.length -1].on("message", function (oscMessage) {
                oscMessage.args.unshift({
                    type: "i",
                    value: port
                })
                socketPort.send(oscMessage)
                console.log("OSC Message - UDP(",port,"): ", oscMessage);
            });

            udpPorts[udpPorts.length -1].open();

        } else {
            console.log('Error: UDP Port ', port, ' already in use');
        }
    }
})

/****************
 * OSC Over UDP *
 ****************/

var getIPAddresses = function () {
    var os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

// OSC Main Server Process
var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 57121
});

udpPort.on("ready", function () {
    var ipAddresses = getIPAddresses();

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

/***********************
 * OSC Over WebSockets *
 ***********************/
const expressApp = express();
const server = expressApp.listen(8081);



const wss = new WebSocket.Server({
    server: server
});

wss.on('connection', (socket) => {
    console.log("A Web Socket connection has been established!");

    const socketPort = new osc.WebSocketPort({
        socket: socket,
        metadata: false
    });
/*
    new osc.Relay(udpPort, socketPort, {
        raw: true
    });
*/
    socketPort.on('message', (oscMsg) => {

        console.log('OSC Message -  WebSocket ', oscMsg);

        
    })
});