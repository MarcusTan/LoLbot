// libraries, folders, files
const Discord = require('discord.js'),
      configFile = 'config.json',
      bot = new Discord.Client(),
      helpers = require('./lib/helpers'),
      staticData = require('./lib/staticData'),
      adminCommands = require('./lib/adminCommands'),
      cggCommands = require('./lib/championGGCommands'),
      lolCommands = require('./lib/lolCommands');

// TODO
// retry mmr if ERROR: internal connection error (000)
// strict vs no strict?
// redo docstrings for jsdocs
// quickfind: support asian language + wait for page to load
// check for resources to load + if html is there?
// public vs private commands? i.e. what you see in command list is different
// changing cb to promises
// picture mmr
// http://aram.lolalytics.com/champion/Akali/
// builds for SR and ARAM

// Read the config, log the bot in, populate options
staticData.readConfig(configFile, () => {
    bot.login(staticData.config.DiscordBotToken);
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
    // commands
    if (msg.content.startsWith(staticData.config.commandPrefix + 'commands')) {
        helpers.logCommand(msg);
        msg.channel.sendMessage(adminCommands.getCommands());
    }
    // help
    if (msg.content.startsWith(staticData.config.commandPrefix + 'h')) {
        helpers.logCommand(msg);
        msg.channel.sendMessage(adminCommands.getHelp(msg.content.split(' ')));
    }
    // set the name of bot
    if (msg.content.startsWith(staticData.config.commandPrefix + 'setname')) {
        helpers.logCommand(msg);
        adminCommands.setName(msg.content.split(' '), msg, bot.user);
    }

    /* ---------- ChampionGG Commands ---------- */
    // championgg - mostBanned
    if (msg.content.startsWith(staticData.config.commandPrefix + 'mostbanned')) {
        helpers.logCommand(msg);
        cggCommands.getMostBanned(msg.content.split(' '), (retMsg) => {
            msg.channel.sendMessage(retMsg);
        });
    }

    // championgg - bestRated
    if (msg.content.startsWith(staticData.config.commandPrefix + 'bestrated')) {
        helpers.logCommand(msg);
        cggCommands.getBestRated(msg.content.split(' '), (retMsg) => {
            msg.channel.sendMessage(retMsg);
        });
    }

    // championgg - bestWinrate
    if (msg.content.startsWith(staticData.config.commandPrefix + 'bestwinrate')) {
        helpers.logCommand(msg);
        cggCommands.getBestWinrate(msg.content.split(' '), (retMsg) => {
            msg.channel.sendMessage(retMsg);
        });
    }

    /* ---------- LoL Commands ---------- */
    // whatismymmr
    if (msg.content.startsWith(staticData.config.commandPrefix + 'mmr')) {
        helpers.logCommand(msg);
        lolCommands.getMmr(msg.content.split(' '), (retMsg) => {
            msg.channel.sendMessage(retMsg);
        });
    }

    // quickfind.kassad.in
    if (msg.content.startsWith(staticData.config.commandPrefix + 'live')) {
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

