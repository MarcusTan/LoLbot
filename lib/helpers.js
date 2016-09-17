/**
 * helpers.js
 * general helper functions, reused by several functions
 */

const staticData = require('./staticData');

/**
 * param:   (Message) msg
 * return:  N/A
 * http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Message
 * logs a message detailing the command sent
 */
const logCommand = (msg) => {
    console.log('[ ' + msg.timestamp.toLocaleString() + ' ] ' + msg.author.username + ' @ ' + msg.channel.name + ': ' + msg.content);
}

/**
 * param:   (string) str
 * return:  a 'code' formatted string
 */
const getCodeString = (str) => {
    return '\`\`\`' + str + '\`\`\`';
}

/**
 * param:   (string) command
 * return:  the associated description of the command
 */
const getHelpMsg = (command) => {
    let usageMsg = '__**Help For:**__  ' + staticData.config.commandPrefix + command + '\n';
    if (!(command in staticData.commandsList)) {
        usageMsg += 'Command does not exist. See ' + staticData.config.commandPrefix + 'commands for a list of available commands.'; 
    } else {
        usageMsg += staticData.commandsList[command];
    }
    return usageMsg;
}

/**
 * param:   (string) errorMsg
 *          (number) statusCode
 * return:  a 'code' formatted error string
 */
const getRequestErrorString = (errorMsg, statusCode) => {
    return getCodeString('ERROR: ' + errorMsg + '\n' + 
                         'STATUS:' + statusCode);
}

module.exports = {
    logCommand: logCommand,
    getCodeString : getCodeString,
    getHelpMsg: getHelpMsg,
    getRequestErrorString : getRequestErrorString
}