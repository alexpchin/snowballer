$(function(){
  $("form#chooseCharacter").on("submit", choosePlayer);
  if ($('input[name=character]').is(':checked')) {
    console.log('checked')
    $(".enter-name").show();
  }
});

  function choosePlayer(){
    event.preventDefault();
    var team = $(this).find("input[type=radio][name=character]:checked").val();
    var name = $(this).find("input[name=name]").val();
    localPlayer = new Player(name, team, localPlayer.socketId, true);
    socket.emit('newPlayer', localPlayer);
    $("#chooseCharacter").empty();
  }

  var socket = io.connect('http://b27f3cac.ngrok.io/');

  var _players = {};
  var localPlayer = {};

  socket.on('connect', function(){
    localPlayer.socketId = socket.io.engine.id;
  });

  socket.on('players', function(players) {
    console.log("playaz", players);
    Object.keys(players).forEach(function(id){
      var name = players[id].name;
      var x    = players[id].x;
      var y    = players[id].y;
      var team = players[id].team;
      var classList = players[id].classList
      _players[id] = new Player(name, team, id, false, x, y, classList);
    });
  });

  socket.on('joined', function(player) {
    var name = player.name;
    var id   = player.id;
    var x    = player.x;
    var y    = player.y;
    var team = player.team;
    var classList = player.classList
    _players[player.id] = new Player(name, team, id, false, x, y, classList);
  });

  socket.on('left', function(playerId) {
    $("#"+playerId).fadeOut(function(){
      $(this).remove();
    });
    delete _players[playerId];
  })

  socket.on('playerMove', function(data){
    _players[data.id].move(data.direction, data.keyCode);
  })

  socket.on('playerStop', function(player){
    _players[player.id].stop();
  })

  $(window).on('beforeunload', function(){
    socket.emit('leaveGame', localPlayer.id);
  });