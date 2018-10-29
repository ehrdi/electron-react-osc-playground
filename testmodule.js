const osc = require('osc');

const createServer = function(port) {
    const newPort = new osc.UDPPort({
        localAddress: "0.0.0.0",
        localPort: port,
        remoteAddress: "127.0.0.1",
        remotePort: port
    })

    newPort.on("ready", function () {
        console.log('this is how a udp port looks: ', newPort.options.localPort);    
    });
    /*
    newPort.on("message", function (oscMessage, timetag, info) {
        console.log("OSC Message - UDP("+newPort.options.localPort+"): ", oscMessage);
    });
    
    newPort.on("error", function (err) {
        console.log(err);
    });
    */
    
    newPort.open();
    return newPort;
}

module.exports = createServer;