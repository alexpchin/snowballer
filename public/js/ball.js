function Ball(x, y, direction) {
  this.x         = parseInt(x)+10 + "px";
  this.y         = parseInt(y)+10 + "px";
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
  var ball = this;

  this.$ball.show().animate(animation, 600, "linear", function() {
    var ballx = $(this).css("left");
    var bally = $(this).css("top");

    Object.keys(_players).forEach(function(id) {
      var x = _players[id].x;
      var y = _players[id].y;

      if (parseInt(ballx) <= parseInt(x)+15 &&
          parseInt(ballx) >= parseInt(x)-15 &&
          parseInt(bally) <= parseInt(y)+15 &&
          parseInt(bally) >= parseInt(y)-15) {
        return $(this)
          .css("background-image", "url('/images/splat.png')")
          .css("width", "14px")
          .css("height", "14px");
          console.log("HIT");
      }
    });

    return $(this).fadeOut("200");
  });
}