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


