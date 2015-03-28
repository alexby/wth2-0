var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/:id', function(req, res){
  var id = req.params.id;
  res.sendFile(__dirname + '/' + id+ '.html');
});

io.on('connection', function(socket){
  var userId = (socket.id).toString().substr(0, 5);

  socket.on('chat message', function(msg){
    console.log(msg, userId);
    io.emit('chat message', {msg: msg, userId: userId});
  });

  socket.on("image", function(msg){
    console.log(msg);
    io.emit("image", msg);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
