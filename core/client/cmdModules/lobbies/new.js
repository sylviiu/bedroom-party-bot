module.exports = async (msg, args) => {
    const m = await msg.reply({
        content: `**Finding session...**`,
        flags: 64
    });
    
    ctx.sessions.add(args[0]).then(session => {
        console.debug(`Session returned!`);
        m.edit({
            content: `**New session registered!**\n> **Platform:** ${session.handler}\n> **Code:** **\`${session.id}\`**`
        })
    }).catch(e => {
        console.debug(`Session errored. ${e.message}`);
        m.edit({
            content: `:x: **Failed to register session!**\n> ${e.message}`
        })
    })
}