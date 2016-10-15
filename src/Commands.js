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
      return App.SongPlayer.addToQue(msg);
    }
  };

  var skip = {
    key: '!skip',
    func: (msg) => {
      App.SongPlayer.skip(msg);
      return '👌';
    }
  };

  var reqlist = {
    key: '!reqlist',
    func: (msg) => {
      return App.SongPlayer.getReqlist(msg);
    }
  };

  App.CommandManager.registerCommand(ping);
  App.CommandManager.registerCommand(play);
  App.CommandManager.registerCommand(skip);
  App.CommandManager.registerCommand(reqlist);
};