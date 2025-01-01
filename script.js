/**
 * Namespace
 */
var Game = Game || {};
var Component = Component || {};

/**
 * Game Component Stage
 */
Component.Stage = function (canvas, conf) {
  this.width = canvas.width;
  this.height = canvas.height;
  this.length = [];
  this.food = {};
  this.score = 0;
  this.direction = 'right';
  this.conf = {
    cw: 10,
    size: 5,
    fps: 1000
  };

  // Merge Conf
  if (typeof conf == 'object') {
    for (var key in conf) {
      if (conf.hasOwnProperty(key)) {
        this.conf[key] = conf[key];
      }
    }
  }
};

/**
 * Game Component Snake
 */
Component.Snake = function (canvas, conf) {
  this.stage = new Component.Stage(canvas, conf);

  this.initSnake = function () {
    for (var i = 0; i < this.stage.conf.size; i++) {
      this.stage.length.push({ x: i, y: 0 });
    }
  };

  this.initSnake();

  this.initFood = function () {
    this.stage.food = {
      x: Math.round(Math.random() * (this.stage.width - this.stage.conf.cw) / this.stage.conf.cw),
      y: Math.round(Math.random() * (this.stage.height - this.stage.conf.cw) / this.stage.conf.cw)
    };
  };

  this.initFood();

  this.restart = function () {
    this.stage.length = [];
    this.stage.food = {};
    this.stage.score = 0;
    this.stage.direction = 'right';
    this.initSnake();
    this.initFood();
  };
};

/**
 * Game Draw
 */
Game.Draw = function (context, snake) {
  this.drawStage = function () {
    context.fillStyle = 'white';
    context.fillRect(0, 0, snake.stage.width, snake.stage.height);

    var nx = snake.stage.length[0].x;
    var ny = snake.stage.length[0].y;

    switch (snake.stage.direction) {
      case 'right': nx++; break;
      case 'left': nx--; break;
      case 'up': ny--; break;
      case 'down': ny++; break;
    }

    if (this.collision(nx, ny)) {
      snake.restart();
      return;
    }

    var tail = nx === snake.stage.food.x && ny === snake.stage.food.y
      ? { x: nx, y: ny }
      : snake.stage.length.pop();

    tail.x = nx;
    tail.y = ny;
    snake.stage.length.unshift(tail);

    for (var i = 0; i < snake.stage.length.length; i++) {
      var cell = snake.stage.length[i];
      this.drawCell(cell.x, cell.y);
    }

    this.drawCell(snake.stage.food.x, snake.stage.food.y);

    context.fillText('Score: ' + snake.stage.score, 5, (snake.stage.height - 5));
  };

  this.drawCell = function (x, y) {
    context.fillStyle = 'rgb(170, 170, 170)';
    context.beginPath();
    context.arc((x * snake.stage.conf.cw + 6), (y * snake.stage.conf.cw + 6), 4, 0, 2 * Math.PI, false);
    context.fill();
  };

  this.collision = function (nx, ny) {
    if (nx < 0 || nx >= snake.stage.width / snake.stage.conf.cw || ny < 0 || ny >= snake.stage.height / snake.stage.conf.cw) {
      return true;
    }
    return false;
  };
};

/**
 * Game Snake
 */
Game.Snake = function (elementId, conf) {
  var canvas = document.getElementById(elementId);
  var context = canvas.getContext('2d');
  this.snake = new Component.Snake(canvas, conf);
  var gameDraw = new Game.Draw(context, this.snake);

  setInterval(function () { gameDraw.drawStage(); }, this.snake.stage.conf.fps);
};

// Teachable Machine Voice Control
let recognizer, voiceControlEnabled = true;

// Initialize voice control
async function initVoiceControl() {
  try {
    const modelURL = "./my_model/model.json";
    const metadataURL = "./my_model/metadata.json";

    recognizer = await speechCommands.create('BROWSER_FFT', undefined, modelURL, metadataURL);
    await recognizer.ensureModelLoaded();
    console.log('Voice recognition model loaded.');

    recognizer.listen(result => {
      const labels = recognizer.wordLabels();
      const scores = result.scores;
      const highestScore = Math.max(...scores);
      const direction = labels[scores.indexOf(highestScore)];

      console.log('Voice Command:', direction, 'Score:', highestScore);

      // Change direction based on voice command
      if (voiceControlEnabled && highestScore > 0.75) {
        if (['up', 'down', 'left', 'right'].includes(direction)) {
          snake.snake.stage.direction = direction;
          console.log('Direction Changed to:', direction);
        }
      }
    }, { overlapFactor: 0.5, probabilityThreshold: 0.75 });
  } catch (err) {
    console.error('Error initializing voice control:', err);
  }
}

window.onload = function () {
  window.snake = new Game.Snake('stage', { fps: 100, size: 4 });
  initVoiceControl();  // Initialize voice control on page load
};
