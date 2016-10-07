'use strict';
const ytdl = require('ytdl-core');
module.exports = function () {
  var queue = [];
  var self = this;
  this.isPlaying = false;

  this.addSong = (obj) => {
    queue.push(obj);
  };

  setInterval(() => {
    if (queue.length !== 0)
      play();
  }, 100);

  function play() {
    if (self.isPlaying) return;
    var current = queue.shift();
    var connection = App.Client.voiceConnections.find(c => c.channelID === current.voiceChannelId);
    if (!connection) {
      App.Client.joinVoiceChannel(current.voiceChannelId).then(con => {
        self.isPlaying = true;
        con.play(ytdl(current.url, { audioonly: true }));
        con.on('end', () => {
          self.isPlaying = false;
          if (queue.length !== 0)
            play();
        });
      });
    } else {
      self.isPlaying = true;
      connection.play(ytdl(current.url, { audioonly: true }));
      connection.on('end', () => {
        self.isPlaying = false;
        if (queue.length !== 0)
          play();
      });
    }
  }
};