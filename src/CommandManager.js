'use strict';
module.exports = function () {
  this.commands = {};
  var self = this;

  this.registerCommand = (obj) => {
    this.commands[obj.key] = obj;
  };

  App.Client.on('messageCreate', (msg) => {
    try {
      let splitted = msg.content.split(' ');
      let key = splitted.shift();
      msg.args = splitted.join(' ');
      let ret = null

      if (key in self.commands) {
        ret = self.commands[key].func(msg);
      }

      if (ret)
        App.Client.createMessage(msg.channel.id, ret);
    } catch(e) {
      console.log(e);
    }
  });
};