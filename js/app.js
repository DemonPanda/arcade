// Sets all variables necessary to create enemies
var Enemy = function (y) {
  this.initialPosition = -100;
  this.maxX = 600;
  this.y = y;
  this.minSpeed = 100;
  this.maxSpeed = 300;
  this.speed = this.calculateSpeed();
  this.sprite = 'images/enemy-bug.png';
  this.getInitialPosition();
};

// Sets the enemy's initial coordinates
Enemy.prototype.getInitialPosition = function () {
  this.x = this.initialPosition;
  this.y = this.y;
}

//Sets speed
Enemy.prototype.calculateSpeed = function (minSpeed, maxSpeed) {
  let randomSpeed;
  if (game.score >= 1000) {
    this.minSpeed = 200;
    this.maxSpeed = 400;
  }
  if (game.score >= 1500) {
    this.minSpeed = 300;
    this.maxSpeed = 600;
  }
  randomSpeed = Math.random() * (this.maxSpeed - this.minSpeed) + this.minSpeed;
  randomSpeed = Math.floor(randomSpeed);
  randomSpeed < 100 ? randomSpeed = 100 : randomSpeed;
  return this.speed = randomSpeed;
}

// Updates the enemy's position
Enemy.prototype.update = function (dt) {
  this.x += this.speed * dt;
  if (this.x >= this.maxX) {
    this.x = this.initialPosition;
    this.speed = this.calculateSpeed();
  }
};

// Draw the enemy on the screen
Enemy.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Variables for player
let Player = function () {
  this.minX = 0;
  this.maxX = 400;
  this.minY = 0;
  this.maxY = 400;
  this.isInWater = false;
  this.sprite = 'images/char-soldier.png';
  this.getInitialPosition();
}

// Players coordinates
Player.prototype.getInitialPosition = function() {
  this.x = 200;
  this.y = 400;
  this.isInWater;
}

Player.prototype.update = function () {
  if (this.y <= -10) {
    this.getInitialPosition();
    !this.isInWater && game.updateScore();
  }
  this.checkCollisions();
}

// Draw player
Player.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Checks enemy`s and player`s coordinates
Player.prototype.checkCollisions = function () {
  allEnemies.forEach(enemy => {
    let playerOnFirstRow = player.y - 14 === enemy.y;
    let playerOnSecondRow =  player.y - 16 === enemy.y;
    let playerOnThirdRow = player.y - 20 === enemy.y;
    let enemyOnPlayer = enemy.x >= player.x - 40 && enemy.x <= player.x + 40;
    let collision = (playerOnFirstRow || playerOnSecondRow || playerOnThirdRow)
      && enemyOnPlayer;
    collision && this.getInitialPosition();
    collision && game.score >= 50 && (game.score -= 50);
    collision && (game.collisions += 1);
    if (game.collisions === 1) {
      allLives.splice(0, 1);
      game.collisions = 0;
    }
    collision && allLives.length === 0 && (game.isOver = true) && game.over();
  });
}

// Sets key values
Player.prototype.handleInput = function (allowedKeys) {
  switch (allowedKeys) {
    case 'left':
      this.x <= 10 ? this.x = 0 : this.x -= 100;
      break;
    case 'up':
      this.y <= 50 ? this.y = -10 : this.y -= 80;
      break;
    case 'right':
      this.x >= 400 ? this.x = 400 : this.x += 100;
      break;
    case 'down':
      this.y >= 400 ? this.y = 400 : this.y += 80;
      break;
  }
}

// Listener for keys pressed
document.addEventListener('keyup', function (e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
  };
  player.handleInput(allowedKeys[e.keyCode]);
});

// Players score
let Game = function () {
  this.score = 0;
  this.higherScore = 0;
  this.collisions = 0;
  this.isOver = false;
}

// Updates scores
Game.prototype.updateScore = function () {
  !player.isInWater && (this.score += 100);
  if (!player.isInWater && this.score >= 2000 && allLives.length > 0) {
    this.playerWon = true;
    this.won();
  }
}

// Sets when the game is over
Game.prototype.over = function () {
  this.isOver === true && gameRecords.push(this.score);
  this.setHistoryGame();
  this.sortScore();
}

// When player wins, pushes game score
 Game.prototype.won = function () {
  this.playerWon === true && gameRecords.push(this.score);
  this.setHistoryGame();
  this.sortScore();
  this.gameFinished = true;
}

// Sorts game records and returns the higher score
Game.prototype.sortScore = function () {
  gameRecords.length && gameRecords.sort(function (a, b) {
    return (b - a);
  });
  this.higherScore += gameRecords[0];
}
Game.prototype.setHistoryGame = function () {
  localStorage.setItem('record', JSON.stringify(gameRecords));
}

//Resets values
Game.prototype.resetGame = function () {
  game = new Game();
  enemy1 = new Enemy(60);
  enemy2 = new Enemy(144);
  enemy3 = new Enemy(226);
  allEnemies = [enemy1, enemy2, enemy3];
  player.getInitialPosition();
  life1 = new Lives(370);
  life2 = new Lives(410);
  life3 = new Lives(450);
  allLives = [life1, life2, life3];
}


