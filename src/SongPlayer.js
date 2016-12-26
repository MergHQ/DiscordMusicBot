'use strict';
const QueuePlayer = require('./QueuePlayer');
const needle = require('needle');
const googleApi = require('./api/google');
const ytdl = require('ytdl-core');
module.exports = function () {
  this.voiceConnections = {};
  var self = this;

  this.addToQue = (msg) => {
    if (!msg.member.voiceState) return 'Join a voice channel you cuck!';
    resolveRequest(msg, addToQue);

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
        let addition = `${i}. ${o.data.title}\n`;
        if ((res.length + addition.length) > 1000)
          return res;
        else
          res += addition;
        i++;
      }
    }

    return res;
  };

  function addToQue(msg, res) {
    if (msg.member.voiceState.channelID in self.voiceConnections) {
      self.voiceConnections[msg.member.voiceState.channelID].queuePlayer.addSong({ data: res, voiceChannelId: msg.member.voiceState.channelID });
    } else {
      self.voiceConnections[msg.member.voiceState.channelID] = {
        queuePlayer: new QueuePlayer()
      }
      self.voiceConnections[msg.member.voiceState.channelID].queuePlayer.addSong({ data: res, voiceChannelId: msg.member.voiceState.channelID });
    }
  }

  function resolveRequest(msg, cb) {
    let param = msg.args;
    if (param.indexOf('https') > -1 || param.indexOf('http') > -1) {
      if (param.indexOf('playlist') > -1) {
        needle.get(googleApi.GET_yt_playlist(param.split('=')[1]), (err, res) => {
          if (err || res.statusCode !== 200)
            return;
          let items = res.body.items;
          let sortedItems = items.map(v => {
            return { title: v.snippet.title, url: 'https://www.youtube.com/watch?v=' + v.snippet.resourceId.videoId }
          });
          addToQue(msg, sortedItems);
        });
      } else {
        try {
          ytdl.getInfo(param, (err, info) => {
            if (info)
              cb(msg, { title: info.title, url: param });
            else
              cb(msg, { title: 'undefined', url: param });
          });
        } catch (e) {
          cb(msg, { title: 'undefined', url: param });
        }
      }
    } else {
      needle.get(googleApi.GET_yt_videoSearch(param), (err, res) => {
        if (err) return;
        if (res.body.items.length !== 0) {
          cb(msg, { title: res.body.items[0].snippet.title, url: 'https://www.youtube.com/watch?v=' + res.body.items[0].id.videoId });
        }
      });
    }
  }
};