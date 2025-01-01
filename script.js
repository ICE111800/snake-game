const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const boxSize = 20;
let snake = [{ x: 8, y: 8 }];
let food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
let direction = "RIGHT";
let gameInterval;
let recognizer;

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  snake.forEach(segment => {
    ctx.fillStyle = "green";
    ctx.fillRect(segment.x * boxSize, segment.y * boxSize, boxSize, boxSize);
  });

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x * boxSize, food.y * boxSize, boxSize, boxSize);

  // Move snake
  const head = { ...snake[0] };
  if (direction === "UP") head.y--;
  if (direction === "DOWN") head.y++;
  if (direction === "LEFT") head.x--;
  if (direction === "RIGHT") head.x++;

  // Check collision with food
  if (head.x === food.x && head.y === food.y) {
    food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
  } else {
    snake.pop();
  }

  // Check collision with walls or self
  if (
    head.x < 0 || head.x >= canvas.width / boxSize ||
    head.y < 0 || head.y >= canvas.height / boxSize ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    clearInterval(gameInterval);
    alert("Game Over!");
    return;
  }

  snake.unshift(head);
}

function startGame() {
  snake = [{ x: 8, y: 8 }];
  direction = "RIGHT";
  food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
  clearInterval(gameInterval);
  gameInterval = setInterval(drawGame, 100);
}

// Voice control setup
async function startVoiceControl() {
  recognizer = await speechCommands.create("BROWSER_FFT");
  await recognizer.ensureModelLoaded();

  recognizer.listen(result => {
    const scores = result.scores;
    const labels = recognizer.wordLabels();
    const highestScoreIndex = scores.indexOf(Math.max(...scores));
    const command = labels[highestScoreIndex];

    if (command === "up" && direction !== "DOWN") direction = "UP";
    if (command === "down" && direction !== "UP") direction = "DOWN";
    if (command === "left" && direction !== "RIGHT") direction = "LEFT";
    if (command === "right" && direction !== "LEFT") direction = "RIGHT";

    console.log("Voice Command:", command);
  }, { probabilityThreshold: 0.75 });
}

// Start game on page load
window.onload = startGame;
