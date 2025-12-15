const gridSize = 10;
let robot = { x: 0, y: 0, dir: 1 };
let target = { x: 5, y: 5 };
let commands = [];
let isRunning = false;
let walls = [];

// Variáveis de Estado (Igual aos outros jogos)
let score = 0;
let lives = 3;
let startTime;

const gridEl = document.getElementById('grid');
const listEl = document.getElementById('commandList');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

// --- GRID DE FUNDO ---
const gridContainer = document.getElementById('background-grid');
const tileSize = 80;

function createBackgroundGrid() {
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
createBackgroundGrid();

// -----------------------
// FUNÇÃO DE TEMPO
// -----------------------
function getFormattedTime() {
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const durationHours = durationMs / 1000 / 60 / 60; // Para salvar

    const totalSeconds = Math.floor(durationMs / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return { string: `${m} min ${s} s`, hours: durationHours };
}

// -----------------------
// GERA EQUAÇÕES
// -----------------------
function generateEquation() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const op = ["+", "-", "×"][Math.floor(Math.random() * 3)];

    let correct;

    if (op === "+") correct = a + b;
    else if (op === "-") correct = a - b;
    else correct = a * b;

    const answer = prompt(`Resolva para adicionar o comando:\n\n${a} ${op} ${b} = ?`);

    if (answer === null) return false;
    return Number(answer) === correct;
}

function startGame() {
    score = 0;
    lives = 3;
    commands = [];
    isRunning = false;
    listEl.innerHTML = '';

    updateStats();
    startTime = Date.now();

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('btnRun').disabled = false;

    createGrid();
}

function createGrid() {
    gridEl.innerHTML = '';
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `cell-${x}-${y}`;
            gridEl.appendChild(cell);
        }
    }
    generateMaze();
    renderEntities();
}

