var socket = io.connect('http://10.51.20.213:8000');

var _players = {};
var localPlayer = {};

socket.on('connect', function(){
  var socketId = socket.io.engine.id;
  localPlayer = new Player("Mike", socketId, true);
  socket.emit('newPlayer', localPlayer);
});

socket.on('players', function(players) {
  console.log("playaz", players);
  Object.keys(players).forEach(function(id){
    _players[id] = new Player(players[id].name, id, false);
  });
});

socket.on('joined', function(player) {
  _players[player.id] = new Player(player.name, player.id, false);
});

socket.on('left', function(playerId) {
  $("#"+playerId).remove();
  delete _players[playerId];
})

socket.on('playerMove', function(data){
  _players[data.id].move(data.direction, data.keyCode);
})

socket.on('playerStop', function(playerId){
  _players[playerId].stop();
})

$(window).on('beforeunload', function(){
  socket.emit('leaveGame', localPlayer.id);
});