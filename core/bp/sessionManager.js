module.exports = class SessionManager {
    constructor(platformName, platformCode, sessionCode) {
        this.platformName = platformName
        this.platformCode = platformCode
        this.sessionCode = sessionCode

        if(this.platforms[this.platformCode]) this.platforms[this.platformCode]()

        this.title = `${this.platformName} Session`,
        this.description = `Active Session: ${this.platformCode}`
    }

    platforms = {
        beattogether: () => {

        }
    }
}