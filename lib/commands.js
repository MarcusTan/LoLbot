const lolbot = require('../lolbot'),
      request = require('request');

const regions = ['na', 'euw', 'eune'],
      roles = ['top', 'middle', 'jungle', 'adc', 'support'];

// print the usage message for a command
const printUsage = (channel, command) => {
    let usageMsg = '__**Help For:**__  ' + lolbot.config.commandPrefix + command + '\n';
    if (!(command in lolbot.commandsList)) {
        usageMsg += 'Command does not exist. See ' + lolbot.config.commandPrefix + 'commands for a list of available commands.'; 
    } else {
        usageMsg += lolbot.commandsList[command];
    }
    channel.sendMessage(usageMsg);
}

// bot commands
module.exports = (client) => {
    client.on('message', msg => {

        // commands
        if (msg.content.startsWith(lolbot.config.commandPrefix + 'commands')) {
            let retMsg = '__**List of commands:**__';
            retMsg += '\`\`\`';
            for (var k in lolbot.commandsList) {
                retMsg += k + '\t';
            }
            retMsg += '\`\`\`';
            msg.channel.sendMessage(retMsg);
        }

        // help
        if (msg.content.startsWith(lolbot.config.commandPrefix + 'h')) {
            let args = msg.content.split(' ');
            if (args.length != 2) {
                printUsage(msg.channel, 'help');
            } else {
                printUsage(msg.channel, args[1]);
            }
        }

        // set the name of bot
        if (msg.content.startsWith(lolbot.config.commandPrefix + 'setname')) {
            let args = msg.content.split(' ');
            if (args.length < 2) {
                printUsage(msg.channel, 'setname');
            } else {
                if (lolbot.config.BotOwnerIds.indexOf(msg.author.id) == -1) {
                    return msg.reply('You need to be a bot owner to rename the bot!');
                } else {
                    args.splice(0, 1);
                    const newname = args.join(' ');
                    client.user.setUsername(newname).catch(err => {
                        if (err) {
                            return msg.reply('**Error (' + err.response.statusCode + ')**\n' + 
                                            '\`\`\`' + err.response.text + '\`\`\`');
                        } else {
                            return msg.reply('Changed the bot name to **' + newname + '**');
                        }
                    });
                    
                }
            }
        }

        // whatismymmr
        if (msg.content.startsWith(lolbot.config.commandPrefix + 'mmr')) {
            let args = msg.content.split(' ');
            let retMsg;
            if (args.length == 1 || args.length > 3 || (args.length == 3 && regions.indexOf(args[2].toLowerCase()) == -1)) {
                printUsage(msg.channel, 'mmr');
            } else {
                // https://region.whatismymmr.com/api/v1/summoner?name=summonername
                let User = {
                    'region': (args[2])?(args[2]):('na'),
                    'lookupName' : args[1].replace(/\+/g, '%20'),
                    'displayName': args[1].replace(/\+/g, ' ')
                }
                request('https://' + User.region + '.whatismymmr.com/api/v1/summoner?name=' + User.lookupName, (err, res, body) => {
                    if (err) {
                        retMsg = 'ERROR: ' + err + '\n'
                                + 'STATUS: ' + res.statusCode;
                    } else {
                        const data = JSON.parse(body);
                        retMsg = 'MMR lookup for ' + '**' + User.displayName + ' (' + User.region.toUpperCase() + ')' + '**\n' +  '\`\`\`'; 
                        // {"error":"no MMR data for summoner (001)"}
                        if (data.error) {
                            retMsg += 'ERROR: ' + data.error;
                        } else {
                            const modes = ['ranked','normal','ARAM'];
                            modes.forEach((mode) => {
                                if (data[mode].avg) {
                                    User[mode] = data[mode].avg
                                    if (data[mode].err) {
                                        User[mode] += ' ± ' + data[mode].err;
                                    } else {
                                        User[mode] += ' ± 0';
                                    }
                                } else {
                                    User[mode] = 'N/A'
                                }
                            });

                            retMsg += 'Ranked: ' + User.ranked + '\n' +
                                      'Normal: ' + User.normal + '\n' +
                                      'ARAM: ' + User.ARAM + '\n';
                        }
                        retMsg += '\`\`\`';
                    }
                    msg.channel.sendMessage(retMsg);
                });
            }
        }

        // championgg - bestRated
        if (msg.content.startsWith(lolbot.config.commandPrefix + 'bestrated')) {
            let args = msg.content.split(' ');
            let retMsg;
            if (args.length > 2 || (args.length == 2 && roles.indexOf(args[1].toLowerCase()) == -1)) {
                printUsage(msg.channel, 'bestrated');
            } else {
                // http://api.champion.gg/stats/champs/bestRated?api_key=APIKEY&page=1&limit=10
                // http://api.champion.gg/stats/role/ROLE/bestPerformance?api_key=APIKEY&page=1&limit=10
                let requestUrl = 'http://api.champion.gg/stats/';
                const limit = 10;
                requestUrl += (args.length == 1)?('champs/bestRated'):('role/' + args[1].toLowerCase() + '/bestPerformance');
                requestUrl += '?api_key=' + lolbot.config.ChampionGGAPIKey + '&page=1&limit=' + limit;
                request(requestUrl, (err, res, body) => {
                    if (err) {
                        retMsg = 'ERROR: ' + err + '\n'
                                + 'STATUS: ' + res.statusCode;
                    } else {
                        const data = JSON.parse(body);
                        retMsg = '__**Top ' + limit + ' Best Rated Champions**__  Role: ';
                        retMsg += (args.length == 1)?('ALL'):(args[1].toUpperCase());
                        retMsg += '\n\`\`\`'; 
                        if (data.error) {
                            retMsg += 'ERROR: ' + data.error;
                        } else {
                            for (i = 0; i < limit; i++) {
                                retMsg += (i+1) + ') ' + data.data[i].name + ' [' + data.data[i].role + '] ' +
                                    '(wr: ' + data.data[i].general.winPercent +  '%)\n';
                            }
                        }
                        retMsg += '\`\`\`';
                    }
                    msg.channel.sendMessage(retMsg);
                });
            }
        }

        // championgg - winrate
        if (msg.content.startsWith(lolbot.config.commandPrefix + 'bestwinrate')) {
            let args = msg.content.split(' ');
            let retMsg;
            if (args.length > 2 || (args.length == 2 && roles.indexOf(args[1].toLowerCase()) == -1)) {
                printUsage(msg.channel, 'bestwinrate');
            } else {
                // http://api.champion.gg/stats/champs/mostWinning?api_key=APIKEY&page=1&limit=10
                // http://api.champion.gg/stats/role/ROLE/mostWinning?api_key=APIKEY&page=1&limit=10
                let requestUrl = 'http://api.champion.gg/stats/';
                const limit = 10;
                requestUrl += (args.length == 1)?('champs/mostWinning'):('role/' + args[1].toLowerCase() + '/mostWinning');
                requestUrl += '?api_key=' + lolbot.config.ChampionGGAPIKey + '&page=1&limit=' + limit;
                request(requestUrl, (err, res, body) => {
                    if (err) {
                        retMsg = 'ERROR: ' + err + '\n'
                                + 'STATUS: ' + res.statusCode;
                    } else {
                        const data = JSON.parse(body);
                        retMsg = '__**Top ' + limit + ' Most Winning Champions**__  Role: ';
                        retMsg += (args.length == 1)?('ALL'):(args[1].toUpperCase());
                        retMsg += '\n\`\`\`'; 
                        if (data.error) {
                            retMsg += 'ERROR: ' + data.error;
                        } else {
                            for (i = 0; i < limit; i++) {
                                retMsg += (i+1) + ') ' + data.data[i].name + ' [' + data.data[i].role + '] ' +
                                    '(wr: ' + data.data[i].general.winPercent +  '%)\n';
                            }
                        }
                        retMsg += '\`\`\`';
                    }
                    msg.channel.sendMessage(retMsg);
                });
            }
        }

    });
}
