const titleScreen = document.getElementById("titleScreen")
const gameScreen = document.getElementById("gameScreen")
const shootSection = document.getElementById("shootSection")
const endScreen = document.getElementById("endScreen")

const startBtn = document.getElementById("startBtn")
const restartBtn = document.getElementById("restartBtn")
const backToGame = document.getElementById("backToGame")

const scoreDisplay = document.getElementById("scoreDisplay")
const missDisplay = document.getElementById("missDisplay")
const finalScore = document.getElementById("finalScore")

const ball = document.getElementById("ball")
const glove = document.getElementById("glove")

const goalImage = document.getElementById("goalImage")
const shootResult = document.getElementById("shootResult")

const bgMusic = document.getElementById("bgMusic")
const saveSfx = document.getElementById("saveSfx")
const goalSfx = document.getElementById("goalSfx")

let score = 0
let misses = { left: 0, center: 0, right: 0 }
let currentDirection = null
let timeLimit = 1500
let shotTimer = null
let shotActive = false

function updateHUD() {
  scoreDisplay.textContent = "Score: " + score
  const m = misses.left + misses.center + misses.right
  missDisplay.textContent = "Misses: " + m
}

startBtn.onclick = () => {
  titleScreen.style.display = "none"
  endScreen.style.display = "none"
  shootSection.style.display = "none"
  gameScreen.style.display = "flex"
  score = 0
  misses = { left: 0, center: 0, right: 0 }
  updateHUD()
  bgMusic.play()
  nextShot()
}

restartBtn.onclick = () => {
  endScreen.style.display = "none"
  titleScreen.style.display = "flex"
}

function resetBall() {
  ball.style.transition = "none"
  ball.style.left = "50%"
  ball.style.top = "10%"
}

function nextShot() {
  shotActive = false
  resetBall()
  fetch("/next-shot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score, misses })
  })
    .then(r => r.json())
    .then(d => {
      currentDirection = d.direction
      timeLimit = d.time_limit_ms
      startShot()
    })
    .catch(() => gameOver())
}

function startShot() {
  shotActive = true
  ball.style.transition = "all " + timeLimit / 1000 + "s linear"
  if (currentDirection === "left") ball.style.left = "20%"
  else if (currentDirection === "center") ball.style.left = "50%"
  else ball.style.left = "80%"
  ball.style.top = "85%"
  shotTimer = setTimeout(() => {
    if (!shotActive) return
    resolveShot(checkSave())
  }, timeLimit)
}

function checkSave() {
  const b = ball.getBoundingClientRect()
  const g = glove.getBoundingClientRect()
  return !(
    b.right < g.left ||
    b.left > g.right ||
    b.bottom < g.top ||
    b.top > g.bottom
  )
}

function resolveShot(saved) {
  shotActive = false
  clearTimeout(shotTimer)
  if (saved) {
    score++
    saveSfx.currentTime = 0
    saveSfx.play()
  } else {
    misses[currentDirection]++
    goalSfx.currentTime = 0
    goalSfx.play()
  }
  updateHUD()
  nextShot()
}

function gameOver() {
  gameScreen.style.display = "none"
  endScreen.style.display = "flex"
  bgMusic.pause()
  bgMusic.currentTime = 0
  finalScore.textContent = "Final Score: " + score
}

goalImage.addEventListener("click", e => {
  const r = goalImage.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 100
  const y = ((e.clientY - r.top) / r.height) * 100
  fetch("/shoot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ x, y })
  })
    .then(r => r.json())
    .then(d => {
      glove.style.transition = "left 0.4s ease, top 0.4s ease"
      glove.style.left = d.ai_x + "%"
      glove.style.top = d.ai_y + "%"
      shootResult.textContent = "AI guessed: " + d.ai_guess_x + " / " + d.ai_guess_y
    })
})
document.addEventListener("mousemove", e => {
  if (gameScreen.style.display !== "flex") return
  const r = document.getElementById("pitch").getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 100
  glove.style.left = x + "%"
})

backToGame.onclick = () => {
  shootSection.style.display = "none"
  gameScreen.style.display = "flex"
}
