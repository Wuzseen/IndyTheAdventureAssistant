'use strict';

const Gfycat = require('gfycat-sdk');
const assert = require('assert');

var app = require('express')();
var http = require('http').Server(app);
var gfycat = new Gfycat({clientId: "2_RsVE1Z", clientSecret: "FJbLcXSMZ9iqdec1n0mLSacgGqAWnPi6Q21UfQYoi9rYTYZ3lD6tGRR6J5l2gdNY"});
var io = require('socket.io')(http);

var accessToken = "";

gfycat.authenticate((err, data) => {
  accessToken = data.access_token;
});

app.get('/', function(req,res) {
  res.sendFile(__dirname + '/index.html');
});

function rand(val)
{
  var r = Math.floor(Math.random() * val);
  return r;
}

io.on('connection', function(socket){
  console.log('User Connected');
  io.emit('userconnection', {text: 'hello'});
  if(accessToken != "")
  {
    searchGIF('Hello');
  }
  socket.on('disconnect', function() {
    if(accessToken != "")
    {
      searchGIF('Goodbye');
    }
    io.emit('userconnection', {text: 'goodbye'});
    console.log('User Disconnected');
  });
});

function searchGIF(query) {
  gfycat.search({
    search_text: query,
    count: 20,
    first: 30
  }, (err, data) => {
    io.emit('searchresult', {url: data.gfycats[rand(20)].gifUrl});
  });
}

http.listen(3000, function() {
  console.log('Listening On *:3000');
});

// gfycat.authenticate( (err, res) => {
//   expect(err).to.not.exist;
//   expect(res).to.exist;
//   expect(res).to.contain.keys('token_type', 'scope', 'expires_in', 'access_token');
//   expect(res.token_type).to.equal('bearer');
//   expect(res.access_token).to.be.a('string');
//   done();
// });
