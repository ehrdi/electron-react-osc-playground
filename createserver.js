const osc = require('osc');

const createServer = function(port) {
    const newPort = new osc.UDPPort({
        localAddress: "0.0.0.0",
        localPort: port,
        remoteAddress: "127.0.0.1",
        remotePort: port
    })
    return newPort;
}

module.exports = createServer;