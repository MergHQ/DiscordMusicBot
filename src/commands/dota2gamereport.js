module.exports = function () {
  var steamAPI = require('../api/steam.js');
  var needle = require('needle');
  var heroes = {};

  needle.get(steamAPI.GET_d2_heroes, function (err, res) {
    if(err) return;
    var heroesArr = res.body.result.heroes;
    for(var i in heroesArr) {
      heroes[heroesArr[i].id] = heroesArr[i].localized_name;
    }
  });

  this.get = function (payload) {
    needle.get(steamAPI.GET_d2_matchHistory(payload.parameter), function (err, res) {
      if (err) return;
      var matches = res.body.result.matches;
      if (matches.length === 0) return;
      needle.get(steamAPI.GET_d2_match(matches[0].match_id), function (err, res1) {
        if (err) return;
        var players = res1.body.result.players;
        var resObj = {};
        for (var i = 0; i < players.length; i++) {
          console.log(players[i].account_id);
          if (players[i].account_id == payload.parameter) {
            resObj.isRadiant = i <= 4;
            resObj.rawStats = players[i];
            resObj.winnerIsRadiant = res1.body.result.radiant_win;
            createMessage(resObj, payload);
          }
        }
      });
    });
  };

  function createMessage(data, payload) {
    var message = 'LATEST GAME: \n';
    message += 'Steam account ID: '+ data.rawStats.account_id + '\n';
    if (data.winnerIsRadiant === data.isRadiant)
      message += 'Won game? True \n';
    else
      message += 'Won game? False \n';
    message += 'Hero: ' + heroes[data.rawStats.hero_id] + '\n';
    message += 'K/D/A: ' + data.rawStats.kills + '/' + data.rawStats.deaths + '/' +data.rawStats.assists + '\n';
    message += 'Last hits: ' + data.rawStats.last_hits + '\n';
    message += 'GPM/XPM: ' + data.rawStats.gold_per_min + '/' + data.rawStats.xp_per_min + '\n';
    App.botClient.sendMessage(payload.raw, message);
  }
};