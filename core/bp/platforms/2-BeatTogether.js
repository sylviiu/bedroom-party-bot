const superagent = require("superagent");

const authToken = require(`../../../util/idGen`)(32).toUpperCase()
console.debug(`BeatTogether platform auth token: ${authToken}`)

const config = require(`../../../config.json`)

module.exports = (manager) => new Promise(async res => {
    if(config && config.steamUserID) {
        const opt = {
            single_use_auth_token: authToken,
            private_game_code: manager.id.toUpperCase(),
            auth_user_id: config.steamUserID,
            beatmap_level_selection_mask: {
                difficulties: 31,
                modifiers: 65535,
                song_packs: "/////////////////////w"
            },
            user_id: config.steamUserID,
            platform: 1,
            player_session_id: "test"
        }

        superagent.post(`http://master.beattogether.systems:8989/beat_saber_get_multiplayer_instance`).send(opt).then(async r => {
            if(r && r.body && r.body.player_session_info && (r.body.error_code == 0 || r.body.error_code == 4)) {
                res(true);

                fails = 0;

                const parse = (session, code) => {
                    Object.assign(manager.metadata, {
                        maxPlayers: code != 0 ? manager.metadata.maxPlayers : session.gameplay_server_configuration.max_player_count,
                        full: code == 4 ? true : false,
                        modded: true,
                    });

                    console.debug(`Updated session meta for ${manager.id} (BeatTogether):`, manager.metadata)
                }

                parse(r.body.player_session_info, r.body.error_code)

                while (manager.active) {
                    await new Promise(async res => {
                        superagent.post(`http://master.beattogether.systems:8989/beat_saber_get_multiplayer_instance`).send(opt).then(async r => {
                            if(r.body.error_code === 3) {
                                manager.end(`error`, `Server has closed.`)
                                return res();
                            } else if(r.body.error_code != 0 && r.body.error_code != 4) {
                                fails++;

                                console.error(`BeatTogether API threw error code ${r.body.error_code} (${fails})`);
    
                                if(fails > 3) {
                                    manager.end(`error`, `Failed to connect to BeatTogether API too many times.`)
                                    return res();
                                } else setTimeout(res, 15000)
                            } else {
                                parse(r.body.player_session_info, r.body.error_code)
    
                                setTimeout(() => { fails = 0; res() }, 5000)
                            }
                        }).catch(e => {
                            fails++;

                            console.error(`Failed to connect to BeatTogether API (${fails}): ${e}`);

                            if(fails > 3) {
                                manager.end(`error`, `Failed to connect to BeatTogether API too many times.`)
                                return res();
                            } else setTimeout(res, 15000)
                        })
                    })
                }
            } else if(r && r.body && r.body.error_code) {
                console.debug(`BeatTogether platform query failed with code: ${r.body.error_code}\nReq opt: ${JSON.stringify(opt, null, 4)}`);
                res(false)
            } else {
                console.debug(`BeatTogether platform query failed with no error code.`, r.body || `(no body)`)
                res(false)
            }
        }).catch(e => {
            console.debug(`BeatTogether platform query failed: ${e}`)
            res(false)
        })
    } else res(false)
})