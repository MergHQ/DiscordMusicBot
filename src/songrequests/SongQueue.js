module.exports = function() {
    var Player = require('./Player.js');
    var ytdl = require('ytdl-core');
    var messageListeners = [];
    var queue = [];
    var currentPlayingSong = null;
    var time = 5;
    var cli = App.botClient.getDiscordClient();
    
    this.onMessage = function(callback) {
        messageListeners.push(callback);
    };

    this.addToQueue = function(chanID, url) {
        if(url.indexOf('playlist') != -1) {
            parsePlaylist(url, chanID);
            return;
        }
        
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
    };
    
    function parsePlaylist(playlistUrl, chanID) {
        var needle = require('needle');
        
        // you can somehow use needle to pass this object instead of having that long-ass url down there.
        var options = {
          part: 'contentDetails',
          playlistId: playlistUrl.split('=')[1],
          maxResults: 20,
          key: App.credentials[2]  
        };
        
        var reqUrl = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId='+options.playlistId+'&maxResults=20&key='+options.key;
        needle.get(reqUrl, function(err, res) {
            if(!err) {
                var obj = res.body;
                for(var i = 0; i < obj.items.length; i++) {
                    var currentItem = obj.items[i];
                    var url = 'https://www.youtube.com/watch?v='+currentItem.snippet.resourceId.videoId;
                    queue.push({title: currentItem.snippet.title, channelID: chanID, url: url}); 
                }
            }
        }); 
    }

    function sendMessage(content) {
        for(var i = 0; i < messageListeners.length; i++)
            messageListeners[i](content);
    }
    
    function endSong() {
        time = 0;
        cli.setPresence({game:'Nothing!'});
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