function Player(name, team, id, isLocal, x, y, classList){
  this.name      = name;
  this.id        = id;
  this.team      = team;
  this.character = $('<div id="' + this.id + '" alt="'+ this.name+ '" class="'+ this.team +' character front-stand"></div>');
  this.classList = classList || "character front-stand";
  this.currentKey;
  this.charStep;
  this.x         = x || 0; // Will be random
  this.y         = y || 0; // Will be random
  this.charStep  = 2; 
  this.charSpeed = 400;
  this.hp        =
  this.stage     = $('#stage');
  this.init();
  if (isLocal) this.bindEvents();
}

Player.prototype.init = function(){
  this.stage.append(this.character);
  this.character
    .addClass(this.classList)
    .css("left", this.x)
    .css("top", this.y)
    .fadeIn();
}

Player.prototype.bindEvents = function(){
  $(document).keydown(this.keydown.bind(this));
  $(document).keyup(this.keyup.bind(this));
}
  
Player.prototype.keydown = function(e){
  if (!this.currentKey && this.character.queue("fx").length == 0) {

    var direction;
    switch(e.keyCode) {
      case 38: direction = 'up';    break;
      case 39: direction = 'right'; break;
      case 40: direction = 'down';  break;
      case 37: direction = 'left';  break;
      case 32: this.throwBall();    break;
      default: return;
    }

    if (direction) {
      this.move(direction, e.keyCode);
      window.socket.emit('playerMove', { 
        id: this.id, 
        direction: direction, 
        keyCode: e.keyCode 
      });
    }
  }
}

Player.prototype.getDirection = function(){
  return this.classList.match(/front-|right-|left-|back-/)[0].replace("-", "");
}

Player.prototype.throwBall = function(){
  var ball = $("<div class='snowball'></div>");
  var x = parseInt(this.x)+10 + "px";
  var y = parseInt(this.y)+10 + "px";
  var direction;

  switch (this.getDirection(this.classList)) {
    case "front":
      direction = { top: "+=100" };
      break;
    case "back":
      direction = { top: "-=100" };
      break;
    case "left":
      direction = { left: "-=100" };
      break;
    case "right":
      direction = { left: "+=100" };
      break;
  }

  ball.css("left", x).css("top", y);
  this.stage.append(ball);
  ball.show().animate(direction, 600, "linear", function() {
    $(this).fadeOut();
    var ballx = $(this).css("left");
    var bally = $(this).css("top");
    var ball  = this;

    Object.keys(_players).forEach(function(id) {
      var x = _players[id].x;
      var y = _players[id].y;

      if (parseInt(ballx) <= parseInt(x)+15 &&
          parseInt(ballx) >= parseInt(x)-15 &&
          parseInt(bally) <= parseInt(y)+15 &&
          parseInt(bally) >= parseInt(y)-15) {
        alert("hit");
      }
    });
  });
}

// function isCollide(a, b) {
//     return !(
//         ((a.y + a.height) < (b.y)) ||
//         (a.y > (b.y + b.height)) ||
//         ((a.x + a.width) < b.x) ||
//         (a.x > (b.x + b.width))
//     );
// }


// Prevent movement if player is:
// - pushing other buttons
// - only stop the walk if the key that started the walk is released
Player.prototype.keyup = function(){
  window.socket.emit('playerStop', this);
  this.stop();
}

Player.prototype.stop = function(){
  return this.currentKey = false;
}
  
Player.prototype.move = function(direction, keyCode) {
  // a player could switch key mid-animation
  // records the key that was down when animation started
  this.currentKey = keyCode;
  var currentKeyCheck = this.currentKey;
    
  // adjust from lang to code
  if (keyCode == 38) direction = "back";
  if (keyCode == 40) direction = "front";
    
  this.charStep++;
  if (this.charStep == 5) this.charStep = 1;
    
  // remove the current class
  this.character.attr('class',  this.team + ' character');
    
  // Add the new class depending on the number of steps
  switch (this.charStep) {
    case 1: 
      this.character.addClass(direction+'-stand');
      this.step(direction, '-right', (this.charSpeed/3))
      this.step(direction, '-stand', ((this.charSpeed/3)*2))
      break;
    case 2: 
      this.character.addClass(direction+'-right');
      this.step(direction, '-stand', (this.charSpeed/3))
      this.step(direction, '-left', ((this.charSpeed/3)*2))
      break;
    case 3: 
      this.character.addClass(direction+'-stand');
      this.step(direction, '-left', (this.charSpeed/3))
      this.step(direction, '-stand', ((this.charSpeed/3)*2))
      break;
    case 4: 
      this.character.addClass(direction+'-left');
      this.step(direction, '-stand', (this.charSpeed/3))
      this.step(direction, '-right', ((this.charSpeed/3)*2))
      break;
  }
  
  // Actually move the character
  var player = this;
  switch(direction) {
    case 'front':
      player.character.animate({
        top: '+=32'
      }, player.charSpeed, "linear", function() {
        if (player.currentKey == currentKeyCheck) player.move(direction);
        player.y = player.character.css("top");
      });
      break;
    case 'back':
      if (player.character.position().top > 0) {
        player.character.animate({
          top: '-=32'
        }, player.charSpeed, "linear", function() {
          if (player.currentKey == currentKeyCheck) player.move(direction);
          player.y = player.character.css("top");
        });
      }
      break;
    case 'left':
      if (player.character.position().left > 0) {
        player.character.animate({
          left: '-=32'
        }, player.charSpeed, "linear", function() {
          if (player.currentKey == currentKeyCheck) player.move(direction);
          player.x = player.character.css("left");
        });
      }
      break;
    case 'right':
      player.character.animate({
        left: '+=32'
      }, player.charSpeed, "linear", function() {
        if (player.currentKey == currentKeyCheck) player.move(direction);
        player.x = player.character.css("left");
      });
      break;
  }

  return window.socket.emit('updatePosition', player);
}

Player.prototype.step = function(direction, side, speed){
  var self = this;

  setTimeout(function() { 
    self.charStep++;
    if (self.charStep == 5) self.charStep = 1;

    self.character.attr('class', self.team + ' character');
    self.character.addClass(direction + side);
    
    var classList = self.character.attr("class");
    self.classList = classList;
    console.log(classList);

    self.y = self.character.css("top");
    self.x = self.character.css("left");
    window.socket.emit('updatePosition', self);
  }, speed);
}