'use strict';
const QueuePlayer = require('./QueuePlayer');
module.exports = function () {
  this.voiceConnections = {};

  this.addToQue = (msg) => {
    if (!msg.member.voiceState) return 'Join a voice channel!';
    if (msg.member.voiceState.channelID in this.voiceConnections) {
      this.voiceConnections[msg.member.voiceState.channelID].queuePlayer.addSong({url: msg.args, voiceChannelId: msg.member.voiceState.channelID});
    } else {
      this.voiceConnections[msg.member.voiceState.channelID] = {
        queuePlayer: new QueuePlayer()
      }
      this.voiceConnections[msg.member.voiceState.channelID].queuePlayer.addSong({url: msg.args, voiceChannelId: msg.member.voiceState.channelID});
    }
  };
};