function Tank(id, type, $arena, game, isLocal, x, y, hp){
	this.id = id;
	this.type = type;
	this.speed = 5;
	this.$arena = $arena;
	this.w = 60;
	this.h = 80;
	this.baseAngle = getRandomInt(0, 360); // Initial angle
	this.baseAngle -= (this.baseAngle % ROTATION_SPEED); 	// Make multiple of rotation amount
	// this.cannonAngle = 0;
	this.x = x;
	this.y = y;
	this.dir = [0, 0];
	this.game = game;
	this.isLocal = isLocal;
	this.hp = hp;
	this.dead = false;

	this.materialize();
}

Tank.prototype = {
	
	materialize: function(){
		this.$arena.append('<div id="' + this.id + '" class="tank tank' + this.type + '"></div>');
		this.$body = $('#' + this.id);
		this.$body.css('width', this.w);
		this.$body.css('height', this.h);

		this.$body.css('-webkit-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('-moz-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('-o-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('transform', 'rotateZ(' + this.baseAngle + 'deg)');

		// this.$body.append('<div id="cannon-' + this.id + '" class="tank-cannon"></div>');
		// this.$cannon = $('#cannon-' + this.id);
		
		this.$arena.append('<div id="info-' + this.id + '" class="info"></div>');
		this.$info = $('#info-' + this.id);
		this.$info.append('<div class="label">' + this.id + '</div>');
		this.$info.append('<div class="hp-bar"></div>');
		
		this.refresh();

		if(this.isLocal){
			this.setControls();
		}
	},

	isMoving: function(){
		if(this.dir[0] != 0 || this.dir[1] != 0){
			return true;
		}
		return false;
	},

	refresh: function(){
		this.$body.css('left', this.x - 30 + 'px');
		this.$body.css('top', this.y - 40 + 'px');
		this.$body.css('-webkit-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('-moz-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('-o-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('transform', 'rotateZ(' + this.baseAngle + 'deg)');

		// var cannonAbsAngle = this.cannonAngle - this.baseAngle;
		// this.cannonAngule = this.baseAngle;

		// this.$cannon.css('-webkit-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		// this.$cannon.css('-moz-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		// this.$cannon.css('-o-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		// this.$cannon.css('transform', 'rotateZ(' + this.baseAngle + 'deg)');

		this.$info.css('left', (this.x) + 'px');
		this.$info.css('top', (this.y) + 'px');
		
		if(this.isMoving()){
			this.$info.addClass('fade');
		}else{
			this.$info.removeClass('fade');
		}

		this.$info.find('.hp-bar').css('width', this.hp + 'px');
		this.$info.find('.hp-bar').css('background-color', getGreenToRed(this.hp));
	},

	setControls: function(){
		var t = this;

		/* Detect both keypress and keyup to allow multiple keys
		 and combined directions */
		$(document).on("keydown", function(e){
			var k = e.keyCode || e.which;

			switch(k){
				case 38: // up
					t.dir[1] = -1;
					break;
				case 39: // right
					// t.dir[0] = 1;
					t.increaseBaseRotation();
					break;
				case 40: // down
					t.dir[1] = 1;
					break;
				case 37: // left
					t.decreaseBaseRotation();
					// t.dir[0] = -1;
					break;
			}
			
		}).on("keyup", function(e){
			var k = e.keyCode || e.which;
			console.log(k);
			switch(k){
				case 38: // up
					t.dir[1] = 0;
					break;
				case 39: // right
					t.dir[0] = 0;
					break;
				case 40: // down
					t.dir[1] = 0;
					break;
				case 37: // left
					t.dir[0] = 0;
					break;
				case 32: // space
					t.shoot();
					break
			}
		});

	},

	move: function(){
		if(this.dead){
			return;
		}

		var moveX = this.speed * this.dir[0];
		var moveY = this.speed * this.dir[1];

		if (this.x + moveX > (0 + ARENA_MARGIN) && (this.x + moveX) < (this.$arena.width() - ARENA_MARGIN)){
			this.x += moveX;
		}
		if (this.y + moveY > (0 + ARENA_MARGIN) && (this.y + moveY) < (this.$arena.height() - ARENA_MARGIN)){
			this.y += moveY;
		}

		this.rotateBase();
		this.refresh();
	},

	/* Rotate base of tank to match movement direction */
	rotateBase: function(){
		if((this.dir[0] == 1 && this.dir[1] == 1) 
			|| (this.dir[0] == -1 && this.dir[1] == -1)){ //diagonal "left"
			this.setDiagonalLeft();
		}else if((this.dir[0] == 1 && this.dir[1] == -1) 
			|| (this.dir[0] == -1 && this.dir[1] == 1)){ //diagonal "right"
			this.setDiagonalRight();
		}else if(this.dir[1] == 1 || this.dir[1] == -1){ //vertical
			this.setVertical();
		}else if(this.dir[0] == 1 || this.dir[0] == -1){  //horizontal
			this.setHorizontal();
		}

	},

	/* Rotate base until it is vertical */
	setVertical: function(){
		var a = this.baseAngle;
		if(a != 0 && a != 180){
			if(a < 90 || (a > 180 && a < 270)){
				this.decreaseBaseRotation();
			}else{
				this.increaseBaseRotation();
			}
		}
	},

	/* Rotate base until it is horizontal */
	setHorizontal: function(){
		var a = this.baseAngle;
		if(a != 90 && a != 270){
			if(a < 90 || (a > 180 && a < 270)){
				this.increaseBaseRotation();
			}else{
				this.decreaseBaseRotation();
			}
		}
	},

	setDiagonalLeft: function(){
		var a = this.baseAngle;
		if(a != 135 && a != 315){
			if(a < 135 || (a > 225 && a < 315)){
				this.increaseBaseRotation();
			}else{
				this.decreaseBaseRotation();
			}
		}
	},

	setDiagonalRight: function(){
		var a = this.baseAngle;
		if(a != 45 && a != 225){
			if(a < 45 || (a > 135 && a < 225)){
				this.increaseBaseRotation();
			}else{
				this.decreaseBaseRotation();
			}
		}
	},

	increaseBaseRotation: function(){
		this.baseAngle += ROTATION_SPEED;
		if(this.baseAngle >= 360){
			this.baseAngle = 0;
		}
	},

	decreaseBaseRotation: function(){
		this.baseAngle -= ROTATION_SPEED;
		if(this.baseAngle < 0){
			this.baseAngle = 0;
		}
	},

	// setCannonAngle: function(mx, my){
	// 	var tank = { x: this.x , y: this.y};
	// 	var mouse = { x: mx, y: my};
	// 	var deltaX = mouse.x - tank.x;
	// 	var deltaY = mouse.y - tank.y;
	// 	this.cannonAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
	// 	this.cannonAngle += 90;
	// },

	shoot: function(){
		if (this.dead) return;

		//Emit ball to server
		var serverBall = {};
		//Just for local balls who have owner
		serverBall.alpha = this.baseAngle * Math.PI / 180; //angle of shot in radians	
		//Set init position
		var cannonLength = 60;
		var deltaX = cannonLength * Math.sin(serverBall.alpha);
		var deltaY = cannonLength * Math.cos(serverBall.alpha);
		
		serverBall.ownerId = this.id;
		serverBall.x = this.x + deltaX - 5;
		serverBall.y = this.y - deltaY - 5;	

		this.game.socket.emit('shoot', serverBall);
	}

}