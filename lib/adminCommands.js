/**
 * adminCommands.js
 * 'administrative' commands, non-lol related commands
 */

const lolbot = require('../lolbot'),
      helpers = require('./helpers');

/**
 * name:    commands
 * param:   none
 * return:  (string) all available commands
 */  
const getCommands = () => {
    let retMsg = '__**List of commands:**__';
    retMsg += '\`\`\`';
    for (var k in lolbot.commandsList) {
        retMsg += k + '\t';
    }
    retMsg += '\`\`\`';
    return retMsg;
}

/**
 * name:    help
 * param:   (stringArray) args
 * return:  (string) help message
 */
const getHelp = (args) => {
    if (args.length != 2) {
        return helpers.getHelpMsg('help');
    } else {
        return helpers.getHelpMsg(args[1]);
    }
}

/**
 * name:    setname
 * param:   (stringArray) args
 *          (Message) msg
 *          (ClientUser) bot
 * return:  (string) status message
 */
const setName = (args, msg, bot) => {
        if (args.length < 2) {
            return helpers.getHelpMsg('setname');
        } else {
            if (lolbot.config.BotOwnerIds.indexOf(msg.author.id) == -1) {
                return msg.reply('You need to be a bot owner to rename the bot!');
            } else {
                args.splice(0, 1);
                const newname = args.join(' ');
                bot.setUsername(newname).then(user => {
                    return msg.reply('Changed the bot name to **' + user.newname + '**');
                }).catch(err => {
                    if (err) {
                        return msg.reply('**Error (' + err.response.statusCode + ')**\n' + 
                                            '\`\`\`' + err.response.text + '\`\`\`');
                    }
                });   
            }
        }
}

// exports
module.exports = {
    getCommands: getCommands,
    getHelp : getHelp,
    setName : setName
}