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
  if (err.code == 'ECONNRESET') {
    console.log('Got an ECONNRESET! This is *probably* not an error. Stacktrace:');
    console.log(err.stack);
    return;
  } 
  
  console.log(err);
  console.log(err.stack);
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

  cm.registerCommand('!summon', function(payload) {
    var vChannelID = App.botClient.getServerObject('172356325689262080').members[payload.uID].voice_channel_id;
    App.botClient.getDiscordClient().joinVoiceChannel(vChannelID, function(err) {
      return err;
    });

      return "Joined "+vChannelID;
  });
  
  cm.registerCommand('!randomvid', function(payload) {
    var needle = require('needle');
    var id = '';
    for(var i = 0; i < 3; i++) {
      if(Math.random() >= 0.33)
        id += String.fromCharCode(100 + Math.floor(Math.random() * 25));
      else if(Math.random() >= 0.66)
        id += String.fromCharCode(65 + Math.floor(Math.random() * 25));
      else
        id += Math.floor(Math.random() * 9);
    }
        
    var reqUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=v='+id+'&type=video&key='+App.credentials[2];
    needle.get(reqUrl, function(err, res) {
      if(!err) {
          var item = res.body.items[Math.floor(Math.random() * res.body.items.length)];
          payload.mess = '!play https://www.youtube.com/watch?v='+item.id.videoId;
          App.commandManager.execCommand('!play', payload);
      } 
    });
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
      return 'youre song has been add xDDD (' + App.songQue.getQueue().length + ')';
    } catch(e) {
      console.log(e);
    }
  });
}
