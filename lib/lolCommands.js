/**
 * lolCommands.js
 * lol-related commands
 */

const lolbot = require('../lolbot'),
      request = require('request'),
      phantom = require('phantomjs-prebuilt'),
      path = require('path'),
      helpers = require('./helpers');

/* ---------- Local Helper Functions ---------- */
/**
 * param:   { (string) name, (string) region } user
 *          (function) cb
 * return:  cb((number) summonderId, (string) errorMsg) 
 */
const getSummonerId = (user, cb) => {
    const lookupNameRiot = user.name.replace(/\+/g, '').toLowerCase(),
          // https://REGION.api.pvp.net/api/lol/REGION/v1.4/summoner/by-name/NAME?api_key=APIKEY
          summonerLookupUrl = 'https://' + user.region + '.api.pvp.net/api/lol/' + user.region + '/v1.4/summoner/by-name/' +
                            lookupNameRiot + '?api_key=' + lolbot.config.RiotAPIKey;
    let errorMsg, summonerId = null;
    request(summonerLookupUrl, (err, res, body) => {
        if (err) {
            errorMsg = helpers.getRequestErrorString(err.message, res.statusCode);
        } else {
            let data = JSON.parse(body);
            if (data.status) {
                if (data.status.status_code == 404) {
                    errorMsg = helpers.getCodeString('ERROR: Summoner with that name doesn\'t exist on this server');                                
                } else {
                    errorMsg = helpers.getCodeString('ERROR during Summoner Lookup: ' + data.status.message + ' (' + data.status.status_code + ')');
                }
            } else if (data[lookupNameRiot]) {
                summonerId = data[lookupNameRiot].id;
            } else {
                errorMsg = 'ERROR during Summoner Lookup: unknown error';
            }
        }
        return cb(summonerId, errorMsg);
    });
}

/**
 * param:   { (string) name, (string) region, (number) summonerId } user
 *          (function) cb
 * return:  cb((bool) isLive, (string) errorMsg) 
 */
const isSummonerLive = (user, cb) => {
    // https://REGION.api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/PLATFORMID/SUMMONERID?api_key=APIKEY
    const liveGameLookupUrl = 'https://' + user.region + '.api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/' +
                            lolbot.regionsLive[user.region].platform + '/' + user.summonerId + '?api_key=' + lolbot.config.RiotAPIKey;
    let errorMsg, isLive = false;
    request(liveGameLookupUrl, (err, res, body) => {
        if (err) {
            errorMsg = helpers.getRequestErrorString(err.message, res.statusCode);
        } else {
            data = JSON.parse(body);
            if (data.status) {
                if (data.status.status_code == 404) {
                    errorMsg = helpers.getCodeString('ERROR: Summoner is not in game');                             
                } else {
                    errorMsg = helpers.getCodeString('ERROR during Live Game Lookup: ' + data.status.message + ' (' + data.status.status_code + ')');
                }
            } else if (data.gameId) {
                isLive = true;
            } else {
                errorMsg = 'ERROR during Live Game Lookup: unknown error';
            }
        }
        return cb(isLive, errorMsg);
    });
}

/**
 * param:   { (string) name, (string) region, (number) summonerId } user
 *          (function) cb
 * return:  cb((string) picPath, (string) picFileName, (string) scriptStatus) 
 */
const getLiveImg = (user, cb) => {
    const lookupName = user.name.replace(/\+/g, '%20'),
        quickfind = path.join(__dirname, 'quickfind.js'),
        // http://quickfind.kassad.in/profile/region/some%20name/                
        scrapingUrl = 'http://quickfind.kassad.in/profile/' + user.region + '/' + lookupName,
        type = '.png',
        picPath = path.resolve('live' + type),
        picFileName = user.name + '_LiveGame' + type,
        script = phantom.exec(quickfind, scrapingUrl);
    let scriptErrorMsg;

    script.stdout.pipe(process.stdout);
    script.stderr.pipe(process.stderr);
    script.on('exit', code => {
        if (code) {
            scriptErrorMsg = helpers.getCodeString('ERROR: quickfind script exited with code ' + code);
        }
        cb(picPath, picFileName, scriptErrorMsg);
    });
}

