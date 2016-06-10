var DiscordClient = require('discord.io');
function Client(credentials) {
  var cli = new DiscordClient(credentials);
  var messageListeners = [];
  
  this.addCommandListener = function(func) {
    messageListeners.push(func);
  };

  this.sendMessage = function(channelID, message) {
    cli.sendMessage({
        to: channelID,
        message: message
    });
  };
  
  this.getServerObject = function(id) {
    return cli.servers[id];
  }

  this.getDiscordClient = function() {
    return cli;
  };

  cli.on('ready', function() {
      console.log(cli.username + " - (" + cli.id + ")");
  });

  cli.on('message', function(user, userID, channelID, message, rawEvent) {
    // Only emit commands.
    if (message.indexOf("!") != -1) {
      for(var i = 0; i < messageListeners.length; i++) {
        messageListeners[i](user, userID, channelID, message, rawEvent);
      }
    }
  });

  cli.on('disconnected', function() {
    console.log("Disconnected, reconnecting...");
    cli.connect(); // Reconnect on disconnection
  });
}

module.exports = Client;
