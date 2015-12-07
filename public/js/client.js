var socket = io.connect('http://localhost:8000');

var _players = {};
var localPlayer = {};

socket.on('connect', function(){
  // console.log("connected");
  localPlayer = new Player("Mike", new Date().getTime().toString(32), true);
  socket.emit('newPlayer', localPlayer);
});

socket.on('players', function(players) {
  // console.log("Getting playaz", players);
  players.forEach(function(player){
    _players[player.id] = new Player(player.name, player.id, false);
  });
});

socket.on('joined', function(player) {
  // console.log("joined");
  _players[player.id] = new Player(player.name, player.id, false);
});

socket.on('playerMove', function(data){
  console.log(data.id);
  console.log(_players);
  _players[data.id].move(data.direction);
})

// socket.on('player', function(data) {
//   console.log("PLAYER");
//   if(data.id !== localPlayer.id) {
//     players.push(new Player(data.name, data.id));
//   }
// });