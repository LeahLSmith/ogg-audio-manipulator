//dependencies

//web-audio-api
var webAudioAPI = require('web-audio-api');
var AudioContext = webAudioAPI.AudioContext;
var context = new AudioContext();

//http
var XMLHttpRequest = require("xhr2").XMLHttpRequest;
var width = 700; // hardcoded, but it will be a parameter

// for ogg files using vorbis 
var vorbis = require('vorbis');
var ogg = require('ogg');


// code taken from audio-peaks-node at https://github.com/karimfikry/audio-peaks-node
function loadBuffer(context, path, cb) {
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      context.decodeAudioData(request.response, function(theBuffer) {
        cb(null, theBuffer);
      }, function(err) {
        cb(err);
      });
    }
    request.send();
}
function getPeaks(audioBuffer, length) {
    var buffer = audioBuffer;
    var sampleSize = buffer.length / length;
    var sampleStep = ~~(sampleSize / 10) || 1;
    var channels = buffer.numberOfChannels;
    var peaks = new Float32Array(length);

    for (var c = 0; c < channels; c++) {
        var chan = buffer.getChannelData(c);
        for (var i = 0; i < length; i++) {
            var start = ~~(i * sampleSize);
            var end = ~~(start + sampleSize);
            var max = 0;
            for (var j = start; j < end; j += sampleStep) {
                var value = chan[j];
                if (value > max) {
                    max = value;
                // faster than Math.abs
                } else if (-value > max) {
                    max = -value;
                }
            }
            if (c == 0 || max > peaks[i]) {
                peaks[i] = max;
            }
        }
    }
    
    return peaks;
}

var path = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; //sample mp3 
var buffer, peaks;

var cb = function callback(err, loadedBuffer) {
    buffer = loadedBuffer;
    peaks = getPeaks(buffer, buffer.length); 
   // console.log(peaks); 
   //console.log("Peaks have been calculated");
};

loadBuffer(context, path, cb);

//audio-peaks-node end