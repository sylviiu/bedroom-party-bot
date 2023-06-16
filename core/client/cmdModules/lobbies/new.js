module.exports = (msg, args, lang) => {
    msg.reply(`New command invoked; args: "${args.join(`", "`)}"`)
}