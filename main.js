var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var score = 0;
var highScore = 0;
var scoreText;
var playing;
var gameoverText;
var pspeed = 150;

function preload() {
	game.load.image('beer', 'assets/beer.png');
	game.load.spritesheet('dude', 'assets/pedestrian.png', 32, 48);
	game.load.spritesheet('bike', 'assets/bike2.png', 40, 40);
	game.load.spritesheet('boarder', 'assets/boarder.png', 32, 40);
	game.load.spritesheet('walker', 'assets/walker.png', 32, 48);
}

function create() {
	//Start physics engine
	game.physics.startSystem(Phaser.Physics.ARCADE);

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

	//Beer
	beer = game.add.sprite(512, 512, 'beer');
	game.physics.arcade.enable(beer);

	//Keyboard listener
	cursors = game.input.keyboard.createCursorKeys();
	keyboard = game.input.keyboard;

	//Score system
	scoreText = game.add.text(16, 16, 
		"Beers: " + score + '\nHigh Score: ' + highScore, 
		{fontSize: '32px', fill: '#000'});

	//Playing state
	playing = true;

}

function update() {
	player.body.velocity.x = 0;
	player.body.velocity.y = 0;

	if (playing) {
		game.physics.arcade.overlap(player, beer, collectBeer);
		controlPlayer();
		baddies.forEachExists(moveBaddie, this);
		game.physics.arcade.overlap(player, baddies, gameOver);
	} else {
		baddies.forEachExists(stopBaddie, this);
		player.animations.stop();
		player.frame = 9;
		if (keyboard.isDown(32)) {
			baddies.forEachExists(killBaddie, this);
			gameoverText.destroy(true);
			score = 0;
			pspeed = 150;
			collectBeer(player, beer);
			playing = true;
		}	
	}
	
}

function collectBeer(player, beer) {
	if (playing) {
		score += 1;
		pspeed += 5;
	}

	updateScore();

	beer.x = Math.floor(Math.random() * 10000 % (game.world.width - 22));
	beer.y = Math.floor(Math.random() * 10000 % (game.world.height - 28));

	addBaddie();		
}

function updateScore() {
	scoreText.text = 'Beers: ' + score + '\nHigh Score: ' + highScore;
}

function controlPlayer() {
	if (cursors.left.isDown) {
		player.body.velocity.x = -pspeed;
		player.animations.play('left');
	} else if (cursors.right.isDown) {
		player.body.velocity.x = pspeed;
		player.animations.play('right');
	} 

	if (cursors.up.isDown) {
		player.body.velocity.y = -pspeed;
	} else if (cursors.down.isDown) {
		player.body.velocity.y = pspeed;
	} 


	if (!cursors.up.isDown && !cursors.down.isDown
		&& !cursors.left.isDown && !cursors.right.isDown) {
		player.animations.stop();
		player.frame = 4;	
	}
}

function addBaddie() {
	var type = Math.floor(Math.random() * 10000 % 3);

	var x = Math.floor(Math.random() * 10000 % (game.world.width - 40));
	var y = Math.floor(Math.random() * 10000 % (game.world.height - 48));
	
	if (((player.x-16) < x && x < (player.x+48)) || 
		((player.y-16) < y && y < (player.y+68))) {
		addBaddie();
		return;	
	}	

	var speed;

	if (type == 0) {
		var baddie = baddies.create(x, y, 'bike');	
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
			baddie.animations.play('right');
			break;
		case 3:
			baddie.body.velocity.y = -speed;
			baddie.animations.play('left');
			break;
	}
}

function moveBaddie(baddie) {
	var origSpeed;
	var speed;
	var horiz = false;
	var xsize;
	var ysize;
	
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
			xsize = 32;
			ysize = 48;
			break;
		case 200: case -200:
			speed = 200;
			xsize = 32;
			ysize = 40;
			break;
		case 300: case -300:
			speed = 300;
			xsize = 40;
			ysize = 40;
			break;
	}

	if (horiz) {
		if(baddie.x > (game.world.width - xsize)) {
			baddie.body.velocity.x = -speed;
			baddie.animations.play('left');	
		} else if (baddie.x < 0) {
			baddie.body.velocity.x = speed;
			baddie.animations.play('right');	
		}
	} else {
		if(baddie.y > (game.world.height - ysize)) {
			baddie.body.velocity.y = -speed;
			baddie.animations.play('left');
		} else if (baddie.y < 0) {
			baddie.body.velocity.y = speed;
			baddie.animations.play('right');
		}
	}	
}

function gameOver(player, baddies) {
	playing = false;
	gameoverText = game.add.text(400, game.world.height - (32*3) - 16, 
		'OUCH!\nYour Score: ' + score + '\nPress spacebar to play again', 
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