function CommandManager() {
  var commands = {};

  this.registerCommand = function (keyword, callback) {
    commands[keyword] = callback;
  };

  this.execCommand = function (keyword, payload) {
    App.botClient.sendMessage(payload.chanID, commands[keyword](payload));
  };

  App.botClient.addMessageListener(function (user, userID, channel, message, rawEvent) {
    var response = "";
    try {
      var parsedMessage = message.split(' ');
      var payload = {
        nick: user,
        userID: userID,
        channel: channel,
        mess: message,
        raw: rawEvent
      };
      if (parsedMessage[0] in commands)
        response = commands[parsedMessage[0]](payload);
      else return;
    } catch (e) {
      response = e;
    }
    if (response !== undefined)
      App.botClient.sendMessage(rawEvent, response);
  });
}

module.exports = CommandManager;
