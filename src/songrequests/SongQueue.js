module.exports = function(cli) {
    var Player = require('./Player.js');
    var ytdl = require('ytdl-core')
    var messageListeners = [];
    var queue = [];
    var currentPlayingSong = null;
    var time = 5;
    
    this.onMessage = function(callback) {
        messageListeners.push(callback);
    };
    
    function sendMessage(content) {
        for(var i = 0; i < messageListeners.length; i++)
            messageListeners[i](content);
    }
    
    this.addToQueue = function(chanID, url) {
        ytdl.getInfo(url, {}, function(err, data) {
            queue.push({title: data.title, channelID: chanID, url: url}); 
        });
    };
    
    this.skip = function() {
        if(currentPlayingSong !== null)
            endSong();
    };
    
    this.getQueue = function() {
        return queue;
    }
    
    function endSong() {
        time = 0;
        if(currentPlayingSong !== null)
            currentPlayingSong.release();
        currentPlayingSong = null;
    }
    
    function play(obj) {
        try {
            // Change title
            cli.setPresence({game:obj.title});
            currentPlayingSong = new Player(cli, obj.channelID, obj.url);
            currentPlayingSong.setOnEnd(endSong);
        } catch(e) { console.log(e); }
    }
    
    function timer() {
        time++;
        if(time >= 5 && currentPlayingSong === null) {
            if(queue.length === 0)
                return;
            play(queue[0]);
            queue.shift();
        }
    }
    
    setInterval(timer, 1000);
};