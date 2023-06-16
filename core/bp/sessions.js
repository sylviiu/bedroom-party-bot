const sessions = {};

setInterval(() => {
    console.debug(`Active Sessions:`, sessions)
}, 15000)

const SessionManager = require('./sessionManager.js');

module.exports = {
    sessions,
    add: (id) => new Promise(async (res, rej) => {
        console.log(`Attempting to register session with code ${id}`)

        new SessionManager(id).then(manager => {
            console.log(`Session registered with code ${id}`)
    
            sessions[id] = manager;
    
            manager.once(`close`, (type, message) => {
                delete sessions[id];
                console.log(`Session ${id} closed with type "${type}"\n> ${message}`)
            })
    
            return res(sessions[id]);
        }).catch(rej)
    }),
    remove: (id) => {
        if(sessions[id] && sessions[id].active) {
            sessions[id].end(`error`, `Session was removed from the session manager.`)
        }
    }
}