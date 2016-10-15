'use strict';
const QueuePlayer = require('./QueuePlayer');
const needle = require('needle');
const googleApi = require('./api/google');
module.exports = function () {
  this.voiceConnections = {};

  this.addToQue = (msg) => {
    if (!msg.member.voiceState) return 'Join a voice channel you cuck!';
    resolveSong(msg.args, (res) => {
      if (msg.member.voiceState.channelID in this.voiceConnections) {
        this.voiceConnections[msg.member.voiceState.channelID].queuePlayer.addSong({url: res, voiceChannelId: msg.member.voiceState.channelID});
      } else {
        this.voiceConnections[msg.member.voiceState.channelID] = {
          queuePlayer: new QueuePlayer()
        }
        this.voiceConnections[msg.member.voiceState.channelID].queuePlayer.addSong({url: res, voiceChannelId: msg.member.voiceState.channelID});
      }
    });
  };

  function resolveSong(param, cb) {
    if (param.indexOf('https') > -1 || param.indexOf('http') > -1)
      cb(param);
    else {
      needle.get(googleApi.GET_yt_videoSearch(param), (err, res) => {
        if (err) return;
        if (res.body.items.length !== 0) {
          cb('https://www.youtube.com/watch?v=' + res.body.items[0].id.videoId);
        }
      });
    }
  }
};