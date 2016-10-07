module.exports = function () {
  var ping = {
    key: '!ping',
    func: (msg) => {
      return `Fuck you (${Date.now() - msg.timestamp}ms)`;
    }
  };

  var play = {
    key: '!play',
    func: (msg) => {
      App.SongPlayer.addToQue(msg);
    }
  };

  App.CommandManager.registerCommand(ping);
  App.CommandManager.registerCommand(play);
};