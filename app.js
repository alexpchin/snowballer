var express = require('express');
var app     = express();

app.use(express.static(__dirname + '/public'));

var server = app.listen(8000, function() {
	var port = server.address().port;
	console.log('Server running at port %s', port);
});

var io = require('socket.io')(server);
var players = {};

io.on('connection', function(client) {
	// console.log('User connected', players);
  client.emit('players', players);

  client.on('newPlayer', function(player) {
    // console.log("newPlayer");
    players[player.id] = player;
    client.broadcast.emit('joined', player);
  });

  client.on('playerMove', function(player) {
    // console.log("move", player); 
    players[player.id] = player;
    client.broadcast.emit("playerMove", player);
  });

  client.on('playerStop', function(playerId) {
    // console.log("stop", playerId);
    client.broadcast.emit("playerStop", playerId);
  });

  client.on('updatePosition', function(player){
    console.log(player.x, player.y, player.classList);
    players[player.id] = player;
  })

  client.on('leaveGame', function(playerId) {
    // delete players[playerId];
    client.broadcast.emit("left", playerId);
  })
});