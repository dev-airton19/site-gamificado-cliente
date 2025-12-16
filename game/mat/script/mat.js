const explosionSound = new Audio("aud/explosion.mp3");
const destroySound = new Audio("aud/destroy.m4a");
const gameOverSound = new Audio("aud/gameover.mp3");
gameOverSound.volume = 1.0;

/* --- Grid de Fundo --- */
const gridContainer = document.getElementById('background-grid');
const tileSize = 80;

function createGrid() {
    gridContainer.innerHTML = '';
    const cols = Math.ceil(window.innerWidth / tileSize);
    const rows = Math.ceil(window.innerHeight / tileSize);
    for (let i = 0; i < cols * rows; i++) {
        const tile = document.createElement('div');
        tile.className = 'grid-tile';
        tile.style.width = tileSize + "px";
        tile.style.height = tileSize + "px";
        gridContainer.appendChild(tile);
    }
}
createGrid();


const gameArea = document.getElementById('game-area');
const inputField = document.getElementById('answer-input');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const overlay = document.getElementById('overlay');
const collisionLine = document.getElementById("collision-line");

let score = 0, lives = 3, gameActive = false;
let meteors = [];
let meteorSpeed = 1.5;
let spawnRate = 2000;
let gameLoopInterval, spawnInterval;
let startTime; // Tempo inicial

function startGame() {
    score = 0;
    lives = 3;
    meteors = [];
    gameArea.innerHTML = "";
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    overlay.style.display = "none";
    inputField.focus();
    gameActive = true;

    startTime = Date.now(); // Marca o tempo de início em ms

    spawnInterval = setInterval(createMeteor, spawnRate);
    gameLoopInterval = setInterval(updateGame, 20);
}

function createMeteor() {
    if (!gameActive) return;

    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;

    const isAdd = Math.random() > 0.5;
    const question = isAdd ? `${num1}+${num2}` : `${Math.max(num1, num2)}-${Math.min(num1, num2)}`;
    const answer = isAdd ? num1 + num2 : Math.max(num1, num2) - Math.min(num1, num2);

    const el = document.createElement("div");
    el.className = "meteor";
    el.innerText = question;

    el.style.left = Math.floor(Math.random() * (600 - 80)) + "px";
    el.style.top = "-80px";

    gameArea.appendChild(el);

    meteors.push({
        element: el,
        answer,
    });
}

function updateGame() {
    const lineRect = collisionLine.getBoundingClientRect();

    meteors.forEach((m, index) => {
        const el = m.element;

        const currentTop = parseFloat(el.style.top);
        el.style.top = currentTop + meteorSpeed + "px";

        const meteorRect = el.getBoundingClientRect();

        if (meteorRect.bottom >= lineRect.top) {
            explosionSound.play();
            takeDamage(index);
        }
    });
}

inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const v = parseInt(inputField.value);
        inputField.value = "";
        checkAnswer(v);
    }
});

function checkAnswer(value) {
    const index = meteors.findIndex(m => m.answer === value);
    if (index !== -1) {

        destroySound.play();
        destroyMeteor(index);

        score += 10;
        scoreDisplay.textContent = score;

        if (score % 50 === 0) meteorSpeed += 0.25;
    }
}

function destroyMeteor(i) {
    meteors[i].element.remove();
    meteors.splice(i, 1);
}

function takeDamage(i) {
    destroyMeteor(i);
    lives--;
    livesDisplay.textContent = lives;

    const gc = document.getElementById("game-container");
    gc.style.borderColor = "red";
    setTimeout(() => gc.style.borderColor = "#4e4e50", 200);

    if (lives <= 0) gameOver();
}

function gameOver() {
    clearInterval(gameLoopInterval);
    clearInterval(spawnInterval);
    gameActive = false;

    // --- CÁLCULO DE TEMPO ---
    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Converte para decimal para salvar (horas)
    const durationHours = durationMs / 1000 / 60 / 60;

    // Converte para String Legível para exibir (ex: 1m 20s)
    const totalSeconds = Math.floor(durationMs / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const durationString = `${m} min ${s} s`;

    saveGameDataToDB('matematica', score, durationHours);

    gameOverSound.currentTime = 0;
    gameOverSound.play();

    document.getElementById("title-text").innerText = "FIM DE JOGO";
    // MUDANÇA: Exibe Score e Tempo da Partida
    document.getElementById("info-text").innerHTML = `Pontuação: ${score} <br> Tempo: ${durationString}`;
    overlay.style.display = "flex";
}

function goToDashboard() {
    window.location.href = "../../index.html";
}

// --- FUNÇÃO PARA SALVAR NO BANCO DE DADOS ---
async function saveGameDataToDB(gameType, score, durationHours) {
    const token = localStorage.getItem("authToken");
    if (!token) return; // Se não estiver logado, não salva no banco

    try {
        await fetch("https://site-gamificadoback-cliente.onrender.com/stats/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                gameType: gameType,
                score: score,
                duration: durationHours
            })
        });
        console.log("Dados salvos no servidor!");
    } catch (error) {
        console.error("Erro ao salvar dados:", error);
    }
}