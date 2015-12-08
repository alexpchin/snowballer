function Player(name, team, id, isLocal, x, y, classList){
  this.name      = name;
  this.id        = id;
  this.team      = team;
  this.character = $('<div id="' + this.id + '" alt="'+ this.name+ '" class="'+ this.team +' character front-stand"></div>');
  this.classList = classList || "hp100 character front-stand";
  this.currentKey;
  this.charStep;
  this.stage     = $('#stage');
  this.x         = x || Math.random()*this.stage.width()/2;
  this.y         = y || Math.random()*this.stage.height()/2;
  this.charStep  = 2; 
  this.charSpeed = 400;
  this.hp        = 100;
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
  var x = parseInt(this.x)+10 + "px";
  var y = parseInt(this.y)+10 + "px";
  var direction = this.getDirection(this.classList);
  var id = new Date().valueOf();
  var ball = new Ball(id, x, y, direction, this);
  return window.socket.emit('ballThrown', ball);
}

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
  if (keyCode == 38) direction = "back"; // keyCode -> english
  if (keyCode == 40) direction = "front"; // keyCode -> english
    
  this.charStep++;
  if (this.charStep == 5) this.charStep = 1; // There are 4 states for the sprite
  this.character.attr('class',  'hp' + this.hp + ' ' + this.team + ' character'); // reset the current class
  this.makeSteps(direction);
  this.makeMoves(direction);
}

Player.prototype.animatePlayer = function(animation, direction, currentKeyCheck){
  var player = this;
  this.character.animate(animation, this.charSpeed, "linear", function() {
    if (player.currentKey == currentKeyCheck) player.move(direction);
    player.x = player.character.css("left");
  });
}

Player.prototype.makeSteps = function(direction) {
  // Add the new class depending on the number of steps
  switch (this.charStep) {
    case 1:
      return this.walk(direction, '-stand', '-right', '-stand');
      break;
    case 2: 
      return this.walk(direction, '-right', '-stand', '-left');
      break;
    case 3: 
      return this.walk(direction, '-stand', '-left', '-stand');
      break;
    case 4: 
      return this.walk(direction, '-left', '-stand', '-right');
      break;
  }
}

Player.prototype.walk = function(d1, d2, d2, d4){
  this.character.addClass(d1+d2);
  this.step(d1, d2, (this.charSpeed/3));
  this.step(d1, d4, ((this.charSpeed/3)*2));
  return false;
}

Player.prototype.step = function(direction, side, speed){
  var self = this;

  setTimeout(function() { 
    self.charStep++;
    if (self.charStep == 5) self.charStep = 1;

    self.character.attr('class', 'hp' + self.hp + ' ' + self.team + ' character');
    self.character.addClass(direction + side);
    
    var classList = self.character.attr("class");
    self.classList = classList;

    self.y = self.character.css("top");
    self.x = self.character.css("left");
    window.socket.emit('updatePosition', self);
  }, speed);
}

Player.prototype.makeMoves = function(direction){
  // Actually move the character
  var player = this;
  var currentKeyCheck = this.currentKey;
  switch(direction) {
    case 'front':
      return player.animatePlayer({top: '+=32'}, direction, currentKeyCheck);
      break;
    case 'back':
      if (player.character.position().top > 0) {
        return player.animatePlayer({top: '-=32'}, direction, currentKeyCheck);
      }
      break;
    case 'left':
      if (player.character.position().left > 0) {
        return player.animatePlayer({left: '-=32'}, direction, currentKeyCheck);
      }
      break;
    case 'right':
      return player.animatePlayer({left: '+=32'}, direction, currentKeyCheck);
      break;
  }

  return window.socket.emit('updatePosition', player);
}

Player.prototype.hit = function(victim){
  console.log(this, victim)
  if (this.team !== victim.team) {
    $("#"+this.team).text(parseInt($("#"+this.team).text())+1);
  }
  this.character.removeClass('hp' + this.hp);
  this.hp -= 10;
  this.character.addClass('hp' + this.hp);
  if (this.hp === 0) { 
    return this.character.fadeOut("200", function(){
      $(this).remove();
    });
  }
}