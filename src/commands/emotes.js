module.exports = function () {
  var bttvAPI = require('../api/bttv.js');
  var twitchAPI = require('../api/twitch.js');
  var needle = require('needle');
  var emotes = {};
  needle.get(twitchAPI.GET_emoteList, function (err, res) {
    if (err) return;
    var array = JSON.parse(res.body).emoticons;
    for (var i = 0; i < array.length; i++) {
      emotes[array[i].regex] = array[i].images[0].url;
    }
  });

  needle.get(bttvAPI.GET_emoteList, function (err, res) {
    if (err) return;
    var array = res.body.emotes;
    for (var i = 0; i < array.length; i++) {
      emotes[array[i].code] = bttvAPI.GET_emote(array[i].id);
    }
  });

  this.do = function (payload) {
    try {
      var code = payload.parameter;
      if (emotes[code] === null) return;
      needle.get(emotes[code], function (err, res) {
        if (err) return;
        App.botClient.sendFile(payload.raw, new Buffer(res.body));
      });
    } catch (e) {
      App.botClient.sendMessage(payload.raw, 'Error parsing');
    }
  };
};
