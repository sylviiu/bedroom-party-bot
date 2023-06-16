const superagent = require("superagent");
const EventEmitter = require("events");

const platforms = require('fs').readdirSync(`./core/bp/platforms/`).filter(f => f.endsWith(`.js`)).map(f => ({name: f.split(`.`).slice(0, -1).join(`.`), func: require(`./platforms/${f}`)}))

module.exports = class SessionManager extends EventEmitter {
    active = true;
    private = null;

    constructor(id) {
        super();
        
        this.id = id

        this.metadata = {
            created: new Date(),
        }

        return this._init();
    }

    _init = () => new Promise(async (res, rej) => {
        for(const platformFunc of platforms) {
            const name = platformFunc.name.includes(`-`) ? platformFunc.name.split(`-`)[1] : platformFunc.name
            console.debug(`Attempting to initialize ${name} platform query...`)
            try {
                const result = await platformFunc.func(this)
                if(result) {
                    console.debug(`Successfully initialized ${name} platform query.`)
                    this.handler = name;
                    break;
                }
            } catch(e) {
                console.debug(`Couldn't initialize ${name} platform query: ${e}`)
            }
        };

        if(this.handler) {
            res(this);
        } else {
            rej(new Error(`Unable to receive session information from any platform.`))
        }
    })

    async notify() {
        if(!this.handler) {

        }
    }

    getDifficulty() {
        const difficulties = ['Easy', 'Normal', 'Hard', 'Expert', 'Expert+'];

        let n = this.metadata.difficulty;

        if(n > difficulties.length) n = difficulties.length;

        if(n < 0) {
            return "Unknown"
        } else return difficulties[n];
    }

    end(type, message) {
        this.active = false;
        this.emit(`close`, type, message);
    }
}