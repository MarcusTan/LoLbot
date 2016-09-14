// libraries, folders, files
const Discord = require('discord.js'),
      fs = require('fs'),
      configFile = 'config.json';
      bot = new Discord.Client(),
      helpers = require('./lib/helpers'),
      adminCommands = require('./lib/adminCommands'),
      lolCommands = require('./lib/lolCommands');

// TODO
// changing cb to promises
// champion gg list helper
// picture mmr
// http://aram.lolalytics.com/champion/Akali/

// static data
let config;
const regionsMmr = ['na', 'euw', 'eune'],
      // Region -> PlatformID (https://developer.riotgames.com/docs/spectating-games)
      regionsLive = {
          'na' : { platform: 'NA1' },
          'euw' : { platform: 'EUW1' },
          'eune' : { platform: 'EUN1' },
          'kr' : { platform: 'KR' },
          'br' : { platform: 'BR1' },
          'jp' : { platform: 'JP1' },
          'oce' : { platform: 'OC1' },
          'las' : { platform: 'LA2' },
          'ru' : { platform: 'RU' },
          'tr' : { platform: 'TR1' }
      },
      roles = ['top', 'middle', 'jungle', 'adc', 'support'];
const commandsList = {
        'commands': 'Lists all available commands',
        'help': '\`\`\` help <command> \`\`\`\n' +
                'Show the usage description of a given command',
        'setname': '\`\`\` setname <name with spaces | namewithoutspaces> \`\`\`\n' +
                'Set the name of the bot - the new name can contain spaces\n' +
                'Choose carefully! You can only change the bot name twice per hour\n' +
                '**Requires you to be a bot owner**',
        'mmr': '\`\`\` mmr <summonername> [region] \n' +
                ' Supported Regions: ' + regionsMmr + '\`\`\`\n' +
            'Get\'s user mmr from whatismymmr.com\n' +
            'If there are any spaces in the summoner name replace them with \'+\'\n' +
            'If no region is given, lookup defaults to NA',
        'bestrated': '\`\`\` bestrated [' + roles.join(' | ') + '] \`\`\`\n' +
            'Retrieves the top 10 \"Best Rated\" champions according to champion.gg\n' +
            'If a role is given, retrieves the best rated champions for the given role\n' +
            'If no role is given, retrieves the best rated champions from all roles\n' +
            '\**"Overall Performance takes more than win rate into account' + 
            '- including play rate, ban rate, kda, gold, cs, damage and other role dependant stats.\"**',
        'bestwinrate': '\`\`\` bestwinrate [' + roles.join(' | ') + '] \`\`\`\n' +
            'Retrieves the top 10 champions with the highest winrate from champion.gg\n' +
            'If a role is given, retrieves the highest winrate champions for the given role\n' +
            'If no role is given, retrieves the highest winrate champions from all roles\n',
        'live': '\`\`\` live <summonername> [region] \n' + 
                ' Supported Regions: ' + regionsLive + '\`\`\`\n' +
            'Get\'s live game info for a user from quickfind.kassad.in\n' +
            'If there are any spaces in the summoner name replace them with \'+\'\n' +
            'If no region is given, lookup defaults to NA\n' + 
            'Does not work if a summoner is offline, or in a custom game'
    };
exports.regionsMmr = regionsMmr;
exports.regionsLive = regionsLive;
exports.roles = roles;
exports.commandsList = commandsList;

// read the config file and populate the config var
const readConfig = (cb) => {
    try {
        console.log('Attempting to load `config.json` from ' + __dirname);
        config = JSON.parse(fs.readFileSync(configFile)),
        exports.config = config;
        console.log('Config file successfully read');
        cb();
    } catch (err) {
        console.log(err.message);
        console.log('Please fix the issue and restart')
    }   
}

// Error check config options
const populateOptions = () => {
    if (!config.commandPrefix) {
        console.log('Please set a valid command prefix');
        process.exit(1);
    }
}

// Read the config, log the bot in, populate options
readConfig(() => {
    bot.login(config.DiscordBotToken);
    populateOptions();
});

bot.on('ready', () => {
    console.log('lolbot running');
});

bot.on('error', (error) => {
    console.log('lolbot encountered an error:' + error);
});

// bot commands
bot.on('message', msg => {
    /* ---------- Admin Commands ---------- */
    //commands
    if (msg.content.startsWith(config.commandPrefix + 'commands')) {
        helpers.logCommand(msg);
        msg.channel.sendMessage(adminCommands.getCommands());
    }
    // help
    if (msg.content.startsWith(config.commandPrefix + 'h')) {
        helpers.logCommand(msg);
        msg.channel.sendMessage(adminCommands.getHelp(msg.content.split(' ')));
    }
    // set the name of bot
    if (msg.content.startsWith(config.commandPrefix + 'setname')) {
        helpers.logCommand(msg);
        adminCommands.setName(msg.content.split(' '), msg, bot.user);
    }

    /* ---------- LoL Commands ---------- */
    // whatismymmr
    if (msg.content.startsWith(config.commandPrefix + 'mmr')) {
        helpers.logCommand(msg);
        lolCommands.getMmr(msg.content.split(' '), (retMsg) => {
            msg.channel.sendMessage(retMsg);
        });
    }

    // championgg - bestRated
    if (msg.content.startsWith(config.commandPrefix + 'bestrated')) {
        helpers.logCommand(msg);
        lolCommands.getBestRated(msg.content.split(' '), (retMsg) => {
            msg.channel.sendMessage(retMsg);
        });
    }

    // championgg - winrate
    if (msg.content.startsWith(config.commandPrefix + 'bestwinrate')) {
        lolCommands.getBestWinrate(msg.content.split(' '), (retMsg) => {
            msg.channel.sendMessage(retMsg);
        });
    }

    // Screencap quickfind.kassad.in for live games
    if (msg.content.startsWith(config.commandPrefix + 'live')) {
        helpers.logCommand(msg);
        lolCommands.getLive(msg.content.split(' '), (liveGame) => {
            if (liveGame.picPath) {
                msg.channel.sendFile(liveGame.picPath, liveGame.picFileName, liveGame.retMsg);
            } else {
                msg.channel.sendMessage(liveGame.retMsg);
            }
        });
    }      

});