var socket = io.connect('http://10.51.21.200:8000');

var _players = {};
var localPlayer = {};

socket.on('connect', function(){
  // Go and get all of the current players from the server
  console.log("connected");

  localPlayer = new Player("Mike", new Date().getTime().toString(32), true);
  socket.emit('newPlayer', localPlayer);
});

socket.on('players', function(players) {
  console.log("Getting playaz", players);
  players.forEach(function(player){
    _players[player.id] = new Player(player.name, player.id);
  });
});

socket.on('joined', function(player) {
  console.log("joined");
  _players[player.id] = new Player(player.name, player.id);
});

  // socket.on('player', function(data) {
  //   console.log("PLAYER");
  //   if(data.id !== localPlayer.id) {
  //     players.push(new Player(data.name, data.id));
  //   }
  // });