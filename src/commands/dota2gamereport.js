module.exports = function () {
  var steamAPI = require('../api/steam.js');
  var needle = require('needle');
  var heroes = {};

  needle.get(steamAPI.GET_d2_heroes, function (err, res) {
    if (err) return;
    var heroesArr = res.body.result.heroes;
    for (var i in heroesArr) {
      heroes[heroesArr[i].id] = heroesArr[i].localized_name;
    }
  });

  this.get = function (payload) {
    if (payload.parameter.indexOf('id/') === -1) {
      App.botClient.sendMessage(payload.raw, 'Wrong URL type. Idi nahui.');
      return;
    }

    needle.get(steamAPI.GET_steam_resolveVanity(payload.parameter.split('id/')[1].split('/')[0]), function (err1, res1) {
      if (err1) return;
      if (res1.body.response.success !== 1) return;
      var shortID = res1.body.response.steamid - 76561197960265728 - 2; 
      needle.get(steamAPI.GET_d2_matchHistory(shortID), function (err2, res2) {
        if (err2) return;
        var matches = res2.body.result.matches;
        if (matches.length === 0) return;
        needle.get(steamAPI.GET_d2_match(matches[0].match_id), function (err3, res3) {
          if (err3) return;
          var players = res3.body.result.players;
          var resObj = {};
          for (var i = 0; i < players.length; i++) {
            if (players[i].account_id == shortID) {
              resObj.isRadiant = i <= 4;
              resObj.rawStats = players[i];
              resObj.winnerIsRadiant = res3.body.result.radiant_win;

              createMessage(resObj, payload);
            }
          }
        });
      });
    });
  };

  function createMessage(data, payload) {
    var message = 'LATEST GAME: \n';
    message += 'Steam account ID (32-bit): ' + data.rawStats.account_id + '\n';
    if (data.winnerIsRadiant === data.isRadiant)
      message += 'Won game? True \n';
    else
      message += 'Won game? False \n';
    message += 'Hero: ' + heroes[data.rawStats.hero_id] + '\n';
    message += 'K/D/A: ' + data.rawStats.kills + '/' + data.rawStats.deaths + '/' + data.rawStats.assists + '\n';
    message += 'Last hits: ' + data.rawStats.last_hits + '\n';
    message += 'GPM/XPM: ' + data.rawStats.gold_per_min + '/' + data.rawStats.xp_per_min + '\n';
    App.botClient.sendMessage(payload.raw, message);
  }
};