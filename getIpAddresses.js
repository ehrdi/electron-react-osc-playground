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

module.exports = getIPAddresses;