// Text for scores
Game.prototype.render = function () {
  ctx.font = 'bold 30px Special Elite';
  ctx.fillStyle = 'black';
  ctx.fillText(`Score: ${this.score}`, 20, 563);
  ctx.textBaseline = 'middle';
  if (this.isOver === true) {
    swal({
  		allowEscapeKey: false,
  		allowOutsideClick: false,
  		title: 'You have failed',
  		text: `Score: ${this.score} Higher Score: ${this.higherScore}`,
  		imageUrl: 'images/game-over.png',
  		background: 'white',
  	  imageWidth: 320,
  	  imageHeight: 200,
  	  imageAlt: 'Skull',
  		animation: false,
  		showCancelButton: false,
  		confirmButtonColor: '#1f4726',
  		confirmButtonText: 'One more time!'
  	}).then(function (isConfirm) {
    		if (isConfirm) {
          Game.prototype.resetGame();
    		}
    	})
  }
  if (this.gameFinished === true) {
    swal({
  		allowEscapeKey: false,
  		allowOutsideClick: false,
  		title:`Score: ${this.score} Higher Score: ${this.higherScore}`,
  		imageUrl: 'images/gz.png',
  		background: 'white',
  	  imageWidth: 320,
  	  imageHeight: 200,
  	  imageAlt: 'Congratulations',
  		animation: false,
  		showCancelButton: false,
  		confirmButtonColor: '#1f4726',
  		confirmButtonText: 'One more time!'
  	}).then(function (isConfirm) {
    		if (isConfirm) {
          Game.prototype.resetGame();
    		}
    	})
  }
}

// Variables for lives
let Lives = function (x) {
  this.sprite = 'images/Heart.png';
  this.x = x;
  this.y = 530;
  this.width = 45;
  this.height = 65;
}

// Draws hearts
Lives.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height);
}

// Variables necessary for collectibles
 let Gem = function () {
  this.x;
  this.y;
  this.width = 60;
  this.height = 80;
  this.gemImages = [
    'images/Gem Blue.png',
    'images/Gem Green.png',
    'images/Gem Orange.png',
    'images/Star.png',
    'images/Key.png'
  ];
  this.gemValues = [100, 150, 200, 300, 350];
  this.randomGem;
  this.sprite;
  this.getRandomGem();
}

Gem.prototype.getRandomGem = function () {
  let randomX,
      randomY,
      possibleX = [20, 120, 220, 320, 420],
      possibleY = [120, 200, 280];
  this.randomGem = Math.floor(Math.random() * this.gemImages.length);
  randomX = Math.floor(Math.random() * possibleX.length);
  randomY = Math.floor(Math.random() * possibleY.length);
  this.x = possibleX[randomX];
  this.y = possibleY[randomY];
  this.gemValues = this.gemValues[this.randomGem];
  this.sprite = this.gemImages[this.randomGem];
}

// Instantiates collectible items
Gem.generateGem = function () {
  let gem = new Gem();
  allGems.push(gem);
  Gem.getGems();
}

// Sets a random delay time for showing and removing collectible items
Gem.getGems = function () {
  let delay = Math.floor(Math.random() * (10000 - 6000) + 6000);
  setTimeout(Gem.removeGem, 6000);
  setTimeout(Gem.generateGem, delay);
}

// Removes collectibles from canvas
Gem.removeGem = function () {
  allGems.splice(0, 1);
}

// Clears timeout functions
Gem.clearTimeOuts = function () {
  clearTimeout(Gem.generateGem);
  clearTimeout(Gem.removeGem);
}

// Draws collectibles on canvas
Gem.prototype.render = function () {
  if (game.score >= 300) {
    ctx.font = 'bold 20px Special Elite';
    ctx.fillStyle = 'black';
    ctx.fillText(`${this.gemValues}`, this.x + 12, this.y + 90);
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height);
  }
}

//Tracks when the player is on the same coordinates as a collectible and increases the score
Gem.prototype.update = function () {
  let gemPicked = (allGems.length && player.y + 40 === allGems[0].y) &&
  (allGems.length && player.x + 20 === allGems[0].x);
  if (gemPicked) {
    (game.score < 300) ? game.score = game.score : (game.score += this.gemValues);
    allGems.splice(0, 1);
  }
}

// Enemy and Player instances
let gameRecords = JSON.parse(localStorage.getItem('record')) || [];
let game = new Game();
let enemy1 = new Enemy(60);
let enemy2 = new Enemy(144);
let enemy3 = new Enemy(226);
let allEnemies = [enemy1, enemy2, enemy3];
let player = new Player();
let life1 = new Lives(370);
let life2 = new Lives(410);
let life3 = new Lives(450);
let allLives = [life1, life2, life3];
let allGems = [];
Gem.generateGem();
