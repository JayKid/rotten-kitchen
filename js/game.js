var viewport = {
  width: 800,
  height: 600
};
var CHARACTER_SPRITE_WIDTH = 455;
var CHARACTER_SPRITE_FRAMES_NUMBER = 4;
var CHARACTER_SPRITE_FRAME_WIDTH = CHARACTER_SPRITE_WIDTH/CHARACTER_SPRITE_FRAMES_NUMBER;
var CHARACTER_SPRITE_FRAME_HEIGHT = 689;

var PLATFORM_SPRITE_WIDTH = 652;
var PLATFORM_SPRITE_HEIGHT = 232;

var DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right'
};

var ANIMATION_STATES = {
  STAND: 'stand'
};

var game = new Phaser.Game(viewport.width, viewport.height, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, render: render, update: update });
function preload() {

    game.load.spritesheet('player', 'assets/player.png', CHARACTER_SPRITE_WIDTH, CHARACTER_SPRITE_FRAME_HEIGHT, CHARACTER_SPRITE_FRAMES_NUMBER);
    game.load.image('platform', 'assets/platform.png');

    game.load.audio('catch', ['assets/audio/catch.mp3']);
}


var player;
var basket;
var animationState = ANIMATION_STATES.STAND;
var objects = [];
var facing = DIRECTIONS.RIGHT;
var cursors;
var bg;


function create() {

    game.world.setBounds(0, 0, this.game.width, viewport.height);
    game.stage.backgroundColor = '#ffb37d';

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Set the world (global) gravity
    game.physics.arcade.gravity.y = 1000;

    player = game.add.sprite(200, viewport.height - CHARACTER_SPRITE_FRAME_HEIGHT/10, 'player');
    player.animations.add('jump-left', [0]);
    player.animations.add('jump-right', [3]);
    player.animations.add('stand-left', [1]);
    player.animations.add('stand-right', [2]);

    basket = game.add.sprite(200+((CHARACTER_SPRITE_WIDTH/CHARACTER_SPRITE_FRAMES_NUMBER)/10)*4, viewport.height - CHARACTER_SPRITE_FRAME_HEIGHT/10, 'player');
    basket.animations.add('jump-left', [0]);
    basket.animations.add('jump-right', [3]);
    basket.animations.add('stand-left', [1]);
    basket.animations.add('stand-right', [2]);
    
    game.physics.enable( [ player,basket ], Phaser.Physics.ARCADE);

    player.body.checkCollision.up = true;
    player.body.checkCollision.down = false;
    player.body.checkCollision.left = true;
    player.body.checkCollision.right = true;
    player.body.mass = 1;
    player.body.collideWorldBounds = true;


    basket.body.checkCollision.up = true;
    basket.body.checkCollision.down = false;
    basket.body.checkCollision.left = false;
    basket.body.checkCollision.right = false;
    basket.body.mass = 1;
    basket.body.collideWorldBounds = true;

    basket.alpha = 0.2;

    basket.body.onCollide = new Phaser.Signal();
    basket.body.onCollide.add(function(basket, object) {
      var music;
      music = game.add.audio('catch');
      music.play();

      console.log(object);
      object.destroy();
    }, this);
    
    // Set hitbox to a little bit less than the height so it looks like he's in contact with the platform
    basket.body.setSize(CHARACTER_SPRITE_FRAME_WIDTH,CHARACTER_SPRITE_FRAME_HEIGHT-70);
    
    basket.scale.setTo(0.1,0.1);

    // Set hitbox to a little bit less than the height so it looks like he's in contact with the platform
    player.body.setSize(CHARACTER_SPRITE_FRAME_WIDTH,CHARACTER_SPRITE_FRAME_HEIGHT-70);
    
    player.scale.setTo(0.1,0.1);

    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();
    var self = this;
    var createObjectAction = function () {
        var position = {
           x: Math.random()*viewport.width,
           y: 0
        };;
        var object = game.add.sprite(position.x, position.y, 'player');
        game.physics.enable( [ object ], Phaser.Physics.ARCADE);
        object.body.checkCollision.up = false;
        object.body.checkCollision.down = true;
        object.body.checkCollision.left = true;
        object.body.checkCollision.right = true;
        object.body.allowGravity = true;
        object.body.immovable = false;
        object.body.outOfBoundsKill = true;
        object.scale.setTo(0.1, 0.1);
        objects.push(object);
        window.setTimeout(createObjectAction, 2000);
    };
    window.setTimeout(createObjectAction, 2000);
}

function update() {

  objects.forEach(function(object){
    game.physics.arcade.collide(basket, object);
  });

  player.body.velocity.x = 0;
  basket.body.velocity.x = 0;

  console.log(player.position.x,player.position.y);
  console.log(player.position.x > (((CHARACTER_SPRITE_FRAME_WIDTH/CHARACTER_SPRITE_FRAMES_NUMBER)/4)/10),
    player.position.x < viewport.width - (((CHARACTER_SPRITE_FRAME_WIDTH/CHARACTER_SPRITE_FRAMES_NUMBER)/4)/10));

  if ( player.position.x > (((CHARACTER_SPRITE_FRAME_WIDTH/CHARACTER_SPRITE_FRAMES_NUMBER)/4)/10) &&
    player.position.x < viewport.width - (((CHARACTER_SPRITE_FRAME_WIDTH/CHARACTER_SPRITE_FRAMES_NUMBER)/4)/10) ) {

  /*if ( player.position.x > 60 && player.position.x < 120 &&
    player.position.x < viewport.width - 60 && player.position.x > viewport.width - 120 ) {*/

      if (cursors.left.isDown)
      {
          player.body.velocity.x = -300;
          basket.body.velocity.x = -300;

          if (facing != DIRECTIONS.LEFT)
          {
              facing = DIRECTIONS.LEFT;
              var playerPosition = player.position;
              var basketPosition = basket.position;
              player.position = basketPosition;
              basket.position = playerPosition;
          }
      }
      else if (cursors.right.isDown)
      {
          player.body.velocity.x = 300;
          basket.body.velocity.x = 300;

          if (facing != DIRECTIONS.RIGHT)
          {
              facing = DIRECTIONS.RIGHT;
              var playerPosition = player.position;
              var basketPosition = basket.position;
              player.position = basketPosition;
              basket.position = playerPosition;
          }
      }
  }
  
  renderAnimationState();

  game.world.wrap(player,0,false,true,false);
  game.world.wrap(basket,0,false,true,false);

}

function getRandomPosition() {
  return {
      x: Math.random()*viewport.width,
      y: Math.random()*viewport.height
    };
}

function renderAnimationState() {
  player.animations.play(animationState + '-' + facing);
  basket.animations.play(animationState + '-' + facing);
}

function render() {
  game.debug.cameraInfo(game.camera, 32, 32);
  game.debug.spriteCoords(player, 32, 500);
}