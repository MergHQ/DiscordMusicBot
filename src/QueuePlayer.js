'use strict';
const ytdl = require('ytdl-core');
module.exports = function () {
  this.queue = [];
  var self = this;
  this.voiceConnection = null;
  this.isPlaying = false;

  this.addSong = (obj) => {
    this.queue.push(obj);
    if (this.queue.length === 1 && !this.isPlaying)
        play();
  };

  this.skip = () => {
    if (this.voiceConnection)
      this.voiceConnection.stopPlaying();
  };

  function play() {
    if (self.isPlaying) return;
    var current = self.queue.shift();
    App.Client.joinVoiceChannel(current.voiceChannelId).then(con => {
      self.isPlaying = true;
      self.voiceConnection = con;
      con.play(ytdl(current.data.url, {audioonly: true}));
      con.on('end', () => {
        self.isPlaying = false;
        if (self.queue.length !== 0)
          play();
      });
      con.on('error', () => {
        self.isPlaying = false;
        if (self.queue.length !== 0)
          play();       
      });
    });
  }
};