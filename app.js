var express = require('express');
var app     = express();

app.use(express.static(__dirname + '/public'));

var server = app.listen(8000, function() {
	var port = server.address().port;
	console.log('Server running at port %s', port);
});

var io = require('socket.io')(server);
var game = {
  players: {},
  scores: {
    gerry: 0,
    alex: 0
  }
};

io.on('connection', function(client) {
  client.emit('players', game);
  client.on('newPlayer', newPlayer);
  client.on('playerMove', playerMove);
  client.on('playerStop', playerStop);
  client.on('ballThrown', ballThrown);
  client.on('updatePosition', updatePosition);
  client.on('leaveGame', leaveGame);
  client.on('hit', hit);

  function hit(playerId){
    return client.broadcast.emit('hit', playerId, ballId);
  }

  function newPlayer(player) {
    game.players[player.id] = player;
    return client.broadcast.emit('joined', player);
  }

  function playerMove(player) {
    game.players[player.id] = player;
    return client.broadcast.emit("playerMove", player);
  }

  function playerStop(playerId) {
    return client.broadcast.emit("playerStop", playerId);
  }

  function updatePosition(player){
    return game.players[player.id] = player;
  }

  function ballThrown(ball){
    return client.broadcast.emit("ballThrown", ball);
  }

  function leaveGame(playerId) {
    delete game.players[playerId];
    return client.broadcast.emit("left", playerId);
  }
});