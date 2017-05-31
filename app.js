'use strict';

const Gfycat = require('gfycat-sdk');
const assert = require('assert');

var app = require('express')();
var http = require('http').Server(app);
var gfycat = new Gfycat({clientId: "2_RsVE1Z", clientSecret: "FJbLcXSMZ9iqdec1n0mLSacgGqAWnPi6Q21UfQYoi9rYTYZ3lD6tGRR6J5l2gdNY"});
var io = require('socket.io')(http);

var accessToken = "";

// Login to gfycat
gfycat.authenticate((err, data) => {
  accessToken = data.access_token;
});

// Serve the webpage to view the assistant on
app.get('/', function(req,res) {
  res.sendFile(__dirname + '/index.html');
});

// Simple status check
app.get('/status/', function(req,res) {
  res.send('ready');
});

// Shortcut for getting a random value between [0,val]
function rand(val)
{
  var r = Math.floor(Math.random() * val);
  return r;
}

// Listen for connections/disonnections on the socket.
// On a connection, emit a hello gif. On a disconnect, emit a goodbye gif.
io.on('connection', function(socket){
  console.log('User Connected');
  io.emit('userconnection', {text: 'hello'});
  if(accessToken != "")
  {
    searchGIF('Hello');
  }
  socket.on('danger', function() {
    searchGIF('danger');
    io.emit('dangerdisplay', {text:"danger is active"});
    console.log('Displaying danger gif');
  });
  socket.on('find', function(msg) {
    searchGIF(msg.search);
    console.log("Doing gif search: " + msg.search);
  });
  socket.on('disconnect', function() { // disconnect handler starts here
    searchGIF('Goodbye');
    io.emit('userconnection', {text: 'goodbye'});
    console.log('User Disconnected');
  });
  socket.on('assistantready', function() {
    searchGIF('sleeping');
    console.log('Assistant is now sleeping');
  });
});

// Search the gfycat api and emit the url of the found gif to connected clients
function searchGIF(query) {
  if(accessToken == "")
  {
    return;
  }
  var searchCount = 20;
  gfycat.search({
    search_text: query,
    count: searchCount,
    first: 30
  }, (err, data) => {
    io.emit('searchresult', {url: data.gfycats[rand(searchCount)].gifUrl});
  });
}

http.listen(3000, function() {
  console.log('Listening On Port:3000.\nNavigate to localhost:3000');
});
