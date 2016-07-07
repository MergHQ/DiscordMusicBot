// Global object
GLOBAL.App = {};

var Client = require('./Client.js');
var CommandManager = require('./CommandManager.js');
var sq = require('./commands/songrequests/SongQueue.js');
var WQ = require('./commands/weather.js');
var emotes = require('./commands/emotes.js');
var commands = require('./Commands.js');

require('fs').readFile('creds', 'utf8', function (err, data) {
  App.credentials = JSON.parse(data);
  init();
});

// I'm lazy
process.on('uncaughtException', function (err) {
  if (err.code == 'ECONNRESET') {
    console.log('Got an ECONNRESET! This is *probably* not an error. Stacktrace:');
    console.log(err.stack);
    return;
  }

  console.log(err);
  console.log(err.stack);
});

process.on('exit', function () {
  App.botClient.getDiscordClient().disconnect();
});

//--------------------------------------

function init() {

  // Init some shit
  App.botClient = new Client();
  App.commandManager = new CommandManager();
  App.SongQue = new sq();
  App.Weather = new WQ();
  App.Emotes = new emotes();

  // Create commands
  commands();
}
