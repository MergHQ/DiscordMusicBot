function CommandManager(botClient) {
  var commands = {};

  this.registerCommand = function(keyword, callback) {
    commands[keyword] = callback;
  };

  botClient.addCommandListener(function(user, userID, channelID, message, rawEvent) {
    var response = "";
    try {
      var parsedMessage = message.split(' ');
      var payload = {
        nick: user,
        uID: userID,
        chanID: channelID,
        mess: message
      };
      if(parsedMessage[0] in commands)
        response = commands[parsedMessage[0]](payload);
      else return;
    } catch(e) {
      response = e;
    }
    if(response !== undefined)
      botClient.sendMessage(channelID, response);
  });
}

module.exports = CommandManager;
