function Ball(id, ownerId, $arena, x, y){
  this.id      = id;
  this.ownerId = ownerId;
  this.$arena  = $arena;
  this.x       = x;
  this.y       = y;
  this.materialize();
}

Ball.prototype = {

  materialize: function(){
    this.$arena.append('<div id="' + this.id + '" class="cannon-ball" style="left:' + this.x + 'px"></div>');
    this.$body = $('#' + this.id);
    this.$body.css('left', this.x + 'px');
    this.$body.css('top', this.y + 'px');
  },

  explode: function(){
    this.$arena.append('<div id="expl' + this.id + '" class="ball-explosion" style="left:' + this.x + 'px"></div>');
    var $expl = $('#expl' + this.id);
    $expl.css('left', this.x + 'px');
    $expl.css('top', this.y + 'px');
    setTimeout( function(){
      $expl.addClass('expand');
    }, 1);
    setTimeout( function(){
      $expl.remove();
    }, 1000);
  }

}