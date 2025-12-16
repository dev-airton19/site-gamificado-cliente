// script.js (VERSÃO FINAL - GRÁFICO MENOR)

const flipSound = new Audio('cardflip/card-flip.wav');
flipSound.preload = 'auto';
flipSound.volume = 1.0;

document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "https://site-gamificadoback-cliente.onrender.com/auth";
    const API_STATS = "https://site-gamificadoback-cliente.onrender.com/stats";

    // --- AUDIO & UI SETUP (MANTIDO IGUAL) ---
    const audioBtn = document.getElementById('audio-toggle');
    const audioIcon = audioBtn ? audioBtn.querySelector('i') : null;
    let savedState = localStorage.getItem('audioPreference');
    let isMuted = savedState === 'unmuted' ? false : true;

    function updateAudioUI() {
        if (audioBtn && audioIcon) {
            if (isMuted) {
                audioIcon.classList.remove('fa-volume-high');
                audioIcon.classList.add('fa-volume-xmark');
                audioBtn.style.color = '#555';
            } else {
                audioIcon.classList.remove('fa-volume-xmark');
                audioIcon.classList.add('fa-volume-high');
                audioBtn.style.color = '#ee0b39';
            }
        }
    }
    updateAudioUI();
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            localStorage.setItem('audioPreference', isMuted ? 'muted' : 'unmuted');
            updateAudioUI();
        });
    }

    const toggleSwitch = document.getElementById('reg-log');
    const cardWrapper = document.getElementById('card-wrapper');
    const loginLabel = document.getElementById('login-label');
    const signupLabel = document.getElementById('signup-label');

    if (toggleSwitch && cardWrapper) {
        toggleSwitch.addEventListener('change', () => {
            if (!isMuted) try { flipSound.currentTime=0; flipSound.play(); } catch(e){}
            if (toggleSwitch.checked) {
                cardWrapper.style.transform = 'rotateY(180deg)';
                loginLabel.classList.remove('active');
                signupLabel.classList.add('active');
            } else {
                cardWrapper.style.transform = 'rotateY(0deg)';
                signupLabel.classList.remove('active');
                loginLabel.classList.add('active');
            }
        });
    }

    // --- GRID SETUP ---
    const gridContainer = document.getElementById('background-grid');
    function createGrid() {
        if (!gridContainer) return;
        gridContainer.innerHTML = '';
        const tileSize = 80;
        const cols = Math.ceil(window.innerWidth / tileSize);
        const rows = Math.ceil(window.innerHeight / tileSize);
        const totalTiles = cols * rows;
        gridContainer.style.width = `${cols * tileSize}px`;
        gridContainer.style.height = `${rows * tileSize}px`;

        for (let i = 0; i < totalTiles; i++) {
            const tile = document.createElement('div');
            tile.classList.add('grid-tile');
            tile.style.width = `${tileSize}px`;
            tile.style.height = `${tileSize}px`;
            tile.addEventListener('mouseenter', () => tile.classList.add('active'));
            tile.addEventListener('mouseleave', () => setTimeout(() => tile.classList.remove('active'), 100));
            gridContainer.appendChild(tile);
        }
    }
    createGrid();
    window.addEventListener('resize', () => setTimeout(createGrid, 200));

    // --- NAVEGAÇÃO JOGOS ---
    const btnMat = document.getElementById("btn-matematica");
    if (btnMat) btnMat.addEventListener("click", () => window.location.href = "game/mat/matematica.html");
    const btnHis = document.getElementById("btn-historia");
    if (btnHis) btnHis.addEventListener("click", () => window.location.href = "game/his/historia.html");
    const btnCom = document.getElementById("btn-computacao");
    if (btnCom) btnCom.addEventListener("click", () => window.location.href = "game/com/computacao.html");
    const btnPor = document.getElementById("btn-portugues");
    if (btnPor) btnPor.addEventListener("click", () => window.location.href = "game/por/portugues.html");


    // ========== AUTH LOGIC ==========
    const btnRegister = document.getElementById("btn-register");
    const regName = document.getElementById("reg-name");
    const regEmail = document.getElementById("reg-email");
    const regPass = document.getElementById("reg-pass");

    const btnLogin = document.getElementById("btn-login");
    const loginEmail = document.getElementById("login-email");
    const loginPass = document.getElementById("login-pass");

    function validateEmail(email) { return /\S+@\S+\.\S+/.test(email); }

    if (btnRegister) {
        btnRegister.addEventListener("click", async () => {
            const name = regName.value.trim();
            const email = regEmail.value.trim();
            const password = regPass.value.trim();

            if (!name || !email || !password) return alert("Preencha todos os campos.");
            if (password.length < 6) return alert("Senha min 6 caracteres.");

            try {
                const res = await fetch(`${API_BASE}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.msg);

                alert("Conta criada! Faça login.");
                if (toggleSwitch) { toggleSwitch.checked = false; toggleSwitch.dispatchEvent(new Event('change')); }
                regName.value = ""; regEmail.value = ""; regPass.value = "";
            } catch (err) {
                alert(err.message);
            }
        });
    }

    if (btnLogin) {
        btnLogin.addEventListener("click", async () => {
            const email = loginEmail.value.trim();
            const password = loginPass.value.trim();
            if (!email || !password) return alert("Preencha os campos.");

            try {
                const res = await fetch(`${API_BASE}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.msg);

                localStorage.setItem("authToken", data.token);
                // Salva apenas nome e email basicos. Stats vêm do backend depois.
                localStorage.setItem("currentUser", JSON.stringify(data.user));

                alert(`Bem-vindo, ${data.user.name}!`);
                window.location.href = "index.html";
            } catch (err) {
                alert(err.message);
            }
        });
    }

    // --- ESQUECI SENHA (LÓGICA MANTIDA, RESUMIDA) ---
    const btnRecover = document.getElementById("btn-recover");
    const recoverEmailInput = document.getElementById("recover-email");
    const recoverStep1 = document.getElementById("recover-step-1");
    const recoverStep2 = document.getElementById("recover-step-2");
    const btnResetConfirm = document.getElementById("btn-reset-confirm");
    const resetTokenInput = document.getElementById("reset-token");
    const resetNewPassInput = document.getElementById("reset-new-pass");
    const loginSection = document.getElementById("login-section");
    const recoverSection = document.getElementById("recover-section");
    const linkForgot = document.getElementById("forgot-password"); // Link "Esqueci a senha" na tela de login
    const linkBackLogin = document.getElementById("link-back-login");

    if (linkForgot && loginSection && recoverSection) {
        linkForgot.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.classList.add('hidden');
            recoverSection.classList.remove('hidden');
        });
    }

    if (linkBackLogin) {
        linkBackLogin.addEventListener('click', (e) => {
            e.preventDefault();
            recoverSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
            setTimeout(() => {
                if(recoverStep1) recoverStep1.classList.remove('hidden');
                if(recoverStep2) recoverStep2.classList.add('hidden');
            }, 500);
        });
    }

    if (btnRecover) {
        btnRecover.addEventListener("click", async () => {
            const email = recoverEmailInput.value.trim();
            if(!email) return alert("Informe seu email.");
            try {
                const res = await fetch(`${API_BASE}/forgot-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if(!res.ok) throw new Error(data.msg);
                alert("Código enviado para o email.");
                recoverStep1.classList.add('hidden');
                recoverStep2.classList.remove('hidden');
            } catch(e) { alert(e.message); }
        });
    }

    if (btnResetConfirm) {
        btnResetConfirm.addEventListener("click", async () => {
            const email = recoverEmailInput.value.trim();
            const token = resetTokenInput.value.trim();
            const newPassword = resetNewPassInput.value.trim();
            try {
                const res = await fetch(`${API_BASE}/reset-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, token, newPassword })
                });
                const data = await res.json();
                if(!res.ok) throw new Error(data.msg);
                alert("Senha alterada! Faça login.");
                location.reload();
            } catch(e) { alert(e.message); }
        });
    }

    // ==========================================
    // --- MODAL, PERFIL E RANKING (REFATORADO) ---
    // ==========================================
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal');
    
    function openModal(htmlContent, callback) {
        if (modalOverlay && modalBody) {
            modalBody.innerHTML = htmlContent;
            modalOverlay.classList.remove('hidden');
            
            const logoutBtn = document.getElementById('action-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('authToken');
                    window.location.href = 'index.html'; // Assume index é login
                });
            }
            if (callback) callback();
        }
    }
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => modalOverlay.classList.add('hidden'));

    // --- PERFIL ---
    const btnProfile = document.getElementById('btn-profile');
    if (btnProfile) {
        btnProfile.addEventListener('click', async () => {
            const token = localStorage.getItem("authToken");
            const localUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!token || !localUser) return alert("Faça login novamente.");

            // Buscar stats REAIS do servidor
            let userStats;
            try {
                const res = await fetch(`${API_STATS}/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if(res.ok) userStats = await res.json();
                else throw new Error();
            } catch(e) {
                // Fallback se der erro
                userStats = {
                    scores: { matematica: 0, computacao: 0, portugues: 0, historia: 0 },
                    highScores: { matematica: 0, computacao: 0, portugues: 0, historia: 0 },
                    hours: { matematica: 0, computacao: 0, portugues: 0, historia: 0 }
                };
            }

            const subjects = [
                { id: 'matematica', label: 'Matemática', icon: 'fa-calculator' },
                { id: 'computacao', label: 'Computação', icon: 'fa-laptop-code' },
                { id: 'portugues', label: 'Português', icon: 'fa-book' },
                { id: 'historia', label: 'História', icon: 'fa-landmark' }
            ];

            let statsHtml = '<div class="profile-stats-list" id="stats-container">';
            subjects.forEach(sub => {
                const total = userStats.scores[sub.id] || 0;
                const high = userStats.highScores[sub.id] || 0;
                statsHtml += `
                    <div class="stat-row">
                        <div class="stat-name"><i class="fas ${sub.icon}" style="color: #ee0b39; width:20px;"></i> ${sub.label}</div>
                        <div class="stat-values">
                            <div>Total: ${total} pts</div>
                            <div style="font-size:0.75rem; color:#888;">Recorde: <span class="stat-val-highlight">${high}</span></div>
                        </div>
                    </div>`;
            });
            statsHtml += '</div>';

            const html = `
                <h3 class="modal-title">Meu Perfil</h3>
                <div style="margin-bottom: 20px;">
                    <i class="fas fa-user-circle" style="font-size: 3rem; color: #fff;"></i>
                    <h4 style="margin-top: 10px; font-size: 1.2rem;">${localUser.name}</h4>
                </div>
                ${statsHtml}
                <button id="btn-show-graph" class="btn-view-graph"><i class="fas fa-chart-pie"></i> Ver Gráfico</button>
                <div id="graph-wrapper" class="graph-section" style="display:none;">
                    <div class="chart-container" style="width: 180px; height: 180px;"><canvas id="hoursChart"></canvas></div>
                </div>
                <button id="action-logout" class="btn btn-logout">SAIR DA CONTA</button>
            `;

            openModal(html, () => {
                const btnShowGraph = document.getElementById('btn-show-graph');
                const graphWrapper = document.getElementById('graph-wrapper');
                const statsContainer = document.getElementById('stats-container');

                if (btnShowGraph) {
                    btnShowGraph.addEventListener('click', () => {
                        statsContainer.style.display = 'none';
                        btnShowGraph.style.display = 'none';
                        graphWrapper.style.display = 'block';

                        const ctx = document.getElementById('hoursChart');
                        if (ctx && typeof Chart !== 'undefined') {
                            new Chart(ctx, {
                                type: 'pie',
                                data: {
                                    labels: ['Matemática', 'Computação', 'Português', 'História'],
                                    datasets: [{
                                        data: [
                                            userStats.hours.matematica,
                                            userStats.hours.computacao,
                                            userStats.hours.portugues,
                                            userStats.hours.historia
                                        ],
                                        backgroundColor: ['#ee0b39', '#ffffff', '#222222', '#666666'],
                                        borderWidth: 0,
                                        hoverOffset: 20 // Efeito de profundidade
                                    }]
                                },
                                options: { 
                                    responsive: true, 
                                    plugins: { 
                                        legend: { 
                                            display: false // Sem nomes em cima
                                        },
                                        tooltip: {
                                            callbacks: {
                                                // Formatação Horas e Minutos
                                                label: function(context) {
                                                    let value = context.raw || 0;
                                                    let h = Math.floor(value);
                                                    let m = Math.round((value - h) * 60);
                                                    return ` ${context.label}: ${h} hr ${m} min`;
                                                }
                                            }
                                        }
                                    } 
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    // --- RANKING (TOP RECORDISTAS DO SERVIDOR) ---
    const navRanking = document.getElementById('nav-ranking');
    const navPontos = document.getElementById('nav-pontos');

    async function showRankingModal(title, subtitle) {
        // Busca ranking real do backend
        let rankingData;
        try {
            const res = await fetch(`${API_STATS}/ranking`);
            if(res.ok) rankingData = await res.json();
            else throw new Error();
        } catch(e) {
            rankingData = { 
                matematica: {name: '-', high_score: 0}, 
                computacao: {name: '-', high_score: 0},
                portugues: {name: '-', high_score: 0},
                historia: {name: '-', high_score: 0}
            };
        }

        const subjects = [
            { id: 'matematica', label: 'Matemática', icon: 'fa-calculator' },
            { id: 'computacao', label: 'Computação', icon: 'fa-laptop-code' },
            { id: 'portugues', label: 'Português', icon: 'fa-book' },
            { id: 'historia', label: 'História', icon: 'fa-landmark' }
        ];

        let listHtml = '<div class="ranking-list">';
        subjects.forEach(sub => {
            const data = rankingData[sub.id] || { name: '---', high_score: 0 };
            listHtml += `
                <div class="record-game-item">
                    <div class="record-icon"><i class="fas ${sub.icon}"></i></div>
                    <div class="record-details">
                        <span class="record-subject">${sub.label}</span>
                        <span class="record-player">${data.name}</span>
                        <span class="record-score">Recorde: ${data.high_score}</span>
                    </div>
                </div>
            `;
        });
        listHtml += '</div>';

        const html = `
            <h3 class="modal-title"><i class="fas fa-trophy"></i> ${title}</h3>
            <p style="font-size: 0.8rem; color: #888; margin-bottom: 15px;">${subtitle}</p>
            ${listHtml}
        `;
        openModal(html);
    }

    if (navRanking) {
        navRanking.addEventListener('click', (e) => {
            e.preventDefault();
            showRankingModal("Recordistas", "Melhores pontuações únicas globais");
        });
    }
    if (navPontos) {
        navPontos.addEventListener('click', (e) => {
            e.preventDefault();
            showRankingModal("Melhores por Jogo", "Quem domina cada matéria");
        });
    }
});