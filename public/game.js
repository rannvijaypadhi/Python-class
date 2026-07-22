let mode = null;
let currentShot = null;
let score = 0;
let misses = { left: 0, center: 0, right: 0 };

const startScreen = document.getElementById("start-screen");
const modeScreen = document.getElementById("mode-screen");
const gameScreen = document.getElementById("game-screen");

const startBtn = document.getElementById("start-btn");
const botBtn = document.getElementById("bot-mode");
const matchBtn = document.getElementById("matchmaking-mode");

const statusText = document.getElementById("status");
const scoreText = document.getElementById("score");

startBtn.onclick = () => {
    startScreen.style.display = "none";
    modeScreen.style.display = "block";
};

botBtn.onclick = () => {
    mode = "bot";
    modeScreen.style.display = "none";
    gameScreen.style.display = "block";
};

matchBtn.onclick = () => {
    mode = "matchmaking";
    modeScreen.style.display = "none";
    gameScreen.style.display = "block";
};

document.addEventListener("keydown", async (e) => {
    if (mode === "bot") {
        if (e.code === "Space" && !currentShot) {
            await startRoundBot();
        }
        if (!currentShot) return;
        if (e.code === "ArrowLeft") checkSave("left");
        if (e.code === "ArrowUp") checkSave("center");
        if (e.code === "ArrowRight") checkSave("right");
    }
});

async function startRoundBot() {
    const res = await fetch("/next-shot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, misses })
    });
    currentShot = await res.json();
    document.querySelectorAll(".zone").forEach(z => z.classList.remove("active"));
    document.getElementById(currentShot.direction).classList.add("active");
    statusText.textContent = "Shot to " + currentShot.direction.toUpperCase();
    setTimeout(() => {
        if (!currentShot) return;
        misses[currentShot.direction]++;
        statusText.textContent = "Missed. Press SPACE";
        currentShot = null;
        document.querySelectorAll(".zone").forEach(z => z.classList.remove("active"));
    }, currentShot.time_limit_ms);
}

function checkSave(dir) {
    if (currentShot.direction === dir) {
        score++;
        scoreText.textContent = score;
        statusText.textContent = "Save. Press SPACE";
    } else {
        misses[dir]++;
        statusText.textContent = "Wrong direction. Press SPACE";
    }
    currentShot = null;
    document.querySelectorAll(".zone").forEach(z => z.classList.remove("active"));
}
