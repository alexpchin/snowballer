var DEBUG = true;
var INTERVAL = 50;
var ROTATION_SPEED = 5;
var ARENA_MARGIN = 30;

// Called in client
function Game(arenaId, w, h, socket){
  this.tanks = []; // Tanks (other than the local tank)
  this.balls = [];
  this.width = w;  // Arena width
  this.height = h; // Arena height
  this.$arena = $(arenaId);
  this.$arena.css('width', w);
  this.$arena.css('height', h);
  this.socket = socket;

  var g = this;
  setInterval(function(){
    g.mainLoop();
  }, INTERVAL);
}

Game.prototype = {

  // Called from client.js
  addTank: function(id, type, isLocal, x, y, hp){
    var t = new Tank(id, type, this.$arena, this, isLocal, x, y, hp);
    if(isLocal){
      this.localTank = t;
    }else{
      this.tanks.push(t);
    }
  },

  removeTank: function(tankId){
    //Remove tank object
    this.tanks = this.tanks.filter( function(t){return t.id != tankId} );
    //remove tank from dom
    $('#' + tankId).remove();
    $('#info-' + tankId).remove();
  },

  killTank: function(tank){
    tank.dead = true;
    this.removeTank(tank.id);
    //place explosion
    this.$arena.append('<img id="expl' + tank.id + '" class="explosion" src="./img/explosion.gif">');
    $('#expl' + tank.id).css('left', (tank.x - 50)  + 'px');
    $('#expl' + tank.id).css('top', (tank.y - 100)  + 'px');

    setTimeout(function(){
      $('#expl' + tank.id).remove();
    }, 1000);

  },

  addBall: function(ball){
    this.balls.push(ball);
  },

  mainLoop: function(){
    if(this.localTank != undefined){
      this.sendData(); //send data to server about local tank 
    }
    
    if(this.localTank != undefined){
      //move local tank
      this.localTank.move();
    }
    
  },

  sendData: function(){
    //Send local data to server
    var gameData = {};
    
    //Send tank data
    var t = { 
      id: this.localTank.id,
      x: this.localTank.x,
      y: this.localTank.y,
      baseAngle: this.localTank.baseAngle,
      // cannonAngle: this.localTank.cannonAngle
    };
    gameData.tank = t;
    //Client game does not send any info about balls, 
    //the server controls that part 
    this.socket.emit('sync', gameData);
  },

  receiveData: function(serverData){
    var game = this;

    serverData.tanks.forEach( function(serverTank){

      //Update local tank stats
      if(game.localTank !== undefined && serverTank.id == game.localTank.id){
        game.localTank.hp = serverTank.hp;
        if(game.localTank.hp <= 0){
          game.killTank(game.localTank);
        }
      }

      //Update foreign tanks
      var found = false;
      game.tanks.forEach( function(clientTank){
        //update foreign tanks
        if(clientTank.id == serverTank.id){
          clientTank.x = serverTank.x;
          clientTank.y = serverTank.y;
          clientTank.baseAngle = serverTank.baseAngle;
          // clientTank.cannonAngle = serverTank.cannonAngle;
          clientTank.hp = serverTank.hp;
          if(clientTank.hp <= 0){
            game.killTank(clientTank);
          }
          clientTank.refresh();
          found = true;
        }
      });
      if(!found && 
        (game.localTank == undefined || serverTank.id != game.localTank.id)){ 
        //I need to create it
        game.addTank(serverTank.id, serverTank.type, false, serverTank.x, serverTank.y, serverTank.hp);
      }
    });

    //Render balls
    game.$arena.find('.cannon-ball').remove();
    
    serverData.balls.forEach( function(serverBall){
      var b = new Ball(serverBall.id, serverBall.ownerId, game.$arena, serverBall.x, serverBall.y); 
      b.exploding = serverBall.exploding;
      if(b.exploding){
        b.explode();
      }
    });
  }
}