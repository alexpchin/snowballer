function Player(name, id, isLocal){
  this.name = name;
  this.id = id;
  this.character = $('<div id="' + this.id + '" class="character"></div>');
  this.currentKey;
  this.charStep;
  this.charStep = 2; 
  this.charSpeed = 400;
  this.stage = $('#stage');
  this.init();
  if(isLocal) this.bindEvents();
}

Player.prototype.init = function(){
  this.stage.append(this.character);
  this.character.addClass('front-stand');
}

Player.prototype.bindEvents = function(){
  $(document).keydown(this.keydown.bind(this));
  $(document).keyup(this.keyup.bind(this));
}
  
Player.prototype.keydown = function(e){
  if (!this.currentKey && this.character.queue("fx").length == 0) {

    var direction;
    switch(e.keyCode) {
      case 38: 
        direction = 'up';    
        break;
      case 39: 
        direction = 'right';   
        break;
      case 40: 
        direction = 'down';
        break;
      case 37: 
        direction = 'left';
        break;
      default: 
        return;
    }

    if (direction) {
      this.move(direction, e.keyCode);
      window.socket.emit('playerMove', { id: this.id, direction: direction, keyCode: e.keyCode });
    }
  }
}

// Prevent movement if player is:
// - pushing other buttons
// - only stop the walk if the key that started the walk is released
Player.prototype.keyup = function(){
  // if (e.keyCode == this.currentKey) {
    window.socket.emit('playerStop', this.id);
    this.stop();
  // }
}

Player.prototype.stop = function(){
  console.log(this);
  console.log(this.currentKey);
  return this.currentKey = false;
}
  
Player.prototype.move = function(direction, keyCode) {
  // a player could switch key mid-animation
  // records the key that was down when animation started
  this.currentKey = keyCode;
  var currentKeyCheck = this.currentKey;
    
  // adjust from lang to code
  if (direction == 'up') direction = 'back';
  if (direction == 'down') direction = 'front';
    
  this.charStep++;
  if (this.charStep == 5) this.charStep = 1;
    
  // remove the current class
  this.character.attr('class', 'character');
    
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
  
  var player = this;
  // move the character
  switch(direction) {
    case 'front':
      player.character.animate({
        top: '+=32'
      }, player.charSpeed, "linear", function() {
        if (player.currentKey == currentKeyCheck) player.move(direction);
      });
      break;
    case 'back':
      if (player.character.position().top > 0) {
        player.character.animate({
          top: '-=32'
        }, player.charSpeed, "linear", function() {
          if (player.currentKey == currentKeyCheck) player.move(direction);
        });
      }
      break;
    case 'left':
      if (player.character.position().left > 0) {
        player.character.animate({
          left: '-=32'
        }, player.charSpeed, "linear", function() {
          if (player.currentKey == currentKeyCheck) player.move(direction);
        });
      }
      break;
    case 'right':
      player.character.animate({
        left: '+=32'
      }, player.charSpeed, "linear", function() {
        if (player.currentKey == currentKeyCheck) player.move(direction);
      });
      break;
  }
}

Player.prototype.step = function(direction, side, speed){
  var self = this;
  setTimeout(function() { 
    self.charStep++;
    if (self.charStep == 5) self.charStep = 1;

    self.character.attr('class', 'character');
    self.character.addClass(direction + side);
  }, speed);
}