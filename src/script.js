// Global object
GLOBAL.App = {};

var Client = require('./Client.js');
var CommandManager = require('./CommandManager.js');
var sq = require('./songrequests/SongQueue.js');

require('fs').readFile('creds', 'utf8', function (err, data) {
  App.credentials = data.split('/');
  App.botClient = new Client();
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
    return App.botClient.joinChannel(payload.raw.author.voiceChannel)
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
    console.log(App.botClient.getDiscordClient().servers);
    return App.botClient.getServerObject('TINT');
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
  
  cm.registerCommand('!test', function(payload) {
    App.botClient.getAudioContext().playFile('asd.mp3');
  });

  cm.registerCommand('!play', function(payload) {
    if(payload.channel.name !== 'cancerbot_requests') return;
    
    var userVoiceChannel = payload.raw.author.voiceChannel;
    var botVoiceChannel = App.botClient.getBotUserObject().voiceChannel;  
         
    if(userVoiceChannel === null || botVoiceChannel === null || userVoiceChannel.id !== botVoiceChannel.id)
      App.commandManager.execCommand('!summon', payload);
    
    try {
      App.songQue.addToQueue(payload.mess.split(' ')[1]);
      return 'youre song has been add xDDD (' + App.songQue.getQueue().length + ')';
    } catch(e) {
      console.log(e);
    }
  });
}
