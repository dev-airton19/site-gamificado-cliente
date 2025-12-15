// --- DADOS DOS ESTADOS ---
// Nota: As coordenadas (top/left) podem precisar de ajustes finos dependendo 
// da proporção exata da sua imagem 'brasil_fundo.png'.
const states = [
    { id: 'AC', name: 'Acre', capital: 'Rio Branco', pop: '906 mil', climate: 'Equatorial', top: 48, left: 15, fact: 'Último estado a ser incorporado.' },
    { id: 'AL', name: 'Alagoas', capital: 'Maceió', pop: '3,3 milhões', climate: 'Tropical', top: 52, left: 88, fact: 'Conhecido como Caribe Brasileiro.' },
    { id: 'AM', name: 'Amazonas', capital: 'Manaus', pop: '4,2 milhões', climate: 'Equatorial', top: 30, left: 28, fact: 'Maior estado do Brasil.' },
    { id: 'AP', name: 'Amapá', capital: 'Macapá', pop: '877 mil', climate: 'Equatorial', top: 12, left: 55, fact: 'Cortado pela linha do Equador.' },
    { id: 'BA', name: 'Bahia', capital: 'Salvador', pop: '14,9 milhões', climate: 'Tropical', top: 52, left: 75, fact: 'Terra do descobrimento.' },
    { id: 'CE', name: 'Ceará', capital: 'Fortaleza', pop: '9,2 milhões', climate: 'Tropical Semiárido', top: 25, left: 80, fact: 'Terra do humor e praias.' },
    { id: 'DF', name: 'Distrito Federal', capital: 'Brasília', pop: '3 milhões', climate: 'Tropical de Altitude', top: 55, left: 58, fact: 'Abriga a capital do país.' },
    { id: 'ES', name: 'Espírito Santo', capital: 'Vitória', pop: '4,1 milhões', climate: 'Tropical Litorâneo', top: 65, left: 78, fact: 'Grande produtor de café.' },
    { id: 'GO', name: 'Goiás', capital: 'Goiânia', pop: '7,2 milhões', climate: 'Tropical', top: 55, left: 52, fact: 'Coração do sertanejo.' },
    { id: 'MA', name: 'Maranhão', capital: 'São Luís', pop: '7,1 milhões', climate: 'Tropical', top: 28, left: 65, fact: 'Lar dos Lençóis Maranhenses.' },
    { id: 'MG', name: 'Minas Gerais', capital: 'Belo Horizonte', pop: '21,4 milhões', climate: 'Tropical de Altitude', top: 62, left: 68, fact: 'Famoso pelo pão de queijo.' },
    { id: 'MS', name: 'Mato Grosso do Sul', capital: 'Campo Grande', pop: '2,8 milhões', climate: 'Tropical', top: 68, left: 40, fact: 'Famoso pelo Pantanal.' },
    { id: 'MT', name: 'Mato Grosso', capital: 'Cuiabá', pop: '3,5 milhões', climate: 'Tropical', top: 45, left: 40, fact: 'Gigante da soja.' },
    { id: 'PA', name: 'Pará', capital: 'Belém', pop: '8,7 milhões', climate: 'Equatorial', top: 25, left: 50, fact: 'Mercado Ver-o-Peso.' },
    { id: 'PB', name: 'Paraíba', capital: 'João Pessoa', pop: '4 milhões', climate: 'Tropical', top: 32, left: 88, fact: 'Ponta mais oriental das Américas.' },
    { id: 'PE', name: 'Pernambuco', capital: 'Recife', pop: '9,6 milhões', climate: 'Tropical', top: 38, left: 87, fact: 'Famoso pelo Frevo.' },
    { id: 'PI', name: 'Piauí', capital: 'Teresina', pop: '3,2 milhões', climate: 'Tropical', top: 32, left: 72, fact: 'Serra da Capivara.' },
    { id: 'PR', name: 'Paraná', capital: 'Curitiba', pop: '11,5 milhões', climate: 'Subtropical', top: 78, left: 52, fact: 'Cataratas do Iguaçu.' },
    { id: 'RJ', name: 'Rio de Janeiro', capital: 'Rio de Janeiro', pop: '17,4 milhões', climate: 'Tropical Atlântico', top: 72, left: 75, fact: 'Cristo Redentor.' },
    { id: 'RN', name: 'Rio Grande do Norte', capital: 'Natal', pop: '3,5 milhões', climate: 'Tropical', top: 28, left: 86, fact: 'Maior produtor de sal.' },
    { id: 'RO', name: 'Rondônia', capital: 'Porto Velho', pop: '1,8 milhões', climate: 'Equatorial', top: 45, left: 25, fact: 'Fronteira com Bolívia.' },
    { id: 'RR', name: 'Roraima', capital: 'Boa Vista', pop: '652 mil', climate: 'Equatorial', top: 12, left: 32, fact: 'Estado menos populoso.' },
    { id: 'RS', name: 'Rio Grande do Sul', capital: 'Porto Alegre', pop: '11,4 milhões', climate: 'Subtropical', top: 88, left: 48, fact: 'Terra do chimarrão.' },
    { id: 'SC', name: 'Santa Catarina', capital: 'Florianópolis', pop: '7,3 milhões', climate: 'Subtropical', top: 82, left: 55, fact: 'Praias e serras.' },
    { id: 'SE', name: 'Sergipe', capital: 'Aracaju', pop: '2,3 milhões', climate: 'Tropical', top: 50, left: 85, fact: 'Menor estado do país.' },
    { id: 'SP', name: 'São Paulo', capital: 'São Paulo', pop: '46,6 milhões', climate: 'Tropical', top: 70, left: 60, fact: 'Estado mais populoso.' },
    { id: 'TO', name: 'Tocantins', capital: 'Palmas', pop: '1,6 milhões', climate: 'Tropical', top: 40, left: 57, fact: 'Estado mais jovem.' }
];