/* ---------- LoL Commands ---------- */

/**
 * name:    mmr
 * params:  (stringArray) args
 *          (function) cb
 * return:  cb({ (string) mmrInfo })
 */
const getMmr = (args, cb) => {
    if (args.length == 1 || args.length > 3 || (args.length == 3 && lolbot.regionsMmr.indexOf(args[2].toLowerCase()) == -1)) {
        return cb(helpers.getHelpMsg('mmr'));
    } else {
        // https://region.whatismymmr.com/api/v1/summoner?name=summonername
        let retMsg,
            user = {
                'region': (args[2])?(args[2]):('na'),
                'name': args[1]
            },
            requestUrl = 'https://' + user.region + '.whatismymmr.com/api/v1/summoner?name=' + user.name.replace(/\+/g, '%20');

        request(requestUrl, (err, res, body) => {
            if (err) {
                retMsg = helpers.getRequestErrorString(err.message, res.statusCode);
            } else {
                const data = JSON.parse(body);
                retMsg = 'MMR lookup for ' + '**' + user.name.replace(/\+/g, ' ') + ' (' + user.region.toUpperCase() + ')' + '**\n'; 
                // {"error":"no MMR data for summoner (001)"}
                if (data.error) {
                    retMsg += helpers.getCodeString('ERROR: ' + data.error);
                } else {
                    const modes = ['ranked','normal','ARAM'];
                    modes.forEach((mode) => {
                        if (data[mode].avg) {
                            user[mode] = data[mode].avg
                            if (data[mode].err) {
                                user[mode] += ' ± ' + data[mode].err;
                            } else {
                                user[mode] += ' ± 0';
                            }
                        } else {
                            user[mode] = 'N/A'
                        }
                    });

                    retMsg += helpers.getCodeString(
                        'Ranked: ' + user.ranked + '\n' +
                        'Normal: ' + user.normal + '\n' +
                        'ARAM: ' + user.ARAM + '\n'
                    );
                }
            }
            return cb(retMsg);
        });
    }
}

/**
 * name:    bestrated
 * params:  (stringArray) args
 *          (function) cb
 * return:  cb({ (string) champInfo })
 */
const getBestRated = (args, cb) => {
    if (args.length > 2 || (args.length == 2 && lolbot.roles.indexOf(args[1].toLowerCase()) == -1)) {
        return cb(helpers.getHelpMsg('bestrated'));
    } else {
        // http://api.champion.gg/stats/champs/bestRated?api_key=APIKEY&page=1&limit=10
        // http://api.champion.gg/stats/role/ROLE/bestPerformance?api_key=APIKEY&page=1&limit=10
        const limit = 10;
        let retMsg, requestUrl = 'http://api.champion.gg/stats/';

        requestUrl += (args.length == 1)?('champs/bestRated'):('role/' + args[1].toLowerCase() + '/bestPerformance');
        requestUrl += '?api_key=' + lolbot.config.ChampionGGAPIKey + '&page=1&limit=' + limit;
        request(requestUrl, (err, res, body) => {
            if (err) {
                retMsg = helpers.getRequestErrorString(err.message, res.statusCode);
            } else {
                const data = JSON.parse(body);
                retMsg = '__**Top ' + limit + ' Best Rated Champions**__  Role: ';
                retMsg += (args.length == 1)?('ALL'):(args[1].toUpperCase()) + '\n';
                if (data.error) {
                    retMsg += helpers.getCodeString('ERROR: ' + data.error);
                } else {
                    let listString = '';
                    for (i = 0; i < limit; i++) {
                        listString += (i+1) + ') ' + data.data[i].name + ' [' + data.data[i].role + '] ' +
                            '(wr: ' + data.data[i].general.winPercent +  '%)\n';
                    }
                    listString = helpers.getCodeString(listString);
                    retMsg += listString;
                }
            }
            return cb(retMsg);
        });
    }
}

