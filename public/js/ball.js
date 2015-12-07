function Ball(x, y, direction) {
  this.x         = parseInt(x) + "px";
  this.y         = parseInt(y) + "px";
  this.direction = direction;
  this.$ball     = $("<div class='snowball'></div>");
  this.$stage    = $("#stage");
  
  var animation;
  switch (this.direction) {
    case "front":
      animation = { top: "+=100" };
      break;
    case "back":
      animation = { top: "-=100" };
      break;
    case "left":
      animation = { left: "-=100" };
      break;
    case "right":
      animation = { left: "+=100" };
      break;
  }

  this.$ball.css("left", x).css("top", y);
  this.$stage.append(this.$ball);

  this.$ball.show().animate(animation, 600, "linear", function() {
    var ballx = $(this).css("left");
    var bally = $(this).css("top");
    var ball = this;

    Object.keys(_players).forEach(function(id) {
      var x = _players[id].x;
      var y = _players[id].y;

      if (parseInt(ballx) <= parseInt(x)+15 &&
          parseInt(ballx) >= parseInt(x)-15 &&
          parseInt(bally) <= parseInt(y)+15 &&
          parseInt(bally) >= parseInt(y)-15) {
        $(ball)
          .css("background-image", "url('/images/splat.png')") 
          .css("width", "14px")
          .css("height", "14px");

        _players[id].hp -= 10;
        if (_players[id].hp === 0) {
          _players[id].character.fadeOut("200", function(){
            $(ball).remove();
          });
        }
      }
    });

    setTimeout(function(){
      $(ball).fadeOut("200", function(){
        $(ball).remove();
      });
    }, 1000);
  });
}