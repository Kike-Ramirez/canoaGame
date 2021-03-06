var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendfile('river.html');
});

app.get('/canoa0', function(req, res){
  res.sendfile('river0.html');
});

app.get('/canoa1', function(req, res){
  res.sendfile('river1.html');
});

app.get('/remo0', function(req, res){
  res.sendfile('remo0.html');
});

app.get('/remo1', function(req, res){
  res.sendfile('remo1.html');
});

app.get('/mando', function(req, res){
  res.sendfile('mando.html');
});


io.on('connection', function(socket){  
  socket.on('acc0', function(msg){
    io.emit('acc0', msg);
  });
    socket.on('acc1', function(msg){
    io.emit('acc1', msg);
  });
    socket.on('click', function(msg){
    io.emit('click', msg);
  });
});

http.listen(process.env.PORT || 3000, function(){

  console.log('Listening on 3000');

});

