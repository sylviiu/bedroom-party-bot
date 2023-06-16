const superagent = require(`superagent`)

module.exports = (manager) => new Promise(async res => {
    superagent.get(`https://bssb.app/api/v1/browse/code/${manager.id}`).then(async r => {
        if(r && r.body && r.body.results && r.body.results.length > 0 && r.body.results.filter(o => !o.endedAt)) {
            res(true);

            let fails = 0;

            const parse = (session) => {
                Object.assign(manager.metadata, {
                    playerCount: session.playerCount,
                    maxPlayers: session.playerLimit,
                    full: session.playerCount >= session.playerLimit,
                    modded: session.isModded,
                    created: new Date(session.firstSeen),
                    difficulty: typeof session.difficulty == `number` ? session.difficulty : -1
                });

                console.debug(`Updated session meta for ${manager.id} (ServerBrowser):`, manager.metadata)
            }

            parse(r.body.results.find(o => !o.endedAt))

            while (manager.active) {
                await new Promise(async res => {
                    superagent.get(`https://bssb.app/api/v1/browse/code/${manager.id}`).then(async r => {
                        parse(r.body.results.find(o => !o.endedAt))

                        setTimeout(() => { fails = 0; res() }, 5000)
                    }).catch(e => {
                        fails++;

                        console.error(`Failed to connect to BSSB API (${fails}): ${e}`);

                        if(fails > 3) {
                            manager.end(`error`, `Failed to connect to BSSB API too many times.`)
                            return res();
                        } else setTimeout(res, 15000)
                    })
                })
            }
        } else res(false)
    }).catch(e => {
        console.error(`Failed to connect to BSSB API: ${e}`);
        res(false);
    })
})