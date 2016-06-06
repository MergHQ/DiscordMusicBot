module.exports = function() {
    var child_process = require('child_process');
    
    this.createDecoder = function(stream) {
        this.stream = stream;
        this.process = child_process.spawn('C:/ffmpeg/bin/ffmpeg.exe', [
            "-f", "s16le",
            "-ar", 48000,
            "-ac", 2,
            "-af", "volume=1",
            "pipe:1",
            "-i", "-"
        ]);
        stream.pipe(this.process.stdin);
        return this.process.stdout;
    }
    
    // Destroying this shit is an absolute pain.
    this.destroy = function() {
        console.log('killing ffmpeg child process...');
        try{
            if(this.process != null) {
                if(this.stream != null)
                    this.stream.unpipe(this.process.stdin);
                    
            this.process.stdin.pause();
            this.process.kill('SIGKILL');
            this.process = null;                    
            }
            this.stream = null;
        } catch(e) {
            console.error(e);
        }
    }
}