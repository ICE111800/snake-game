let recognizer, gameSnake;

// Snake Game Class
class SnakeGame {
    constructor(canvas, context, config) {
        this.canvas = canvas;
        this.context = context;
        this.config = Object.assign({ fps: 100, size: 5, cw: 10 }, config);
        this.snake = [];
        this.food = {};
        this.direction = 'right';
        this.score = 0;
        this.initGame();
    }

    // Initialize game
    initGame() {
        this.snake = [];
        for (let i = 0; i < this.config.size; i++) {
            this.snake.push({ x: i, y: 0 });
        }
        this.spawnFood();
        this.score = 0;
        this.direction = 'right';
        this.runGame();
    }

    // Spawn food at a random location
    spawnFood() {
        const cw = this.config.cw;
        this.food = {
            x: Math.floor(Math.random() * (this.canvas.width / cw)),
            y: Math.floor(Math.random() * (this.canvas.height / cw)),
        };
    }

    // Change snake direction
    changeDirection(newDirection) {
        const oppositeDirections = {
            up: 'down',
            down: 'up',
            left: 'right',
            right: 'left',
        };

        if (this.direction !== oppositeDirections[newDirection]) {
            this.direction = newDirection;
        }
    }

    // Check for collision
    checkCollision(nx, ny) {
        const hitWall =
            nx < 0 ||
            ny < 0 ||
            nx >= this.canvas.width / this.config.cw ||
            ny >= this.canvas.height / this.config.cw;

        const hitSelf = this.snake.some(segment => segment.x === nx && segment.y === ny);

        return hitWall || hitSelf;
    }

    // Draw the game
    drawGame() {
        const { context, config, snake, food } = this;
        const cw = config.cw;

        // Clear canvas
        context.fillStyle = 'white';
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        context.fillStyle = 'green';
        snake.forEach(segment => {
            context.fillRect(segment.x * cw, segment.y * cw, cw, cw);
        });

        // Draw food
        context.fillStyle = 'red';
        context.fillRect(food.x * cw, food.y * cw, cw, cw);

        // Draw score
        context.fillStyle = 'black';
        context.fillText(`Score: ${this.score}`, 5, this.canvas.height - 5);
    }

    // Update game state
    updateGame() {
        const head = this.snake[0];
        let nx = head.x;
        let ny = head.y;

        // Update snake's head based on direction
        switch (this.direction) {
            case 'right': nx++; break;
            case 'left': nx--; break;
            case 'up': ny--; break;
            case 'down': ny++; break;
        }

        if (this.checkCollision(nx, ny)) {
            console.log('Collision detected. Restarting...');
            this.initGame();
            return;
        }

        const newHead = { x: nx, y: ny };

        if (nx === this.food.x && ny === this.food.y) {
            this.score++;
            this.spawnFood();
        } else {
            this.snake.pop();
        }

        this.snake.unshift(newHead);
    }

    // Run the game
    runGame() {
        setInterval(() => {
            this.updateGame();
            this.drawGame();
        }, this.config.fps);
    }
}

// Initialize game on page load
window.onload = function () {
    const canvas = document.getElementById('stage');
    const context = canvas.getContext('2d');
    if (!canvas || !context) {
        console.error("Canvas element or context not found.");
        return;
    }
    gameSnake = new SnakeGame(canvas, context, { fps: 100, size: 5 });
};

// Initialize voice control
async function initVoiceControl() {
    try {
        console.log('Initializing voice control...');
        const modelURL = 'https://ice111800.github.io/snake-game/my_model/model.json';
        const metadataURL = 'https://ice111800.github.io/snake-game/my_model/metadata.json';

        recognizer = await speechCommands.create('BROWSER_FFT', undefined, modelURL, metadataURL);
        await recognizer.ensureModelLoaded();
        console.log('Voice recognition model loaded.');

        recognizer.listen(result => {
            const labels = recognizer.wordLabels();
            const scores = result.scores;
            const highestScore = Math.max(...scores);
            const command = labels[scores.indexOf(highestScore)];

            if (highestScore > 0.75) {
                console.log(`Voice Command: ${command}, Score: ${highestScore}`);
                if (['up', 'down', 'left', 'right'].includes(command)) {
                    gameSnake.changeDirection(command);
                }
            }
        }, { overlapFactor: 0.5, probabilityThreshold: 0.75 });
    } catch (err) {
        console.error('Error initializing voice control:', err);
    }
}
