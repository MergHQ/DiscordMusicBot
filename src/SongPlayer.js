'use strict';
const QueuePlayer = require('./QueuePlayer');
const needle = require('needle');
const googleApi = require('./api/google');
const ytdl = require('ytdl-core');
module.exports = function () {
  this.voiceConnections = {};

  this.addToQue = (msg) => {
    if (!msg.member.voiceState) return 'Join a voice channel you cuck!';
    resolveSong(msg.args, (res) => {
      if (msg.member.voiceState.channelID in this.voiceConnections) {
        this.voiceConnections[msg.member.voiceState.channelID].queuePlayer.addSong({ data: res, voiceChannelId: msg.member.voiceState.channelID });
      } else {
        this.voiceConnections[msg.member.voiceState.channelID] = {
          queuePlayer: new QueuePlayer()
        }
        this.voiceConnections[msg.member.voiceState.channelID].queuePlayer.addSong({ data: res, voiceChannelId: msg.member.voiceState.channelID });
      }
    });

    return '👌';
  };

  this.skip = (msg) => {
    if (msg.member.voiceState.channelID in this.voiceConnections)
      this.voiceConnections[msg.member.voiceState.channelID].queuePlayer.skip();
  };

  this.getReqlist = (msg) => {
    if (msg.member.voiceState.channelID in this.voiceConnections) {
      var list = this.voiceConnections[msg.member.voiceState.channelID].queuePlayer.queue;
      var i = 1;
      var res = '\n';
      for (var o of list) {
        res += `${i}. ${o.data.title}\n`
        i++;
      }
    }

    return res;
  };

  function resolveSong(param, cb) {
    if (param.indexOf('https') > -1 || param.indexOf('http') > -1) {
      ytdl.getInfo(param, (err, info) => {
        if (info)
          cb({title: info.title, url: param});
        else
          cb({title: 'undefined', url: param});
      });
    } else {
      needle.get(googleApi.GET_yt_videoSearch(param), (err, res) => {
        if (err) return;
        if (res.body.items.length !== 0) {
          cb({title: res.body.items[0].snippet.title ,url: 'https://www.youtube.com/watch?v=' + res.body.items[0].id.videoId});
        }
      });
    }
  }
};