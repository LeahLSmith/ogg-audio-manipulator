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




/////////////////////////////////////////////////////////////////////////////////////////////////
////////
var d3 = require("d3");

// modeified stacked graph code from http://bl.ocks.org/mbostock/3943967, GNU 3 license 


/////////////////////////////////////////////////////////////////////////////////////////////////////

var cb = function callback(err, loadedBuffer) {
    buffer = loadedBuffer;
    peaks = getPeaks(buffer, buffer.length); 
    console.log(peaks); 
   //console.log("Peaks have been calculated");



   var n = 4, // The number of series.
   m = 200; // The number of values per series.

// The xz array has m elements, representing the x-values shared by all series.
// The yz array has n elements, representing the y-values of each of the n series.
// Each yz[i] is an array of m non-negative numbers representing a y-value for xz[i].
// The y01z array has the same structure as yz, but with stacked [y₀, y₁] instead of y.
var xz = d3.range(m),
   yz = d3.range(n).map(function() { return peaks; }), // bumps is the array
   y01z = d3.stack().keys(d3.range(n))(d3.transpose(yz)),
   yMax = d3.max(yz, function(y) { return d3.max(y); }),
   y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });

var svg = d3.select("svg"),
   margin = {top: 40, right: 10, bottom: 20, left: 10},
   width = +svg.attr("width") - margin.left - margin.right,
   height = +svg.attr("height") - margin.top - margin.bottom,
   g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleBand()
   .domain(xz)
   .rangeRound([0, width])
   .padding(0.08);

var y = d3.scaleLinear()
   .domain([0, y1Max])
   .range([height, 0]);

var color = d3.scaleOrdinal()
   .domain(d3.range(n))
   .range(d3.schemeCategory20c);

var series = g.selectAll(".series")
 .data(y01z)
 .enter().append("g")
   .attr("fill", function(d, i) { return color(i); });

var rect = series.selectAll("rect")
 .data(function(d) { return d; })
 .enter().append("rect")
   .attr("x", function(d, i) { return x(i); })
   .attr("y", height)
   .attr("width", x.bandwidth())
   .attr("height", 0);

rect.transition()
   .delay(function(d, i) { return i * 10; })
   .attr("y", function(d) { return y(d[1]); })
   .attr("height", function(d) { return y(d[0]) - y(d[1]); });

g.append("g")
   .attr("class", "axis axis--x")
   .attr("transform", "translate(0," + height + ")")
   .call(d3.axisBottom(x)
       .tickSize(0)
       .tickPadding(6));

d3.selectAll("input")
   .on("change", changed);

var timeout = d3.timeout(function() {
 d3.select("input[value=\"grouped\"]")
     .property("checked", true)
     .dispatch("change");
}, 2000);

function changed() {
 timeout.stop();
 if (this.value === "grouped") transitionGrouped();
 else transitionStacked();
}

function transitionGrouped() {
 y.domain([0, yMax]);

 rect.transition()
     .duration(500)
     .delay(function(d, i) { return i * 10; })
     .attr("x", function(d, i) { return x(i) + x.bandwidth() / n * this.parentNode.__data__.key; })
     .attr("width", x.bandwidth() / n)
   .transition()
     .attr("y", function(d) { return y(d[1] - d[0]); })
     .attr("height", function(d) { return y(0) - y(d[1] - d[0]); });
}

function transitionStacked() {
 y.domain([0, y1Max]);

 rect.transition()
     .duration(500)
     .delay(function(d, i) { return i * 10; })
     .attr("y", function(d) { return y(d[1]); })
     .attr("height", function(d) { return y(d[0]) - y(d[1]); })
   .transition()
     .attr("x", function(d, i) { return x(i); })
     .attr("width", x.bandwidth());
}





};

loadBuffer(context, path, cb);

//audio-peaks-node end