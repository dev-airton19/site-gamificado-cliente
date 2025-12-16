/* --- Grid de Fundo (Adicionado do Mat.js) --- */
const gridContainer = document.getElementById('background-grid');
const tileSize = 80;

function createGrid() {
    if (!gridContainer) return; // Segurança caso o ID não exista
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

// --- BANCO DE PALAVRAS (Você pode adicionar mais aqui) ---
const wordsDb = [
    { word: "Cachorro", type: "substantivo" },
    { word: "Correr", type: "verbo" },
    { word: "Bonito", type: "adjetivo" },
    { word: "Mesa", type: "substantivo" },
    { word: "Pular", type: "verbo" },
    { word: "Rápido", type: "adjetivo" },
    { word: "Felicidade", type: "substantivo" },
    { word: "Estudar", type: "verbo" },
    { word: "Verde", type: "adjetivo" },
    { word: "Brasil", type: "substantivo" },
    { word: "Amar", type: "verbo" },
    { word: "Inteligente", type: "adjetivo" },
    { word: "Computador", type: "substantivo" },
    { word: "Escrever", type: "verbo" },
    { word: "Gelado", type: "adjetivo" },
    { word: "Lápis", type: "substantivo" },
    { word: "Sorrir", type: "verbo" },
    { word: "Longo", type: "adjetivo" }
];

// --- VARIÁVEIS DO JOGO ---
let currentScore = 0;
let currentLives = 3;
let currentWordObj = null;
let gameInterval;
let timerInterval;
let timeLeft = 100; // porcentagem
let gameSpeed = 5000; // ms para responder
let isPlaying = false;
let startTime; // NOVO: Tempo inicial para cálculo de duração

// --- ELEMENTOS DOM ---
const wordBox = document.getElementById('word-box');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const timerBar = document.getElementById('timer-bar');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalInfoEl = document.getElementById('final-info'); // NOVO: Elemento para exibir score e tempo
const conveyorBelt = document.getElementById('conveyor-belt');

function startGame() {
    // Resetar variáveis
    currentScore = 0;
    currentLives = 3;
    gameSpeed = 5000;
    scoreEl.innerText = currentScore;
    livesEl.innerText = currentLives;
    startTime = Date.now(); // NOVO: Marca o tempo de início

    // UI Toggle
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    isPlaying = true;

    nextWord();
}

function nextWord() {
    if (!isPlaying) return;

    // Escolher palavra aleatória
    const randomIndex = Math.floor(Math.random() * wordsDb.length);
    currentWordObj = wordsDb[randomIndex];

    // Atualizar UI
    wordBox.innerText = currentWordObj.word;
    wordBox.classList.remove('active');

    // Pequeno delay para animação de "pop"
    setTimeout(() => {
        wordBox.classList.add('active');
    }, 50);

    // Resetar Timer
    timeLeft = 100;
    timerBar.style.width = '100%';
    timerBar.style.backgroundColor = '#27ae60';

    // Iniciar Contagem
    clearInterval(timerInterval);
    const tickRate = 20; // atualizar a cada 20ms
    const decrement = 100 / (gameSpeed / tickRate);

    timerInterval = setInterval(() => {
        timeLeft -= decrement;
        timerBar.style.width = timeLeft + '%';

        // Mudar cor da barra se estiver acabando
        if (timeLeft < 30) timerBar.style.backgroundColor = '#e74c3c';
        else if (timeLeft < 60) timerBar.style.backgroundColor = '#f39c12';

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleError("tempo");
        }
    }, tickRate);
}

function checkAnswer(type) {
    if (!isPlaying) return;

    clearInterval(timerInterval); // Pausa o timer atual

    if (type === currentWordObj.type) {
        // ACERTOU
        currentScore += 10;
        scoreEl.innerText = currentScore;

        // Feedback Visual
        conveyorBelt.classList.add('correct-flash');
        setTimeout(() => conveyorBelt.classList.remove('correct-flash'), 200);

        // Aumentar dificuldade (diminuir tempo em 50ms a cada acerto, limite 1s)
        if (gameSpeed > 1000) gameSpeed -= 50;

        nextWord();
    } else {
        // ERROU
        handleError("erro");
    }
}

function handleError(reason) {
    currentLives--;
    livesEl.innerText = currentLives;

    // Feedback Visual
    conveyorBelt.classList.add('wrong-flash');
    setTimeout(() => conveyorBelt.classList.remove('wrong-flash'), 200);

    if (currentLives <= 0) {
        endGame();
    } else {
        // Dá um tempinho para o jogador respirar antes da próxima
        setTimeout(nextWord, 500);
    }
}

function endGame() {
    isPlaying = false;
    clearInterval(timerInterval);

    // --- NOVO: CÁLCULO DE TEMPO E REGISTRO DE SCORE ---
    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Converte para decimal para salvar (horas)
    const durationHours = durationMs / 1000 / 60 / 60;

    // Converte para String Legível para exibir (ex: 1m 20s)
    const totalSeconds = Math.floor(durationMs / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const durationString = `${m} min ${s} s`;

    saveGameDataToDB('portugues', currentScore, durationHours);

    // Atualiza a tela de Game Over
    finalInfoEl.innerHTML = `Pontuação Final: ${currentScore} <br> Tempo: ${durationString}`;
    gameOverScreen.classList.remove('hidden');
}

// NOVO: Função para Voltar ao Dashboard
function goToDashboard() {
    window.location.href = "../../index.html";
}

function voltarMenu() {
    window.location.href = "../../index.html"
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