function existsPath() {
    const queue = [{ x: robot.x, y: robot.y }];
    const visited = new Set();
    visited.add(`${robot.x},${robot.y}`);

    while (queue.length > 0) {
        const { x, y } = queue.shift();

        if (x === target.x && y === target.y) return true;

        const neighbors = [
            { x: x + 1, y },
            { x: x - 1, y },
            { x, y: y + 1 },
            { x, y: y - 1 }
        ];

        for (let n of neighbors) {
            if (
                n.x >= 0 && n.x < gridSize &&
                n.y >= 0 && n.y < gridSize &&
                !walls.some(w => w.x === n.x && w.y === n.y)
            ) {
                const key = `${n.x},${n.y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push(n);
                }
            }
        }
    }
    return false;
}

function generateMaze() {
    // Se for reinício total, robô volta pro zero. Se for apenas troca de fase, robô fica onde está.
    if (commands.length === 0 && !isRunning) {
        robot = { x: 0, y: 0, dir: 1 };
    }

    let safe = false;
    while (!safe) {
        walls = [];
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (Math.random() < 0.22) {
                    if ((x === robot.x && y === robot.y) ||
                        (x === target.x && y === target.y)) continue;
                    walls.push({ x, y });
                }
            }
        }
        safe = existsPath();
    }
}

function renderEntities() {
    document.querySelectorAll('.cell').forEach(c => {
        c.innerHTML = '';
        c.classList.remove('robot');
        c.classList.remove('wall');
    });

    walls.forEach(w => {
        const cell = document.getElementById(`cell-${w.x}-${w.y}`);
        if (cell) cell.classList.add("wall");
    });

    const targetCell = document.getElementById(`cell-${target.x}-${target.y}`);
    if (targetCell) targetCell.innerHTML = '⭐';

    const robotCell = document.getElementById(`cell-${robot.x}-${robot.y}`);
    if (robotCell) {
        const robotIcon = document.createElement('div');
        robotIcon.textContent = '🤖';
        robotIcon.classList.add('robot');
        robotIcon.style.transform = `rotate(${robot.dir * 90}deg)`;
        robotCell.appendChild(robotIcon);
    }
}

function addCommand(type) {
    if (isRunning) return;

    const ok = generateEquation();
    if (!ok) {
        alert("❌ Resposta incorreta! Tente novamente.");
        return;
    }

    let text = "";
    let val = 0;

    if (type === 'move') {
        val = parseInt(document.getElementById('stepInput').value);
        text = `Andar ${val}`;
        commands.push({ type: 'move', value: val });
    } else if (type === 'left') {
        text = `Esq.`;
        commands.push({ type: 'turn', value: -1 });
    } else if (type === 'right') {
        text = `Dir.`;
        commands.push({ type: 'turn', value: 1 });
    }

    const li = document.createElement('li');
    li.textContent = text;
    listEl.appendChild(li);
}

async function executeCommands() {
    if (commands.length === 0 || isRunning) return;
    isRunning = true;
    document.getElementById('btnRun').disabled = true;

    for (let cmd of commands) {
        if (!isRunning) break; // Segurança caso pare no meio

        if (cmd.type === 'turn') {
            robot.dir += cmd.value;
            if (robot.dir < 0) robot.dir = 3;
            if (robot.dir > 3) robot.dir = 0;
            renderEntities();
            await sleep(500);
        }
        else if (cmd.type === 'move') {
            for (let i = 0; i < cmd.value; i++) {
                let nextX = robot.x;
                let nextY = robot.y;

                if (robot.dir === 0) nextY--;
                if (robot.dir === 1) nextX++;
                if (robot.dir === 2) nextY++;
                if (robot.dir === 3) nextX--;

                // Colisão com Parede
                if (walls.some(w => w.x === nextX && w.y === nextY)) {
                    handleCrash("Parede");
                    return;
                }

                // Colisão com Borda
                if (nextX < 0 || nextX >= gridSize || nextY < 0 || nextY >= gridSize) {
                    handleCrash("Borda");
                    return;
                }

                robot.x = nextX;
                robot.y = nextY;
                renderEntities();

                // Vitória da Fase
                if (checkWin()) {
                    await sleep(200);
                    alert("⭐ Estrela coletada! +100 Pontos");
                    score += 100;
                    updateStats();

                    randomizeTarget();
                    clearCommands();
                    isRunning = false;
                    document.getElementById('btnRun').disabled = false;
                    return;
                }
                await sleep(400);
            }
        }
    }

    // Se acabou os comandos e não chegou
    if (isRunning) {
        clearCommands();
        isRunning = false;
        document.getElementById('btnRun').disabled = false;
    }
}

function handleCrash(reason) {
    alert(`💥 Colisão (${reason})! -1 Vida`);
    lives--;
    updateStats();

    // Reseta posição e comandos
    robot = { x: 0, y: 0, dir: 1 };
    renderEntities();
    clearCommands();
    isRunning = false;
    document.getElementById('btnRun').disabled = false;

    if (lives <= 0) {
        gameOver();
    }
}

function gameOver() {
    const timeData = getFormattedTime();

    saveGameDataToDB('computacao', score, timeData.hours);

    document.getElementById('game-over-info').innerHTML = `Pontuação Final: ${score} <br> Tempo: ${timeData.string}`;
    document.getElementById('game-over-screen').classList.remove('hidden');
}

function checkWin() {
    return robot.x === target.x && robot.y === target.y;
}

function randomizeTarget() {
    // Nova posição para a estrela
    do {
        target.x = Math.floor(Math.random() * gridSize);
        target.y = Math.floor(Math.random() * gridSize);
    } while (
        walls.some(w => w.x === target.x && w.y === target.y) ||
        (target.x === robot.x && target.y === robot.y)
    );

    // Regenera labirinto ao redor das novas posições
    generateMaze();
    renderEntities();
}

function clearCommands() {
    commands = [];
    listEl.innerHTML = '';
}

function resetGame() {
    // Botão "Limpar Tudo" apenas reseta comandos e posição, não o jogo inteiro (score)
    robot = { x: 0, y: 0, dir: 1 };
    commands = [];
    listEl.innerHTML = '';
    isRunning = false;
    document.getElementById('btnRun').disabled = false;
    renderEntities();
}

function updateStats() {
    scoreEl.innerText = score;
    livesEl.innerText = lives;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function voltarMenu() {
    window.location.href = "../../dashboard.html"
}

// --- FUNÇÃO PARA SALVAR NO BANCO DE DADOS ---
async function saveGameDataToDB(gameType, score, durationHours) {
    const token = localStorage.getItem("authToken");
    if (!token) return; // Se não estiver logado, não salva no banco

    try {
        await fetch("http://localhost:4000/stats/update", {
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