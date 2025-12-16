// --- BANCO DE DADOS DE EVENTOS HISTÓRICOS ---
const fullDatabase = [
    { event: "Construção das Pirâmides de Gizé", year: -2580 },
    { event: "Fundação de Roma", year: -753 },
    { event: "Nascimento de Cristo (Ano 1)", year: 1 },
    { event: "Queda do Império Romano", year: 476 },
    { event: "Chegada dos Portugueses ao Brasil", year: 1500 },
    { event: "Revolução Francesa", year: 1789 },
    { event: "Independência do Brasil", year: 1822 },
    { event: "Abolição da Escravidão no Brasil", year: 1888 },
    { event: "Primeira Guerra Mundial", year: 1914 },
    { event: "Semana de Arte Moderna", year: 1922 },
    { event: "Segunda Guerra Mundial", year: 1939 },
    { event: "O Homem pisa na Lua", year: 1969 },
    { event: "Queda do Muro de Berlim", year: 1989 },
    { event: "Ataque às Torres Gêmeas", year: 2001 },
    { event: "Invenção da Imprensa por Gutenberg", year: 1440 },
    { event: "Cristóvão Colombo chega à América", year: 1492 },
    { event: "Lançamento do primeiro iPhone", year: 2007 },
    { event: "Pandemia de COVID-19", year: 2020 }
];

/* --- GRID DE FUNDO (Lógica da Matemática) --- */
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
createGrid(); // Chama imediatamente

// Variáveis de Estado
let gameEvents = []; // Eventos que ainda precisam ser jogados
let timelineEvents = []; // Eventos já colocados na linha
let currentEvent = null; // Evento atual na mão do jogador
let score = 0;
let lives = 3;
let startTime; // Variável para o tempo

// Elementos DOM
const timelineEl = document.getElementById('timeline');
const currentCardText = document.getElementById('card-text');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

// Audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'win') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
    } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    }

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
    oscillator.stop(audioCtx.currentTime + 0.3);
}

function startGame() {
    // Resetar variáveis
    score = 0;
    lives = 3;
    updateStats();

    // Inicia contagem de tempo
    startTime = Date.now();

    // Clonar o banco de dados para não estragar o original e embaralhar
    let tempDb = [...fullDatabase];
    tempDb.sort(() => Math.random() - 0.5);

    // Pegar o primeiro evento para começar a linha do tempo (semente)
    timelineEvents = [tempDb.pop()];
    gameEvents = tempDb;

    // Esconder telas
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');

    // Renderizar primeira vez
    pickNextCard();
    renderTimeline();
}

// Função auxiliar para calcular e formatar o tempo (igual matemática)
function getFormattedTime() {
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const totalSeconds = Math.floor(durationMs / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m} min ${s} s`;
}

function pickNextCard() {
    if (gameEvents.length === 0) {
        // VITÓRIA
        const durationString = getFormattedTime();
        const endTime = Date.now();
        const durationMs = endTime - startTime;
        const durationHours = durationMs / 1000 / 60 / 60;

        saveGameDataToDB('historia', score, durationHours);

        document.getElementById('victory-info').innerHTML = `Pontuação: ${score} <br> Tempo: ${durationString}`;
        document.getElementById('victory-screen').classList.remove('hidden');
        return;
    }
    currentEvent = gameEvents.pop();
    currentCardText.innerText = currentEvent.event;
}

function renderTimeline() {
    timelineEl.innerHTML = '';

    timelineEvents.forEach((event, index) => {
        // Botão de Inserção (Dropzone)
        const btn = document.createElement('button');
        btn.className = 'insert-btn';
        btn.innerText = 'INSERIR AQUI';
        btn.onclick = () => checkAnswer(index);
        timelineEl.appendChild(btn);

        // Card do Evento
        const card = document.createElement('div');
        card.className = 'placed-card';
        let yearDisplay = event.year < 0 ? Math.abs(event.year) + ' a.C.' : event.year;
        card.innerHTML = `
                <div>${event.event}</div>
                <div class="card-year">${yearDisplay}</div>
            `;
        timelineEl.appendChild(card);
    });

    // Botão Final
    const btnFinal = document.createElement('button');
    btnFinal.className = 'insert-btn';
    btnFinal.innerText = 'INSERIR AQUI';
    btnFinal.onclick = () => checkAnswer(timelineEvents.length);
    timelineEl.appendChild(btnFinal);
}

function checkAnswer(insertIndex) {
    const prevEvent = insertIndex > 0 ? timelineEvents[insertIndex - 1] : null;
    const nextEvent = insertIndex < timelineEvents.length ? timelineEvents[insertIndex] : null;

    const myYear = currentEvent.year;
    let isCorrect = true;

    if (prevEvent && myYear < prevEvent.year) isCorrect = false;
    if (nextEvent && myYear > nextEvent.year) isCorrect = false;

    if (isCorrect) {
        // ACERTOU
        playSound('win');
        timelineEvents.splice(insertIndex, 0, currentEvent);
        score += 100;
        updateStats();
        renderTimeline();
        pickNextCard();
    } else {
        // ERROU
        playSound('wrong');
        lives--;
        updateStats();

        // Feedback visual
        const body = document.body;
        body.style.backgroundColor = '#3a1d1d';
        setTimeout(() => body.style.backgroundColor = '', 200);

        if (lives <= 0) {
            // GAME OVER
            const durationString = getFormattedTime();
            const endTime = Date.now();
            const durationMs = endTime - startTime;
            const durationHours = durationMs / 1000 / 60 / 60;

            saveGameDataToDB('historia', score, durationHours);

            document.getElementById('game-over-info').innerHTML = `Pontuação: ${score} <br> Tempo: ${durationString}`;
            document.getElementById('game-over-screen').classList.remove('hidden');
        }
    }
}

function updateStats() {
    scoreEl.innerText = score;
    livesEl.innerText = lives;
}

function voltarMenu() {
    window.location.href = "../../dashboard.html"
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