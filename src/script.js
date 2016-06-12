// Global object
GLOBAL.App = {};

var Client = require('./Client.js');
var CommandManager = require('./CommandManager.js');
var sq = require('./songrequests/SongQueue.js');

require('fs').readFile('creds', 'utf8', function (err, data) {
  App.credentials = data.split('/');
  App.botClient = new Client({
      autorun: true,
      email: App.credentials[0],
      password: App.credentials[1],
  });
  App.commandManager = new CommandManager();
  App.songQue = new sq();
  registerCommands();
});

// I'm lazy
process.on('uncaughtException', function(err) {
    console.error('Caught exception: ' + err);
});

process.on('exit', function() {
  App.botClient.getDiscordClient().disconnect();
});

//--------------------------------------

function registerCommands() {
  var cm = App.commandManager;
  
  cm.registerCommand('!kappa', function(payload) {
    return "Kappa "+payload.nick;
  });

  cm.registerCommand('!serverlist', function(payload) {
    var l = App.botClient.getDiscordClient().servers;
    var res = '';
    for(var i in l)
      res += i + ' ';
    return res;
  });

  cm.registerCommand('!randomnum', function(payload) {
    try {
      var obj = JSON.parse(payload.mess.split(' ')[1]);
      return Math.floor(obj.begin + (Math.random() * (obj.end-obj.begin)));
    } catch(e) {
      return e;
    }
  });

  cm.registerCommand('!summon', function(payload) {
    var vChannelID = App.botClient.getServerObject('172356325689262080').members[payload.uID].voice_channel_id;
    App.botClient.getDiscordClient().joinVoiceChannel(vChannelID, function(err) {
      return err;
    });

      return "Joined "+vChannelID;
  });
  
  cm.registerCommand('!server', function(payload) {
    console.log(App.botClient.getServerObject('172356325689262080'));
    return App.botClient.getServerObject('172356325689262080');
  });

  cm.registerCommand('!skip', function(payload) {
    App.songQue.skip();
  });

  cm.registerCommand('!reqlist', function(payload) {
    if(App.songQue !== null) {
      var q = App.songQue.getQueue();
      var resStr = '';
      for(var i = 0; i < q.length; i++) {
        resStr += ' | ' + q[i].title; 
      }
      return resStr;
    }
  });

  cm.registerCommand('!play', function(payload) {
    if(App.botClient.getServerObject('172356325689262080').channels[payload.chanID].name !== 'cancerbot_requests') return;
    
    var userVoiceChannel = App.botClient.getServerObject('172356325689262080')
        .members[payload.uID]
        .voice_channel_id;
    var botVoiceChannel = App.botClient.getServerObject('172356325689262080')
        .members[App.botClient.getDiscordClient().id]
        .voice_channel_id;
            
    if(userVoiceChannel !== botVoiceChannel && userVoiceChannel !== null && botVoiceChannel !== null)
      App.commandManager.execCommand('!summon', payload);
    
    try {
      App.songQue.addToQueue(userVoiceChannel, payload.mess.split(' ')[1]);
      return 'youre song has been add xDDD (' + App.songQue.getQueue().length + ') ' + JSON.stringify(payload);
    } catch(e) {
      console.log(e);
    }
  });
}
