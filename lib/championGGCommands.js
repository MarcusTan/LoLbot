/**
 * championGGCommands.js
 * commands using the championGG api
 */

const request = require('request'),
      helpers = require('./helpers'),
      staticData = require('./staticData');

/* ---------- Local Helper Functions ---------- */

/**
 * General stats list string builder
 * @param {Object} o - the api data
 * @param {number} limit
 * @returns {string} - formatted list data
 */
const statsStrBuilder = (o, limit) => {
    let listMsg = '', delimiter = ' ', champs = {};
    champs.longestListRank = 0;
    champs.longestName = 0;
    champs.longestRole = 0;
    for (i = 0; i < limit; i++) {
        champs[i] = {};
        champs[i].listRank = (i+1);
        champs[i].name = o.data[i].name;
        champs[i].role = o.data[i].role;
        champs[i].winPercent = o.data[i].general.winPercent;

        if (champs[i].listRank.toString().length > champs.longestListRank) {
            champs.longestListRank = champs[i].listRank.toString().length;
        }
        if (champs[i].name.length > champs.longestName) {
            champs.longestName = champs[i].name.length;
        }
        if (champs[i].role.length > champs.longestRole) {
            champs.longestRole = champs[i].role.length;
        }
    }

    for (i = 0; i < limit; i++) {
        listMsg += 
            champs[i].listRank + ')' + (delimiter).repeat(champs.longestListRank - champs[i].listRank.toString().length) + '\t' +
            champs[i].name + (delimiter).repeat(champs.longestName - champs[i].name.length) + '\t' +
            '[' + champs[i].role + ']' + (delimiter).repeat(champs.longestRole - champs[i].role.length) + '\t' +
            '(wr: ' + champs[i].winPercent + '%)\n';
    }

    return helpers.getCodeString(listMsg);
}

/**
 * championGG helper to handle ordered list data from the /stats/ endpoint
 * i.e. http://api.champion.gg/stats/ + endpoint
 * @param {string} description - what the endpoint describes
 * @param {string} endpoint - w/o beginning + ending slashes
 * @param {number} page
 * @param {number} limit
 * @param {function} outputStrBuilder
 * @param {function(string)} cb
 */
const statsListRequestHelper = (description, endpoint, page, limit, outputStrBuilder, cb) => {
    let retMsg = '__**Top ' + limit + ' ' + description + '**__ \n',
        requestUrl = 'http://api.champion.gg/stats/' + endpoint + 
                    '?api_key=' + staticData.config.ChampionGGAPIKey + 
                    '&page=' + page + '&limit=' + limit;
    request(requestUrl, (err, res, body) => {
        if (err) {
            retMsg = helpers.getRequestErrorString(err.message, res.statusCode);
        } else {
            const data = JSON.parse(body);
            if (data.error) {
                retMsg = helpers.getCodeString('ERROR: ' + data.error);
            } else {
                retMsg += outputStrBuilder(data, limit);
            }
        }
        return cb(retMsg);
    });
}

/**
 * ChampionGG Commands
 * @param {Array} args
 * @param {function(string)} cb
 */

const getMostBanned = (args, cb) => {
    if (args.length > 1) {
        return cb(helpers.getHelpMsg('mostbanned'));
    } else {
        // http://api.champion.gg/stats/champs/mostBanned?api_key=<API_KEY>&page=<PAGE>&limit=<LIMIT>
        const limit = 10,
            description = 'Most Banned Champions',
            endpoint = 'champs/mostBanned';
        statsListRequestHelper(description, endpoint, 1, limit, statsStrBuilder, (retMsg) => {
            return cb(retMsg);
        });
    }
}

const getBestRated = (args, cb) => {
    if (args.length > 2 || (args.length == 2 && staticData.roles.indexOf(args[1].toLowerCase()) == -1)) {
        return cb(helpers.getHelpMsg('bestrated'));
    } else {
        // http://api.champion.gg/stats/champs/bestRated?api_key=<API_KEY>&page=<PAGE>&limit=<LIMIT>
        // http://api.champion.gg/stats/role/ROLE/bestPerformance?api_key=<API_KEY>&page=<PAGE>&limit=<LIMIT>
        const limit = 10,
            description = (args.length == 1)?('Best Rated Champions'):('Best Rated ' + args[1][0].toUpperCase() + args[1].slice(1) + ' Champions'),
            endpoint = (args.length == 1)?('champs/bestRated'):('role/' + args[1].toLowerCase() + '/bestPerformance');
        statsListRequestHelper(description, endpoint, 1, limit, statsStrBuilder, (retMsg) => {
            return cb(retMsg);
        });
    }
}

const getBestWinrate = (args, cb) => {
    if (args.length > 2 || (args.length == 2 && staticData.roles.indexOf(args[1].toLowerCase()) == -1)) {
        return cb(helpers.getHelpMsg('bestwinrate'));
    } else {
        // http://api.champion.gg/stats/champs/mostWinning?api_key=<API_KEY>&page=<PAGE>&limit=<LIMIT>
        // http://api.champion.gg/stats/role/ROLE/mostWinning?api_key=<API_KEY>&page=<PAGE>&limit=<LIMIT>
        const limit = 10,
            description = (args.length == 1)?('Most Winning Champions'):('Most Winning ' + args[1][0].toUpperCase() + args[1].slice(1) + ' Champions'),
            endpoint = (args.length == 1)?('champs/mostWinning'):('role/' + args[1].toLowerCase() + '/mostWinning');
        statsListRequestHelper(description, endpoint, 1, limit, statsStrBuilder, (retMsg) => {
            return cb(retMsg);
        });
    }
}

module.exports = {
    getMostBanned : getMostBanned,
    getBestRated : getBestRated,
    getBestWinrate : getBestWinrate
}