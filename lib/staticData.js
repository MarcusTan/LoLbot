const fs = require('fs'),
      path = require('path');

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
        'help': '``` help <command> ```\n' +
                'Show the usage description of a given command',
        'setname': '``` setname <name with spaces | namewithoutspaces> ```\n' +
                'Set the name of the bot - the new name can contain spaces\n' +
                'Choose carefully! You can only change the bot name twice per hour\n' +
                '**Requires you to be a bot owner**',
        'mostbanned': 'Retrieves the top 10 \"Most Banned\" champions from champion.gg\n',
        'bestrated': '``` bestrated [' + roles.join(' | ') + '] ```\n' +
            'Retrieves the top 10 \"Best Rated\" champions according to champion.gg\n' +
            'If a role is given, retrieves the best rated champions for the given role\n' +
            'If no role is given, retrieves the best rated champions from all roles\n' +
            '\**"Overall Performance takes more than win rate into account' + 
            '- including play rate, ban rate, kda, gold, cs, damage and other role dependant stats.\"**',
        'bestwinrate': '``` bestwinrate [' + roles.join(' | ') + '] ```\n' +
            'Retrieves the top 10 champions with the highest winrate from champion.gg\n' +
            'If a role is given, retrieves the highest winrate champions for the given role\n' +
            'If no role is given, retrieves the highest winrate champions from all roles\n',
        'live': '``` live <summonername> [region] \n' + 
                ' Supported Regions: ' + Object.keys(regionsLive) + '```\n' +
            'Get\'s live game info for a user from quickfind.kassad.in\n' +
            'If there are any spaces in the summoner name replace them with \'+\'\n' +
            'If no region is given, lookup defaults to NA\n' + 
            'Does not work if a summoner is offline, or in a custom game',
        'mmr': '``` mmr <summonername> [region] \n' +
                ' Supported Regions: ' + regionsMmr + '```\n' +
            'Get\'s user mmr from whatismymmr.com\n' +
            'If there are any spaces in the summoner name replace them with \'+\'\n' +
            'If no region is given, lookup defaults to NA'
    };

// read the config file and populate the config var
const readConfig = (configFile, cb) => {
    try {
        console.log('Attempting to load `' + configFile +'` from ' + path.resolve(__dirname, '../'));
        config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', configFile)));
        if (!config.commandPrefix) {
            console.log('Please set a valid command prefix');
            process.exit(1);
        }
        module.exports.config = config;
        console.log('Config file successfully read');
        cb();
    } catch (err) {
        console.log(err.message);
        console.log('Please fix the issue and restart')
    }   
}

module.exports = {
    regionsMmr : regionsMmr,
    regionsLive : regionsLive,
    roles : roles,
    commandsList : commandsList,
    readConfig : readConfig
}