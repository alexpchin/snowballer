function Ball(id, x, y, direction, player) {
  this.id        = id;
  this.player    = player;
  this.x         = parseInt(x) + "px";
  this.y         = parseInt(y) + "px";
  this.direction = direction;
  this.$ball     = $("<div id='"+this.id+"' class='snowball'></div>");
  this.$stage    = $("#stage");

  this.$ball.css("left", x).css("top", y);
  this.$stage.append(this.$ball);
  this.animateBall();
}

Ball.prototype.animateBall = function(){
  var animation  = this.getDirection();
  var self = this;
  this.$ball.show().animate(animation, 400, "linear", function() {
    var bx = self.$ball.css("left");
    var by = self.$ball.css("top");

    Object.keys(_players).forEach(function(playerId) {
      var victim = _players[playerId];
      var px = victim.x;
      var py = victim.y;

      if (parseInt(bx) <= parseInt(px)+20 &&
          parseInt(bx) >= parseInt(px)-20 &&
          parseInt(by) <= parseInt(py)+20 &&
          parseInt(by) >= parseInt(py)-20) {
        self.splat(victim);        
        window.socket.emit('hit', {
          thrower: self.player,
          ballId: self.id,
          victim: victim
        });
      }
    });

    return self.disappear();
  });
}

Ball.prototype.splat = function(victim) {
  this.$ball
    .css("background-image", "url('/images/splat.png')") 
    .css("width", "14px")
    .css("height", "14px");
  delete _balls[this.id];
  return _players[this.player.id].hit(victim);
}

Ball.prototype.getDirection = function(){
  switch (this.direction) {
    case "front":
      return { top: "+=100" };
      break;
    case "back":
      return { top: "-=100" };
      break;
    case "left":
      return { 
        left: "-=100",
        top: "+=15" 
      };
      break;
    case "right":
      return { 
        left: "+=100",
        top: "+=15"
      };
      break;
  }
}

Ball.prototype.disappear = function(){
  var ball = this;
  return setTimeout(function(){
    ball.$ball.fadeOut("100", function(){
      ball.$ball.remove();
    });
  }, 1000);
}