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
  return _players[ball.player.id].hit();
}

function choosePlayer(){
  event.preventDefault();
  $(".error").hide();
  var team = $(this).find("input[type=radio][name=character]:checked").val();
  var name = $(this).find("input[name=name]").val();
  if (name.length > 10) {
    $(".error").text("Please choose a shorter name!").slideDown();
    return false;
  } else if (name.length < 3) {
    $(".error").text("Please choose a longer name!").slideDown();
    return false;
  }

  localPlayer = new Player(name, team, localPlayer.socketId, true);
  socket.emit('newPlayer', localPlayer);
  $("#chooseCharacter").empty();
  $(".scores").show();
}

function connect(){
  return localPlayer.socketId = socket.io.engine.id;
}

function players(game) {
  // Add players
  var players = game.players;
  Object.keys(players).forEach(function(id){
    var name = players[id].name;
    var x    = players[id].x;
    var y    = players[id].y;
    var team = players[id].team;
    var classList = players[id].classList
    return _players[id] = new Player(name, team, id, false, x, y, classList);
  });

  // Update scores
  console.log(game)
  $("#gerry").text(game.scores["gerry"]);
  $("#alex").text(game.scores["alex"]);
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