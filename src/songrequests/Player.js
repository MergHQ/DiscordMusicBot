var ytdl = require('ytdl-core');
var FFmpeg = require('../decoder/ffmpeg.js');

function main(discordClient, vChannelID, url) {
	var currentStream = null;
	var audioContext = discordClient.getAudioContext({ channel: vChannelID, stereo: true}, handleStream);
	var onEndFunc = null;
	
	this.setOnEnd = function(callback) {
		onEndFunc = callback;
	};
	
	var ytdlStream = null;
	try {
		ytdlStream = ytdl(url, {filter: function(format) { 
			return format.container === 'mp4'; 
		}, quality: 'lowest'});
	} catch(e) { console.log(e); }
	
	var ffmpeg = null;
	ytdlStream.once('readable', function() {
		ffmpeg = new FFmpeg();
		var strim = ffmpeg.createDecoder(ytdlStream);
		
		strim.on('end', function() {
			onEndFunc();
			ffmpeg = null;	
		});
		
		strim.on('readable', function() {
			// YEEAAH GOOD SHIT
			if(strim !== null)
				currentStream.send(strim);
		});

		strim.on('error', function(err) {
			console.log('an error happened: ' + err.message);
		});
	});

	function handleStream(stream) {
		currentStream = stream;
	}
	
	this.release = function() {
		setPresence({game:'Nothing!'});
		ytdlStream.end();
		if(ytdlStream.destroy) ytdlStream.destroy();			
		ffmpeg.destroy();
		ffmpeg = null;
	};
}

module.exports = main;
