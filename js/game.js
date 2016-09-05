var viewport = {
  width: 800,
  height: 600
};
var CHARACTER_SPRITE_WIDTH = 117;
var CHARACTER_SPRITE_FRAMES_NUMBER = 2;
var CHARACTER_SPRITE_FRAME_WIDTH = CHARACTER_SPRITE_WIDTH/CHARACTER_SPRITE_FRAMES_NUMBER;
var CHARACTER_SPRITE_FRAME_HEIGHT = 108;

var BIRD_SPRITE_WIDTH = 504;
var BIRD_SPRITE_FRAMES_NUMBER = 4;
var BIRD_SPRITE_FRAME_WIDTH = BIRD_SPRITE_WIDTH/BIRD_SPRITE_FRAMES_NUMBER;
var BIRD_SPRITE_FRAME_HEIGHT = 64;

var BASKET_SPRITE_WIDTH = 138;
var BASKET_SPRITE_HEIGHT = 129;

var DISTANCE_BETWEEN_BASKET_AND_PLAYER = 50;

var DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right'
};

var ANIMATION_STATES = {
  STAND: 'stand'
};

var game = new Phaser.Game(viewport.width, viewport.height, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, render: render, update: update });

function preload() {

    game.load.spritesheet('player', 'assets/fucker.png', CHARACTER_SPRITE_FRAME_WIDTH, CHARACTER_SPRITE_FRAME_HEIGHT, CHARACTER_SPRITE_FRAMES_NUMBER);
    game.load.spritesheet('bird', 'assets/bird.png', BIRD_SPRITE_FRAME_WIDTH, BIRD_SPRITE_FRAME_HEIGHT, BIRD_SPRITE_FRAMES_NUMBER);
    game.load.image('basket', 'assets/basket.png');
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
    game.stage.backgroundColor = '#7546bb';

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Set the world (global) gravity
    game.physics.arcade.gravity.y = 1000;

    bird = game.add.sprite(viewport.width * 0.75, 0, 'bird');
    bird.animations.add('left-open', [0]);
    bird.animations.add('right-open', [1]);
    bird.animations.add('left-closed', [2]);
    bird.animations.add('right-closed', [3]);

    secondBird = game.add.sprite(viewport.width * 0.25, 0, 'bird');
    secondBird.animations.add('left-open', [0]);
    secondBird.animations.add('right-open', [1]);
    secondBird.animations.add('left-closed', [2]);
    secondBird.animations.add('right-closed', [3]);

    player = game.add.sprite(viewport.width * 0.25, viewport.height - CHARACTER_SPRITE_FRAME_HEIGHT, 'player');
    player.animations.add('stand-left', [0]);
    player.animations.add('stand-right', [1]);

    basket = game.add.sprite(200+CHARACTER_SPRITE_FRAME_WIDTH, viewport.height, 'basket');

    birdMoveCounter = 0;
    secondBirdMoveCounter = 0;
    multiplier = -1;
    secondBirdMultiplier = 1;
    scoreCounter = 0;
    scoreContainer = game.add.text(viewport.width - 200, 16, 'SC0R3: '+scoreCounter, { fontSize: '32px', fill: '#000' });
    
    game.physics.enable( [ player,basket, bird, secondBird ], Phaser.Physics.ARCADE);

    player.body.checkCollision.up = false;
    player.body.checkCollision.down = false;
    player.body.checkCollision.left = false;
    player.body.checkCollision.right = false;
    player.body.mass = 1;
    player.body.collideWorldBounds = true;

    basket.body.checkCollision.up = true;
    basket.body.checkCollision.down = false;
    basket.body.checkCollision.left = false;
    basket.body.checkCollision.right = false;
    basket.body.mass = 1;
    basket.body.collideWorldBounds = true;

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
    
    basket.scale.setTo(0.4,0.4);

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
  if (multiplier > 0) {
    bird.animations.play('right-closed');
  } else {
    bird.animations.play('left-closed');
  }
  if (secondBirdMultiplier > 0) {
    secondBird.animations.play('right-closed');
  } else {
    secondBird.animations.play('left-closed');
  }
}

function render() {
  game.debug.cameraInfo(game.camera, 32, 32);
  game.debug.spriteCoords(player, 32, 500);
}