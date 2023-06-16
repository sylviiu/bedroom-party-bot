const net = require('net');
const tls = require('tls')

const socket = tls.connect({
    host: `multiplayer-balancer.beatsaberplus.com`,
    port: 443,
    rejectUnauthorized: false,
});

socket.on(`connect`, () => {
    console.debug(`Connected to MultiplayerPlus server!`)
});

socket.on(`error`, e => {
    console.error(`Failed to connect to MultiplayerPlus server:`, e)
});

socket.on(`data`, data => {
    console.debug(`Received data from MultiplayerPlus server:`, data.toString())
});

module.exports = (manager) => new Promise(async res => {
    res(false) // to be added
})