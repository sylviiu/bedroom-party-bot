const key = `nUSW7]EKMsm;3Vq5` // no this was not hardcoded to mess with you, i found this in the beatsaberplus.dll file

const tls = require('tls');
const net = require('net');

const opt = {
    host: `multiplayer-balancer.beatsaberplus.com`,
    port: 443,
    rejectUnauthorized: false
};

const socket = new net.Socket();

const client = require('node-forge').tls.createConnection({
    server: false,
    verify: (conn, verified, depth, certs) => {
        console.debug(`verify`, verified, depth, certs)
        return true;
    },
    connected: (conn) => {
        console.debug(`connected`)
    },
    tlsDataReady: (conn) => {
        console.debug(`tlsDataReady`)
        const bytes = conn.tlsData.getBytes();
        console.debug(`data out -> ` + Buffer.from(bytes).toString())
        socket.write(bytes, 'binary');
    },
    dataReady: (conn) => {
        console.debug(`dataReady`)
        socket.write(conn.data.getBytes(), 'binary');
    },
    closed: () => {
        console.debug(`closed`)
    },
    error: (conn, err) => {
        console.error(`error`, err)
    }
});

socket.on(`error`, err => {
    console.error(`socket`, err)
})

socket.on(`end`, () => {
    console.log(`Disconnected from balancer`)
})

socket.on(`close`, () => {
    console.log(`Disconnected from balancer`)
})

socket.on(`data`, d => {
    console.debug(`data in -> `, d.toString())
    client.process(d.toString('binary'));
})

socket.on(`connect`, () => {
    console.log(`Connected to balancer`)
    client.handshake();
})

socket.connect(opt);

module.exports = (manager) => new Promise(async res => {
    res(false) // to be added
})