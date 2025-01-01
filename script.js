let gameSnake;
let recognizer;

// Voice Command Threshold
const VOICE_COMMAND_THRESHOLD = 0.75;

function initGame() {
    const canvas = document.getElementById('stage');
    const context = canvas.getContext('2d');
    if (!canvas || !context) {
        console.error("Canvas element not found. Ensure the <canvas> element is defined with id='stage'.");
        return;
    }
    gameSnake = new SnakeGame(canvas, context, { fps: 100, size: 5 });
}

class SnakeGame {
    constructor(canvas, context, config) {
        this.canvas = canvas;
        this.context = context;
        this.config = Object.assign({ fps: 100, size: 5 }, config);
        this.snake = [];
        this.food = {};
        this.direction = 'right';
        this.score = 0;
        this.running = false;

        this.init();
        setInterval(() => this.update(), 1000 / this.config.fps);
    }

    init() {
        this.snake = [];
        for (let i = this.config.size - 1; i >= 0; i--) {
            this.snake.push({ x: i, y: 0 });
        }
        this.spawnFood();
        this.running = true;
    }

    spawnFood() {
        this.food = {
            x: Math.floor(Math.random() * (this.canvas.width / 10)),
            y: Math.floor(Math.random() * (this.canvas.height / 10)),
        };
    }

    update() {
        if (!this.running) return;

        const head = { ...this.snake[0] };
        switch (this.direction) {
            case 'right': head.x++; break;
            case 'left': head.x--; break;
            case 'up': head.y--; break;
            case 'down': head.y++; break;
        }

        if (this.isCollision(head)) {
            console.log('Collision detected. Restarting...');
            this.init();
            return;
        }

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.spawnFood();
        } else {
            this.snake.pop();
        }

        this.snake.unshift(head);
        this.draw();
    }

    isCollision(head) {
        if (head.x < 0 || head.y < 0 ||
            head.x >= this.canvas.width / 10 || head.y >= this.canvas.height / 10) {
            return true;
        }
        return this.snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }

    draw() {
        this.context.fillStyle = 'white';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.snake.forEach(segment => {
            this.context.fillStyle = 'green';
            this.context.fillRect(segment.x * 10, segment.y * 10, 10, 10);
        });

        this.context.fillStyle = 'red';
        this.context.fillRect(this.food.x * 10, this.food.y * 10, 10, 10);

        this.context.fillStyle = 'black';
        this.context.fillText(`Score: ${this.score}`, 10, this.canvas.height - 10);
    }

    changeDirection(newDirection) {
        const opposite = {
            up: 'down',
            down: 'up',
            left: 'right',
            right: 'left',
        };
        if (newDirection !== opposite[this.direction]) {
            this.direction = newDirection;
            console.log('Direction changed to:', newDirection);
        }
    }
}

async function initVoiceControl() {
    try {
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

            if (highestScore > VOICE_COMMAND_THRESHOLD) {
                if (['up', 'down', 'left', 'right'].includes(command)) {
                    gameSnake.changeDirection(command);
                }
            }
        }, { overlapFactor: 0.5, probabilityThreshold: VOICE_COMMAND_THRESHOLD });
    } catch (err) {
        console.error('Error initializing voice control:', err);
    }
}

window.onload = initGame;
