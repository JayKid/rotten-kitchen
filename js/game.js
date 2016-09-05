var viewport = {
  width: 800,
  height: 600
};
var CHARACTER_SPRITE_WIDTH = 455;
var CHARACTER_SPRITE_FRAMES_NUMBER = 4;
var CHARACTER_SPRITE_FRAME_WIDTH = CHARACTER_SPRITE_WIDTH/CHARACTER_SPRITE_FRAMES_NUMBER;
var CHARACTER_SPRITE_FRAME_HEIGHT = 689;

var DISTANCE_BETWEEN_BASKET_AND_PLAYER = 40;

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
    game.load.image('burger', 'assets/burger.png');

    game.load.audio('catch', ['assets/audio/catch.mp3']);
}


var player;
var basket;
var bird;
var secondBird;
var birdMoveCounter;
var secondBirdMoveCounter;
var secondBirdMultiplier;
var spawnBird = true;
var multiplier;
var animationState = ANIMATION_STATES.STAND;
var objects = [];
var facing = DIRECTIONS.RIGHT;
var cursors;
var bg;
var scoreCounter;
var scoreContainer;
var DEBUG = false;

function create() {

    // Set Debug mode On
    DEBUG = true;

    game.world.setBounds(0, 0, this.game.width, viewport.height);
    game.stage.backgroundColor = '#ffb37d';

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Set the world (global) gravity
    game.physics.arcade.gravity.y = 1000;

    bird = game.add.sprite(viewport.width * 0.75, 0, 'player');
    bird.animations.add('jump-left', [0]);
    bird.animations.add('jump-right', [3]);
    bird.animations.add('stand-left', [1]);
    bird.animations.add('stand-right', [2]);

    secondBird = game.add.sprite(viewport.width * 0.25, 0, 'player');
    secondBird.animations.add('jump-left', [0]);
    secondBird.animations.add('jump-right', [3]);
    secondBird.animations.add('stand-left', [1]);
    secondBird.animations.add('stand-right', [2]);

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

    birdMoveCounter = 0;
    secondBirdMoveCounter = 0;
    multiplier = -1;
    secondBirdMultiplier = 1;
    scoreCounter = 0;
    scoreContainer = game.add.text(viewport.width - 200, 16, 'SC0R3: '+scoreCounter, { fontSize: '32px', fill: '#000' });
    
    game.physics.enable( [ player,basket, bird, secondBird ], Phaser.Physics.ARCADE);

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

    bird.body.checkCollision.up = false;
    bird.body.checkCollision.down = false;
    bird.body.checkCollision.left = false;
    bird.body.checkCollision.right = false;
    bird.body.mass = 1;
    bird.body.collideWorldBounds = true;
    bird.body.allowGravity = false;

    secondBird.body.checkCollision.up = false;
    secondBird.body.checkCollision.down = false;
    secondBird.body.checkCollision.left = false;
    secondBird.body.checkCollision.right = false;
    secondBird.body.mass = 1;
    secondBird.body.collideWorldBounds = true;
    secondBird.body.allowGravity = false;

    basket.body.onCollide = new Phaser.Signal();
    basket.body.onCollide.add(function(basket, object) {
      var music;
      music = game.add.audio('catch');
      music.play();

      scoreCounter = scoreCounter + 1;
      scoreContainer.text = 'SC0R3: ' + scoreCounter;
      
      object.destroy();
    }, this);
    
    // Set hitbox to a little bit less than the height so it looks like he's in contact with the platform
    basket.body.setSize(CHARACTER_SPRITE_FRAME_WIDTH,CHARACTER_SPRITE_FRAME_HEIGHT-70);
    
    basket.scale.setTo(0.1,0.1);

    bird.scale.setTo(0.1,0.1);
    secondBird.scale.setTo(0.1,0.1);

    // Set hitbox to a little bit less than the height so it looks like he's in contact with the platform
    player.body.setSize(CHARACTER_SPRITE_FRAME_WIDTH,CHARACTER_SPRITE_FRAME_HEIGHT-70);
    
    player.scale.setTo(0.1,0.1);

    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();

    var createRandomObjectInPosition = function (position) {
        var object = game.add.sprite(position.x, position.y, 'burger');
        game.physics.enable( [ object ], Phaser.Physics.ARCADE);
        object.body.checkCollision.up = false;
        object.body.checkCollision.down = true;
        object.body.checkCollision.left = true;
        object.body.checkCollision.right = true;
        object.body.allowGravity = true;
        object.body.immovable = false;
        object.body.outOfBoundsKill = true;
        object.scale.setTo(0.5, 0.5);
        objects.push(object);
    };

    var createObjectActionBirdTwo = function () {
        var position = {
           x: secondBird.body.position.x,
           y: 50
        };
        
        createRandomObjectInPosition(position);
        window.setTimeout(createObjectActionBirdTwo, 2000);
    };

    var createObjectAction = function () {
        var position = {
           x: bird.body.position.x,
           y: 50
        };

        if (spawnBird) {
          spawnBird = false;
          window.setTimeout(createObjectActionBirdTwo, 1000);
        }

        createRandomObjectInPosition(position);
        window.setTimeout(createObjectAction, 2000);
    };
    window.setTimeout(createObjectAction, 2000);
}

function debug(message) {
  if (DEBUG) {
    console.log(message);
  }
}

function moveBirds () {
  var NUMBER_OF_TURNS = 140;
  bird.body.position.x = bird.body.position.x + (multiplier * Math.random()*viewport.width*0.015);

  if (birdMoveCounter % NUMBER_OF_TURNS === 0) {
    birdMoveCounter = 0;
    multiplier = multiplier * -1;
  }

  var changeDirectionChance = Math.random();
  if (changeDirectionChance >= 0 && changeDirectionChance < 0.035) {
    multiplier = multiplier * -1;
    debug("Change to " + multiplier);
  }

  ++birdMoveCounter;

  secondBird.body.position.x = secondBird.body.position.x + (multiplier * Math.random()*viewport.width*0.01);

  if (secondBirdMoveCounter % NUMBER_OF_TURNS === 0) {
    secondBirdMoveCounter = 0;
    secondBirdMultiplier = secondBirdMultiplier * -1;
  }

  var changeDirectionChance = Math.random();
  if (changeDirectionChance >= 0 && changeDirectionChance < 0.02) {
    secondBirdMultiplier = secondBirdMultiplier * -1;
    debug("Change to " + secondBirdMultiplier);
  }

  ++secondBirdMoveCounter;
}

function update() {

  objects.forEach(function(object){
    game.physics.arcade.collide(basket, object);
  });

  player.body.velocity.x = 0;

  moveBirds();

  if (cursors.left.isDown)
  {
      player.body.velocity.x = -300;

      if (facing != DIRECTIONS.LEFT)
      {
          facing = DIRECTIONS.LEFT;
      }
  }
  else if (cursors.right.isDown)
  {
      player.body.velocity.x = 300;

      if (facing != DIRECTIONS.RIGHT)
      {
          facing = DIRECTIONS.RIGHT;
      }
  }

  if (facing === DIRECTIONS.RIGHT) {
    basket.position.x = player.position.x + DISTANCE_BETWEEN_BASKET_AND_PLAYER;
  }
  else {
    basket.position.x = player.position.x - DISTANCE_BETWEEN_BASKET_AND_PLAYER;
  }
  
  renderAnimationState();
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