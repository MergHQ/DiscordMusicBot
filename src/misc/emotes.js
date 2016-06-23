module.exports = function () {
  var urlTwitch = 'https://api.twitch.tv/kraken/chat/emoticons';
  var urlBTTV = 'https://api.betterttv.net/2/emotes';
  var needle = require('needle');
  var emotes = {};
  needle.get(urlTwitch, function (err, res) {
    if (err) return;
    var array = JSON.parse(res.body).emoticons;
    for (var i = 0; i < array.length; i++) {
      emotes[array[i].regex] = array[i].images[0].url;
    }
  });

  needle.get(urlBTTV, function (err, res) {
    if (err) return;
    var array = res.body.emotes;
    for (var i = 0; i < array.length; i++) {
      emotes[array[i].code] = 'https://cdn.betterttv.net/emote/' + array[i].id + '/1x';
    }
  });

  this.do = function (payload) {
    try {
      var code = payload.mess.split(' ')[1];
      if (emotes[code] === null) return;
      App.botClient.sendMessage(payload.raw, emotes[code]);
    } catch (e) {
      App.botClient.sendMessage(payload.raw, 'Error parsing');
    }
  };
};