const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const scoreDisplay = document.getElementById("scoreDisplay");
const missDisplay = document.getElementById("missDisplay");
const finalScore = document.getElementById("finalScore");

const ball = document.getElementById("ball");
const glove = document.getElementById("glove");

const bgMusic = document.getElementById("bgMusic");
const saveSfx = document.getElementById("saveSfx");
const goalSfx = document.getElementById("goalSfx");

let score = 0;
let misses = { left: 0, center: 0, right: 0 };
let currentDirection = null;
let timeLimit = 1500;
let shotTimer = null;
let shotActive = false;

startBtn.onclick = () => {
  titleScreen.style.display = "none";
  endScreen.style.display = "none";
  gameScreen.style.display = "flex";

  score = 0;
  misses = { left: 0, center: 0, right: 0 };
  updateHUD();

  bgMusic.play();
  nextShot();
};

restartBtn.onclick = () => {
  endScreen.style.display = "none";
  titleScreen.style.display = "flex";
};

document.addEventListener("mousemove", e => {
  const fieldRect = document.getElementById("field").getBoundingClientRect();
  const x = e.clientX - fieldRect.left;
  const y = e.clientY - fieldRect.top;

  glove.style.left = `${x - glove.offsetWidth / 2}px`;
  glove.style.top = `${y - glove.offsetHeight / 2}px`;
});

function updateHUD() {
  scoreDisplay.textContent = `Score: ${score}`;
  const totalMisses = misses.left + misses.center + misses.right;
  missDisplay.textContent = `Misses: ${totalMisses}`;
}

function nextShot() {
  shotActive = false;
  ball.style.transition = "none";
  resetBallPosition();

  fetch("/next-shot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score, misses })
  })
    .then(res => res.json())
    .then(data => {
      currentDirection = data.direction;
      timeLimit = data.time_limit_ms;
      startShot();
    })
    .catch(() => gameOver());
}

function startShot() {
  shotActive = true;

  ball.style.transition = `all ${timeLimit / 1000}s linear`;

  if (currentDirection === "left") {
    ball.style.left = "20%";
  } else if (currentDirection === "center") {
    ball.style.left = "50%";
  } else {
    ball.style.left = "80%";
  }

  ball.style.top = "80%";

  shotTimer = setTimeout(() => {
    if (!shotActive) return;
    const saved = checkSave();
    resolveShot(saved);
  }, timeLimit);
}

function resetBallPosition() {
  ball.style.left = "50%";
  ball.style.top = "10%";
}

function checkSave() {
  const ballRect = ball.getBoundingClientRect();
  const gloveRect = glove.getBoundingClientRect();

  const overlap = !(
    ballRect.right < gloveRect.left ||
    ballRect.left > gloveRect.right ||
    ballRect.bottom < gloveRect.top ||
    ballRect.top > gloveRect.bottom
  );

  return overlap;
}

function resolveShot(saved) {
  shotActive = false;
  clearTimeout(shotTimer);

  if (saved) {
    score++;
    saveSfx.currentTime = 0;
    saveSfx.play();
  } else {
    misses[currentDirection]++;
    goalSfx.currentTime = 0;
    goalSfx.play();
  }

  updateHUD();
  nextShot();
}

function gameOver() {
  gameScreen.style.display = "none";
  endScreen.style.display = "flex";
  bgMusic.pause();
  bgMusic.currentTime = 0;

  finalScore.textContent = `Final Score: ${score}`;
}