const pieceBox = document.getElementById('piece-box');
const mapContainer = document.getElementById('map-container');
const infoBox = document.getElementById('info-box');
const victoryOverlay = document.getElementById('victory-overlay');
let score = 0;

// --- AUDIO (Opcional) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'win') {
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    }

    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.stop(audioCtx.currentTime + 0.2);
}

// --- INICIALIZAÇÃO ---
function initGame() {
    // Embaralhar estados
    const shuffledStates = [...states].sort(() => Math.random() - 0.5);

    shuffledStates.forEach(state => {
        // 1. Criar a PEÇA (Agora é uma Imagem)
        const piece = document.createElement('img');
        // CORREÇÃO: Usando state.id para carregar o arquivo correto (ex: img/AC.png)
        piece.src = `img/${state.id}.png`; 
        piece.alt = state.name;
        piece.classList.add('piece');
        piece.id = `piece-${state.id}`;
        
        // Habilitar Drag
        piece.draggable = true;
        piece.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', state.id);
            infoBox.style.display = 'none'; // Esconder info antiga ao pegar nova peça
        });

        pieceBox.appendChild(piece);

        // 2. Criar a ZONA DE DROP (Alvo invisível no mapa)
        const zone = document.createElement('div');
        zone.classList.add('drop-zone');
        // Posicionamento percentual relativo ao container do mapa
        zone.style.top = state.top + '%';
        zone.style.left = state.left + '%';
        zone.dataset.state = state.id;

        // Eventos de Drop
        zone.addEventListener('dragover', (e) => e.preventDefault());
        zone.addEventListener('drop', handleDrop);

        mapContainer.appendChild(zone);
    });
}

function handleDrop(e) {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    const zoneId = e.target.dataset.state;

    // Verificar se o ID da peça bate com o ID da zona
    if (draggedId === zoneId) {
        // ACERTOU
        playTone('win');

        const piece = document.getElementById(`piece-${draggedId}`);
        piece.draggable = false;
        piece.classList.add('placed');

        // Mover a peça (imagem) para dentro da zona de drop no mapa
        // A classe .placed e o CSS cuidarão de centralizar e travar
        e.target.appendChild(piece);
        
        // Mostrar dados completos
        const stateData = states.find(s => s.id === draggedId);
        showInfo(stateData);

        score++;
        if (score === states.length) {
            setTimeout(() => victoryOverlay.style.display = 'flex', 1000);
        }
    } else {
        // ERROU
        playTone('error');
    }
}

function showInfo(data) {
    // Preenche os campos HTML com os dados do objeto
    document.getElementById('state-name').innerText = data.name;
    document.getElementById('state-capital').innerText = data.capital;
    document.getElementById('state-pop').innerText = data.pop;
    document.getElementById('state-climate').innerText = data.climate;
    document.getElementById('state-fact').innerText = data.fact;
    
    infoBox.style.display = 'block';
}

initGame();