/**
 * helpers.js
 * general helper functions, reused by several functions
 */

const lolbot = require('../lolbot');

/**
 * param:   a string representing a command
 * return:  the associated description of the command
 */
const getHelpMsg = (command) => {
    let usageMsg = '__**Help For:**__  ' + lolbot.config.commandPrefix + command + '\n';
    if (!(command in lolbot.commandsList)) {
        usageMsg += 'Command does not exist. See ' + lolbot.config.commandPrefix + 'commands for a list of available commands.'; 
    } else {
        usageMsg += lolbot.commandsList[command];
    }
    return usageMsg;
}

/**
 * param:   a string
 * return:  a 'code' formatted string
 */
const getCodeString = (str) => {
    return '\`\`\`' + str + '\`\`\`';
}

/**
 * param:   (string) error message
 *          (number) http status code
 * return:  a 'code' formatted error string
 */
const getRequestErrorString = (errorMsg, statusCode) => {
    return getCodeString('ERROR: ' + errorMsg + '\n' + 
                         'STATUS:' + statusCode);
}

// exports
module.exports = {
    getHelpMsg: getHelpMsg,
    getCodeString : getCodeString,
    getRequestErrorString : getRequestErrorString
}