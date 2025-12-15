// --- DADOS EDUCATIVOS ---
const facts = {
    brain: { title: "Cérebro", text: "O centro de comando! Ele consome cerca de 20% da energia do nosso corpo." },
    lungs: { title: "Pulmões", text: "Responsáveis por oxigenar o sangue. Se esticados, cobririam uma quadra de tênis!" },
    heart: { title: "Coração", text: "Bombeia o sangue. Ele bate cerca de 100.000 vezes por dia sem cansar." },
    stomach: { title: "Estômago", text: "Usa ácidos fortes para dissolver a comida. É como um liquidificador químico." },
    liver: { title: "Fígado", text: "O laboratório do corpo. Filtra toxinas e armazena energia. Fica do lado direito!" },
    intestines: { title: "Intestinos", text: "Onde os nutrientes são absorvidos. Podem ter até 7 metros de comprimento." }
};

const gridContainer = document.getElementById('background-grid');
const tileSize = 80;

function createGrid() {
    if(!gridContainer) return;
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
window.addEventListener('resize', createGrid);

// --- ELEMENTOS ---
const organs = document.querySelectorAll('.organ');
const zones = document.querySelectorAll('.drop-zone');
const infoPanel = document.getElementById('info-panel');
const infoTitle = document.getElementById('info-title');
const infoText = document.getElementById('info-text');
const victoryScreen = document.getElementById('victory-screen');

let organsPlaced = 0;
const totalOrgans = 6;

// --- AUDIO SYSTEM ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(554, audioCtx.currentTime + 0.2);
        osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
    }
}

// --- DRAG AND DROP LOGIC ---
organs.forEach(organ => {
    organ.addEventListener('dragstart', dragStart);
});

zones.forEach(zone => {
    zone.addEventListener('dragover', dragOver);
    zone.addEventListener('dragleave', dragLeave);
    zone.addEventListener('drop', drop);
});

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.organ);
    e.dataTransfer.effectAllowed = 'move';
    infoPanel.style.display = 'none';
}

function dragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-hover');
}

function dragLeave(e) {
    e.currentTarget.classList.remove('drag-hover');
}

function drop(e) {
    e.preventDefault();
    const zone = e.currentTarget;
    zone.classList.remove('drag-hover');

    const organType = e.dataTransfer.getData('text/plain');
    const targetType = zone.dataset.target;

    if (organType === targetType) {
        handleSuccess(organType, zone);
    } else {
        zone.style.borderColor = 'red';
        setTimeout(() => zone.style.borderColor = 'rgba(255, 255, 255, 0.3)', 300);
    }
}

function handleSuccess(type, zone) {
    playSound('success');

    // Mover o órgão
    const originalOrgan = document.querySelector(`.organ[data-organ="${type}"]`);
    const placedOrgan = originalOrgan.cloneNode(true);
    placedOrgan.classList.add('placed');
    placedOrgan.setAttribute('draggable', 'false');

    // Remove labels extras na versão colocada para ficar bonito
    const label = placedOrgan.querySelector('.organ-label');
    if(label) label.remove();

    zone.innerHTML = '';
    zone.appendChild(placedOrgan);
    zone.style.border = 'none';
    
    // Some com o original da bandeja
    originalOrgan.style.display = 'none'; // 'display: none' remove o espaço na bandeja horizontal

    showFact(type);

    organsPlaced++;
    if (organsPlaced === totalOrgans) {
        setTimeout(() => {
            playSound('win');
            victoryScreen.style.display = 'flex';
        }, 1000);
    }
}

function showFact(type) {
    const data = facts[type];
    infoTitle.innerText = data.title;
    infoText.innerText = data.text;
    infoPanel.style.display = 'block';
}