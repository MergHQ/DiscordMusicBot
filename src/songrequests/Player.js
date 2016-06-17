var ytdl = require('ytdl-core');

function main(url) {
	var currentStream = null;
	var audioContext = App.botClient.getAudioContext();
	var onEndFunc = null;
	
	this.setOnEnd = function(callback) {
		onEndFunc = callback;
	};
	
	var ytdlStream = null;
	try {
		ytdlStream = ytdl(url, {filter: 'audioonly'});
	} catch(e) { console.log(e); }
	
	ytdlStream.on('end', function() {
		onEndFunc();
	});
	
	// So discord.js encodes the data stream for me with ffmpeg. Sweet!
	audioContext.playRawStream(ytdlStream, {volume: 0.1}, function(str,err) {
		console.log(err);
	});

	this.release = function() {
		ytdlStream.end();
		audioContext.stopPlaying();
		if(ytdlStream.destroy) ytdlStream.destroy();
	};
}

module.exports = main;