/**
 * name:    bestwinrate
 * params:  (stringArray) args
 *          (function) cb
 * return:  cb({ (string) champInfo })
 */
const getBestWinrate = (args, cb) => {
    if (args.length > 2 || (args.length == 2 && lolbot.roles.indexOf(args[1].toLowerCase()) == -1)) {
        return cb(helpers.getHelpMsg('bestwinrate'));
    } else {
        // http://api.champion.gg/stats/champs/mostWinning?api_key=APIKEY&page=1&limit=10
        // http://api.champion.gg/stats/role/ROLE/mostWinning?api_key=APIKEY&page=1&limit=10
        const limit = 10;
        let retMsg, requestUrl = 'http://api.champion.gg/stats/';

        requestUrl += (args.length == 1)?('champs/mostWinning'):('role/' + args[1].toLowerCase() + '/mostWinning');
        requestUrl += '?api_key=' + lolbot.config.ChampionGGAPIKey + '&page=1&limit=' + limit;
        request(requestUrl, (err, res, body) => {
            if (err) {
                retMsg = helpers.getRequestErrorString(err.message, res.statusCode);
            } else {
                const data = JSON.parse(body);
                retMsg = '__**Top ' + limit + ' Most Winning Champions**__  Role: ';
                retMsg += (args.length == 1)?('ALL'):(args[1].toUpperCase())  + '\n';
                if (data.error) {
                    retMsg += helpers.getCodeString('ERROR: ' + data.error);
                } else {
                    let listString = '';
                    for (i = 0; i < limit; i++) {
                        listString += (i+1) + ') ' + data.data[i].name + ' [' + data.data[i].role + '] ' +
                            '(wr: ' + data.data[i].general.winPercent +  '%)\n';
                    }
                    listString = helpers.getCodeString(listString);
                    retMsg += listString;
                }
            }
            return cb(retMsg);
        });
    }
}

/**
 * name:    live
 * params:  (stringArray) args
 *          (function) cb
 * return:  cb({ (string) picPath, (string) picFileName, (string) retMsg })
 */
const getLive = (args, cb) => {
    let retObj = {
        picPath : null,
        picFileName : null,
        retMsg : ''
    };

    if (args.length == 1 || args.length > 3 || (args.length == 3 && !(args[2].toLowerCase() in lolbot.regionsLive))) {
        retObj.retMsg = helpers.getHelpMsg('live');
        return cb(retObj);
    } else {
        const user = {
            'region' : (args[2])?(args[2]):('na'),
            'name' : args[1]
        };
        let lookupMsg = 'Live Game lookup for ' + '**' + user.name.replace(/\+/g, ' ') + ' (' + user.region.toUpperCase() + ')' + '**\n';
        retObj.retMsg = lookupMsg;

        // Summoner Lookup
        getSummonerId(user, (summonerId, summonerLookupErrorMsg) => {
            if (!summonerId) {
                retObj.retMsg += summonerLookupErrorMsg;
                return cb(retObj);
            } else {
                user.summonerId = summonerId;
                // Live Game Lookup
                isSummonerLive(user, (isLive, isSummonerLiveErrorMsg) => {
                    if (!isLive) {
                        retObj.retMsg += isSummonerLiveErrorMsg;
                        return cb(retObj);
                    } else {
                        // Run phantom.js script
                        getLiveImg(user, (picPath, picFileName, scriptErrorMsg) => {
                            if (scriptErrorMsg) {
                                retObj.retMsg +=  scriptErrorMsg;
                            } else {
                                retObj.picPath = picPath;
                                retObj.picFileName = picFileName;
                            }
                            return cb(retObj);
                        });
                    }
                })
            }
        });
    }
}

// exports
module.exports = {
    getMmr: getMmr,
    getBestRated : getBestRated,
    getBestWinrate : getBestWinrate,
    getLive : getLive
}