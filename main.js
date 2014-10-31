var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var score = 0;
var highScore = 0;
var scoreText;
var endScore;
var playing;
var gameover;

var pspeed = 150;

function preload() {
	game.load.image('star', 'assets/beer.png');
	game.load.spritesheet('dude', 'assets/pedestrian2.png', 32, 48);
	game.load.spritesheet('baddie', 'assets/bike2.png', 40, 40);
	game.load.spritesheet('boarder', 'assets/boarder.png', 32, 40);
	game.load.spritesheet('walker', 'assets/walker.png', 32, 48);
}

function create() {
	//Start physics engine
	game.physics.startSystem(Phaser.Physics.ARCADE);

	playing = true;

	//Background
	game.stage.backgroundColor = '#CCFFFF';

	//Player
	player = game.add.sprite(32, game.world.height - 150, 'dude');
	game.physics.arcade.enable(player);
	player.body.collideWorldBounds = true;
	player.animations.add('left', [0,1,2,3], 5, true);
	player.animations.add('right', [5,6,7,8], 5, true);

	//Baddies
	baddies = game.add.group();
	baddies.enableBody = true;
	addBaddie();

	//Star
	star = game.add.sprite(512, 512, 'star');
	game.physics.arcade.enable(star);

	//Keyboard listener
	cursors = game.input.keyboard.createCursorKeys();
	keyboard = game.input.keyboard;

	//Score system
	scoreText = game.add.text(16, 16, 
		"Beers: " + score + '\nHigh Score: ' + highScore, 
		{fontSize: '32px', fill: '#000'});
}

function update() {
	//Player
	player.body.velocity.x = 0;
	player.body.velocity.y = 0;

	if (playing) {
		game.physics.arcade.overlap(player, star, collectStar);
		controlPlayer();
		baddies.forEachExists(moveBaddie, this);
		game.physics.arcade.overlap(player, baddies, gameOver);
	} else {
		baddies.forEachExists(stopBaddie, this);	
		if (keyboard.isDown(32)) {
			baddies.forEachExists(killBaddie, this);
			gameover.destroy(true);
			score = 0;
			collectStar(player, star);
			pspeed = 150;
			playing = true;
		}	
	}
	
}

function collectStar(player, star) {
		if (playing) {
			score += 1;
		}
		pspeed += 5;
		updateScore();

		star.x = Math.floor(Math.random() * 10000 % (game.world.width - 24));
		star.y = Math.floor(Math.random() * 10000 % (game.world.height - 22));

		addBaddie();		
}

function updateScore() {
	scoreText.text = 'Beers: ' + score + '\nHigh Score: ' + highScore;
}

function controlPlayer() {

	if (cursors.up.isDown) {
		player.body.velocity.y = -pspeed;
		player.animations.stop();
		player.frame = 4;
	} else if (cursors.down.isDown) {
		player.body.velocity.y = pspeed;
		player.animations.stop();
		player.frame = 4;
	} 

	if (cursors.left.isDown) {
		player.body.velocity.x = -pspeed;
		player.animations.play('left');
	} else if (cursors.right.isDown) {
		player.body.velocity.x = pspeed;
		player.animations.play('right');
	} else {
		player.animations.stop();
		player.frame = 4;
	}


}

function addBaddie() {
	var type = Math.floor(Math.random() * 10000 % 3);

	var x = Math.floor(Math.random() * 10000 % (game.world.width - 32));
	var y = Math.floor(Math.random() * 10000 % (game.world.height - 32));
	
	if (((player.x-16) < x && x < (player.x+48)) || 
		((player.y-16) < y && y < (player.y+68))) {
		addBaddie();
		return;	
	}	

	var speed;

	if (type == 0) {
		var baddie = baddies.create(x, y, 'baddie');	
		baddie.animations.add('left', [0,1], 10, true);
		baddie.animations.add('right', [2,3], 10, true);
		speed = 300;
	} else if (type == 1) {
		var baddie = baddies.create(x, y, 'boarder');	
		baddie.animations.add('left', [0,0,0,1,2], 5, true);
		baddie.animations.add('right', [5,5,5,4,3], 5, true);
		speed = 200;
	} else {
		var baddie = baddies.create(x, y, 'walker');	
		baddie.animations.add('left', [0,1,2,3], 5, true);
		baddie.animations.add('right', [5,6,7,8], 5, true);
		speed = 150;
	}

	switch (Math.floor(Math.random()*100000 % 4)) {
		case 0:
			baddie.body.velocity.x = speed;
			baddie.animations.play('right');
			break;
		case 1:
			baddie.body.velocity.x = -speed;
			baddie.animations.play('left');
			break;
		case 2:
			baddie.body.velocity.y = speed;
			baddie.frame = 0;
			break;
		case 3:
			baddie.body.velocity.y = -speed;
			baddie.frame = 0;
			break;
	}
}

function moveBaddie(baddie) {
	var origSpeed;
	var speed;
	var horiz = false;
	
	if (baddie.body.velocity.x != 0) {
		horiz = true;
		origSpeed = baddie.body.velocity.x;

	} else {
		horiz = false;
		origSpeed = baddie.body.velocity.y;
	}

	switch (origSpeed) {
		case 150: case -150:
			speed = 150;
			break;
		case 200: case -200:
			speed = 200;
			break;
		case 300: case -300:
			speed = 300;
			break;
	}

	if (horiz) {
		if(baddie.x > (game.world.width - 32)) {
			baddie.body.velocity.x = -speed;
			baddie.animations.play('left');	
		} else if (baddie.x < 0) {
			baddie.body.velocity.x = speed;
			baddie.animations.play('right');	
		}
	} else {
		if(baddie.y > (game.world.height - 32)) {
			baddie.body.velocity.y = -speed;
		} else if (baddie.y < 0) {
			baddie.body.velocity.y = speed;
		}
	}	
}

function gameOver(player, baddies) {
	playing = false;
	gameover = game.add.text(400, game.world.height - (32*3) - 16, 
		'GAME OVER\nYour Score: ' + score + '\nPress spacebar to play again', 
		{fontSize: '32px', fill: '#000', align: 'right'});
	if (score > highScore) {
		highScore = score;
		updateScore();
	}
	
}

function stopBaddie(baddie) {
	baddie.body.velocity.x = 0;
	baddie.body.velocity.y = 0;
	baddie.animations.stop();
}

function killBaddie(baddie) {
	baddie.kill();
}