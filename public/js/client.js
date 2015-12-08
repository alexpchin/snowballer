var socket      = io.connect('http://b27f3cac.ngrok.io/');
var _players    = {};
var _balls      = {};
var localPlayer = {};

$(function(){
  $("form#chooseCharacter").on("submit", choosePlayer);
});

$(window).on('beforeunload', leaveGame);

socket.on('connect', connect);
socket.on('players', players);
socket.on('joined', joined);
socket.on('left', left);
socket.on('playerMove', playerMove);
socket.on('playerStop', playerStop);
socket.on('ballThrown', ballThrown);
socket.on('hit', hit);

function hit(ballId){
  var ball = _balls[ballId];
  ball.$ball
    .css("background-image", "url('/images/splat.png')") 
    .css("width", "14px")
    .css("height", "14px");
  console.log(ball);
}

function choosePlayer(){
  event.preventDefault();
  var team = $(this).find("input[type=radio][name=character]:checked").val();
  var name = $(this).find("input[name=name]").val();
  localPlayer = new Player(name, team, localPlayer.socketId, true);
  socket.emit('newPlayer', localPlayer);
  $("#chooseCharacter").empty();
}

function connect(){
  return localPlayer.socketId = socket.io.engine.id;
}

function players(players) {
  Object.keys(players).forEach(function(id){
    var name = players[id].name;
    var x    = players[id].x;
    var y    = players[id].y;
    var team = players[id].team;
    var classList = players[id].classList
    return _players[id] = new Player(name, team, id, false, x, y, classList);
  });
}

function joined(player) {
  var name = player.name;
  var id   = player.id;
  var x    = player.x;
  var y    = player.y;
  var team = player.team;
  var classList = player.classList
  return _players[player.id] = new Player(name, team, id, false, x, y, classList);
}

function left(playerId) {
  $("#"+playerId).fadeOut(function(){ $(this).remove(); });
  return delete _players[playerId];
}

function playerMove(data){
  return _players[data.id].move(data.direction, data.keyCode);
}

function playerStop(player){
  return _players[player.id].stop();
}

function ballThrown(ball){
  return _balls[ball.id] = new Ball(ball.id, ball.x, ball.y, ball.direction, ball.player);
}

function leaveGame(){
  return socket.emit('leaveGame', localPlayer.id);
}