// Global object
GLOBAL.App = {};

var Client = require('./Client.js');
var CommandManager = require('./CommandManager.js');
var sq = require('./songrequests/SongQueue.js');
var WQ = require('./misc/weather.js');
var emotes = require('./misc/emotes.js');
var commands = require('./Commands.js');

require('fs').readFile('creds', 'utf8', function (err, data) {
  App.credentials = data.split('/');
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
