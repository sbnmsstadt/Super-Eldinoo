const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn1 = document.getElementById('start-button-1');
const startBtn2 = document.getElementById('start-button-2');
const restartBtn = document.getElementById('restart-button');
const finalScoreEl = document.getElementById('final-score');
const winScreen = document.getElementById('win-screen');
const winScoreEl = document.getElementById('win-score');
const winRestartBtn = document.getElementById('win-restart-button');
const settingsBtn = document.getElementById('settings-button');
const settingsScreen = document.getElementById('settings-screen');
const settingsBackBtn = document.getElementById('settings-back-button');
const volumeSlider = document.getElementById('volume-slider');
const languageSelect = document.getElementById('language-select');
const pauseBtn = document.getElementById('pause-button');

// Translation data
const translations = {
    de: {
        title: "SUPER ELDINOOO",
        startTitle: "Bist du bereit?",
        controlsP1: "Spieler 1 (Mario): WASD",
        controlsP2: "Spieler 2 (Luigi): Pfeiltasten",
        btn1Player: "1 SPIELER",
        btn2Player: "2 SPIELER",
        settingsTitle: "EINSTELLUNGEN",
        labelVolume: "Lautstärke Musik",
        labelLanguage: "Sprache",
        btnBack: "ZURÜCK",
        btnResume: "WEITER",
        pause: "PAUSE",
        gameOver: "GAME OVER",
        score: "SCORE",
        coins: "COINS",
        finalScore: "Dein Score",
        btnRetry: "ERNEUT VERSUCHEN",
        winTitle: "SIEG!",
        winMsg: "Du hast es geschafft!",
        btnPlayAgain: "NOCHMAL SPIELEN"
    },
    en: {
        title: "SUPER ELDINOOO",
        startTitle: "Are you ready?",
        controlsP1: "Player 1 (Mario): WASD",
        controlsP2: "Player 2 (Luigi): Arrow Keys",
        btn1Player: "1 PLAYER",
        btn2Player: "2 PLAYER",
        settingsTitle: "SETTINGS",
        labelVolume: "Music Volume",
        labelLanguage: "Language",
        btnBack: "BACK",
        btnResume: "RESUME",
        pause: "PAUSE",
        gameOver: "GAME OVER",
        score: "SCORE",
        coins: "COINS",
        finalScore: "Your Score",
        btnRetry: "RETRY",
        winTitle: "VICTORY!",
        winMsg: "You made it!",
        btnPlayAgain: "PLAY AGAIN"
    },
    bs: {
        title: "SUPER ELDINOOO",
        startTitle: "Jeste li spremni?",
        controlsP1: "Igrač 1 (Mario): WASD",
        controlsP2: "Igrač 2 (Luigi): Strelice",
        btn1Player: "1 IGRAČ",
        btn2Player: "2 IGRAČA",
        settingsTitle: "POSTAVKE",
        labelVolume: "Jačina muzike",
        labelLanguage: "Jezik",
        btnBack: "NAZAD",
        btnResume: "NASTAVI",
        pause: "PAUZA",
        gameOver: "KRAJ IGRE",
        score: "BODOVI",
        coins: "NOVIĆI",
        finalScore: "Vaš rezultat",
        btnRetry: "POKUŠAJ PONOVO",
        winTitle: "POBJEDA!",
        winMsg: "Uspjeli ste!",
        btnPlayAgain: "IGRAJ PONOVO"
    },
    ro: {
        title: "SUPER ELDINOOO",
        startTitle: "Ești gata?",
        controlsP1: "Jucător 1 (Mario): WASD",
        controlsP2: "Jucător 2 (Luigi): Săgeți",
        btn1Player: "1 JUCĂTOR",
        btn2Player: "2 JUCĂTORI",
        settingsTitle: "SETĂRI",
        labelVolume: "Volum Muzică",
        labelLanguage: "Limbă",
        btnBack: "ÎNAPOI",
        btnResume: "CONTINUĂ",
        pause: "PAUZĂ",
        gameOver: "SFÂRȘITUL JOCULUI",
        score: "SCOR",
        coins: "MONEDE",
        finalScore: "Scorul tău",
        btnRetry: "REÎNCEARCĂ",
        winTitle: "VICTORIE!",
        winMsg: "Ai reușit!",
        btnPlayAgain: "JOACĂ DIN NOU"
    },
    sr: {
        title: "SUPER ELDINOOO",
        startTitle: "Da li ste spremni?",
        controlsP1: "Igrač 1 (Mario): WASD",
        controlsP2: "Igrač 2 (Luigi): Strelice",
        btn1Player: "1 IGRAČ",
        btn2Player: "2 IGRAČA",
        settingsTitle: "PODEŠAVANJA",
        labelVolume: "Jačina muzike",
        labelLanguage: "Jezik",
        btnBack: "NAZAD",
        btnResume: "NASTAVI",
        pause: "PAUZA",
        gameOver: "KRAJ IGRE",
        score: "BODOVI",
        coins: "NOVČIĆI",
        finalScore: "Vaš rezultat",
        btnRetry: "POKUŠAJ PONOVO",
        winTitle: "POBEDA!",
        winMsg: "Uspeli ste!",
        btnPlayAgain: "IGRAJ PONOVO"
    },
    tr: {
        title: "SUPER ELDINOOO",
        startTitle: "Hazır mısın?",
        controlsP1: "Oyuncu 1 (Mario): WASD",
        controlsP2: "Oyuncu 2 (Luigi): Ok Tuşları",
        btn1Player: "1 OYUNCU",
        btn2Player: "2 OYUNCU",
        settingsTitle: "AYARLAR",
        labelVolume: "Müzik Sesi",
        labelLanguage: "Dil",
        btnBack: "GERİ",
        btnResume: "DEVAM ET",
        pause: "DURAKLAT",
        gameOver: "OYUN BİTTİ",
        score: "SKOR",
        coins: "COINS",
        finalScore: "Skorun",
        btnRetry: "TEKRAR DENE",
        winTitle: "ZAFER!",
        winMsg: "Başardın!",
        btnPlayAgain: "TEKRAR OYNA"
    }
};

let currentLanguage = 'de';
let isPaused = false;


// Game constants
const TILE_SIZE = 32;
const GRAVITY = 0.5;
const JUMP_FORCE = -15; // Increased jump power for larger character
const MOVE_SPEED = 5;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 480;

// Game state
let score = 0;
let coins = 0;
let isGameOver = false;
let isGameRunning = false;
let cameraX = 0;

// Assets
const marioImg = new Image();
marioImg.src = 'assets/mario.png';
const luigiImg = new Image();
luigiImg.src = 'assets/luigi.png';
const tilesImg = new Image();
tilesImg.src = 'assets/tiles.png';
const coinImg = new Image();
coinImg.src = 'assets/coin.png';
const monsterImg = new Image();
monsterImg.src = 'assets/monster.png';
const houseImg = new Image();
houseImg.src = 'assets/house_tile.png';

// Audio assets
const jumpSound = new Audio('sounds/jump.mp3');
const killSound = new Audio('sounds/kill.mp3');
const gameOverSound = new Audio('sounds/gameover.mp3');
const bgMusic = new Audio('sounds/backgroundmusic.mp3');
bgMusic.loop = true;

function updateVolumes() {
    const vol = parseFloat(volumeSlider.value);
    bgMusic.volume = vol;
    jumpSound.volume = vol * 0.7;
    killSound.volume = vol * 0.7;
    gameOverSound.volume = vol;
}
updateVolumes();

// Input handling
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Tilemap (0: air, 1: ground/grass, 2: brick, 3: pipe, 4: coin)
// Initial map (400 columns) - to be extended programmatically
const map = [];
function initMap() {
    for (let r = 0; r < 15; r++) {
        map[r] = new Array(400).fill(0);
    }

    // Procedural generation across 400 columns
    for (let c = 0; c < 400; c++) {
        // Ground (with some holes/pits)
        // Ensure starting area is safe
        if (c < 10 || c > 390) {
            map[13][c] = 1;
            map[14][c] = 1;
        } else if (map[13][c - 1] === 1) { // If previous was ground
            if (Math.random() > 0.12) { // 88% chance to continue ground
                map[13][c] = 1;
                map[14][c] = 1;
            } else { // Start a gap
                let gapWidth = 2 + Math.floor(Math.random() * 2); // 2-3 tiles wide
                c += gapWidth;
                // After gap, ensure we have ground again
                if (c < 400) {
                    map[13][c] = 1;
                    map[14][c] = 1;
                }
            }
        } else {
            map[13][c] = 1;
            map[14][c] = 1;
        }

        // Random Features
        if (c > 5 && c % 12 === 0) { // Pipes
            if (map[13][c] === 1) { // Only place pipe on ground
                map[11][c] = 3;
                map[12][c] = 3;
                if (Math.random() > 0.5) map[10][c] = 4; // Coin on top of some pipes
            }
        }

        if (c > 2 && c % 8 === 0) { // Platforms / Bricks
            let h = 7 + Math.floor(Math.random() * 3);
            let len = 2 + Math.floor(Math.random() * 4);
            for (let i = 0; i < len; i++) {
                if (c + i < 400) {
                    map[h][c + i] = 2;
                    if (Math.random() > 0.7) map[h - 1][c + i] = 4; // Coin on top
                }
            }
        }

        if (c > 30 && c % 45 === 0 && map[13][c] === 1) { // Houses
            let houseWidth = 3 + Math.floor(Math.random() * 3);
            let houseHeight = 4 + Math.floor(Math.random() * 3);
            for (let h = 0; h < houseHeight; h++) {
                for (let w = 0; w < houseWidth; w++) {
                    if (c + w < 400) {
                        map[12 - h][c + w] = 6; // House tile
                    }
                }
            }
            // Add a roof (optional detail)
            for (let w = -1; w <= houseWidth; w++) {
                if (c + w >= 0 && c + w < 400) {
                    map[12 - houseHeight][c + w] = 6;
                }
            }
        }
    }
}
initMap();

function applyLanguage(lang) {
    const t = translations[lang];
    document.querySelector('h1').innerText = t.title;
    document.querySelector('#start-screen h2').innerText = t.startTitle;
    document.querySelector('#start-screen p').innerHTML = `${t.controlsP1}<br>${t.controlsP2}`;
    document.getElementById('start-button-1').innerText = t.btn1Player;
    document.getElementById('start-button-2').innerText = t.btn2Player;

    document.getElementById('settings-title').innerText = isPaused ? t.pause : t.settingsTitle;
    document.getElementById('label-volume').innerText = t.labelVolume;
    document.getElementById('label-language').innerText = t.labelLanguage;
    document.getElementById('settings-back-button').innerText = isPaused ? t.btnResume : t.btnBack;

    document.querySelector('#game-over-screen h2').innerText = t.gameOver;
    document.getElementById('final-score-label').innerText = t.finalScore;
    document.getElementById('restart-button').innerText = t.btnRetry;

    document.querySelector('#win-screen h2').innerText = t.winTitle;
    document.getElementById('win-message').innerText = t.winMsg;
    document.getElementById('win-score-label').innerText = t.finalScore;
    document.getElementById('win-restart-button').innerText = t.btnPlayAgain;

    document.getElementById('score-label').innerText = t.score;
    document.getElementById('coins-label').innerText = t.coins;
}

let players = [];
let isTwoPlayerMode = false;

function createPlayer(x, y, img, controls) {
    return {
        x: x,
        y: y,
        width: 48,
        height: 96,
        dx: 0,
        dy: 0,
        grounded: false,
        jumpCount: 0,
        isBig: true,
        invincible: 0,
        img: img,
        controls: controls,
        alive: true
    };
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.dx = -2;
        this.dy = 0;
        this.alive = true;
    }

    update() {
        if (!this.alive) return;

        // Apply gravity
        this.dy += GRAVITY;
        this.x += this.dx;
        this.y += this.dy;

        this.checkTileCollisions();
    }

    checkTileCollisions() {
        // Simple tile collision for side reversal
        const col = Math.floor((this.dx > 0 ? this.x + this.width : this.x) / TILE_SIZE);
        const row = Math.floor((this.y + this.height / 2) / TILE_SIZE);

        if (map[row] && map[row][col] && map[row][col] !== 0 && map[row][col] !== 4 && map[row][col] !== 5) {
            this.dx *= -1;
        }

        // Ground collision
        const groundRow = Math.floor((this.y + this.height) / TILE_SIZE);
        const groundCol = Math.floor((this.x + this.width / 2) / TILE_SIZE);
        if (map[groundRow] && map[groundRow][groundCol] && map[groundRow][groundCol] !== 0 && map[groundRow][groundCol] !== 4 && map[groundRow][groundCol] !== 5) {
            this.y = groundRow * TILE_SIZE - this.height;
            this.dy = 0;
        }
    }

    draw() {
        if (!this.alive) return;
        if (monsterImg.complete) {
            ctx.drawImage(monsterImg, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'purple';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class FlyingEnemy extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.baseY = y;
        this.angle = Math.random() * Math.PI * 2;
        this.amplitude = 50;
        this.speedY = 0.05;
        this.dx = -1.5; // Slightly slower horizontal movement
    }

    update() {
        if (!this.alive) return;

        // Oscillate vertically using sine wave
        this.angle += this.speedY;
        this.y = this.baseY + Math.sin(this.angle) * this.amplitude;

        // Move horizontally
        this.x += this.dx;

        // Check only side collisions (pipes/bricks) to reverse direction
        const col = Math.floor((this.dx > 0 ? this.x + this.width : this.x) / TILE_SIZE);
        const row = Math.floor((this.y + this.height / 2) / TILE_SIZE);
        if (map[row] && map[row][col] && map[row][col] !== 0 && map[row][col] !== 4 && map[row][col] !== 5) {
            this.dx *= -1;
        }

        // World boundaries
        if (this.x < 0) this.dx = Math.abs(this.dx);
    }
}

let enemies = [];

class Cloud {
    constructor(x, y, scale) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.speed = scale * 0.5; // Parallax speed
    }

    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(this.x - (cameraX * this.speed * 0.2), this.y, 20 * this.scale, 0, Math.PI * 2);
        ctx.arc(this.x + 15 * this.scale - (cameraX * this.speed * 0.2), this.y - 10 * this.scale, 20 * this.scale, 0, Math.PI * 2);
        ctx.arc(this.x + 30 * this.scale - (cameraX * this.speed * 0.2), this.y, 20 * this.scale, 0, Math.PI * 2);
        ctx.fill();
    }
}

let clouds = [];

function initClouds() {
    clouds = [];
    for (let i = 0; i < 80; i++) {
        clouds.push(new Cloud(
            Math.random() * 13000,
            Math.random() * 250,
            0.5 + Math.random() * 1.5
        ));
    }
}

class Building {
    constructor(x, y, width, height, speed, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
        this.windows = [];
        this.generateWindows();
    }

    generateWindows() {
        const rows = Math.floor(this.height / 20);
        const cols = Math.floor(this.width / 15);
        for (let r = 1; r < rows - 1; r++) {
            for (let c = 1; c < cols - 1; c++) {
                if (Math.random() > 0.3) {
                    this.windows.push({
                        x: c * 15,
                        y: r * 20,
                        lit: Math.random() > 0.7
                    });
                }
            }
        }
    }

    draw() {
        const drawX = this.x - (cameraX * this.speed);
        if (drawX + this.width < 0 || drawX > CANVAS_WIDTH) return;

        // Draw building body
        ctx.fillStyle = this.color;
        ctx.fillRect(drawX, this.y, this.width, this.height);

        // Draw windows
        this.windows.forEach(w => {
            ctx.fillStyle = w.lit ? '#FFD700' : 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(drawX + w.x, this.y + w.y, 8, 12);
        });
    }
}

let buildings = [];

function initBuildings() {
    buildings = [];
    const colors = ['#2c3e50', '#34495e', '#1a252f', '#2c2c2c'];
    for (let i = 0; i < 60; i++) {
        const width = 60 + Math.random() * 100;
        const height = 150 + Math.random() * 300;
        buildings.push(new Building(
            Math.random() * 13000,
            CANVAS_HEIGHT - height,
            width,
            height,
            0.4 + Math.random() * 0.2,
            colors[Math.floor(Math.random() * colors.length)]
        ));
    }
}

function resetGame(twoPlayer = false) {
    score = 0;
    coins = 0;
    isGameOver = false;
    isGameRunning = true;
    isPaused = false;
    isTwoPlayerMode = twoPlayer;
    cameraX = 0;

    pauseBtn.classList.remove('hidden');

    players = [];
    // P1 Mario (WASD)
    players.push(createPlayer(100, 350, marioImg, {
        up: 'KeyW',
        left: 'KeyA',
        right: 'KeyD'
    }));

    if (isTwoPlayerMode) {
        // P2 Luigi (Arrows)
        players.push(createPlayer(150, 350, luigiImg, {
            up: 'ArrowUp',
            left: 'ArrowLeft',
            right: 'ArrowRight'
        }));
    }

    scoreEl.innerText = score;
    coinsEl.innerText = coins;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    winScreen.classList.add('hidden');

    // Spawn enemies across the 400 columns
    enemies = [];
    for (let i = 0; i < 25; i++) {
        let ex = 500 + i * 500 + Math.random() * 200;
        if (Math.random() > 0.3) {
            enemies.push(new Enemy(ex, 350));
        } else {
            enemies.push(new FlyingEnemy(ex, 100 + Math.random() * 200));
        }
    }

    // Initialize clouds and buildings
    initClouds();
    initBuildings();

    // Start background music
    bgMusic.currentTime = 0;
    bgMusic.play().catch(e => console.log("Audio play blocked:", e));

    // Reiniciar mapa para monedas
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 5) map[r][c] = 4; // Reset collected coins (stored as 5 internally)
        }
    }
}

function update() {
    if (!isGameRunning || isGameOver || isPaused) return;

    players.forEach(player => {
        if (!player.alive) return;

        // Movement
        if (keys[player.controls.right]) player.dx = MOVE_SPEED;
        else if (keys[player.controls.left]) player.dx = -MOVE_SPEED;
        else player.dx = 0;

        if (keys[player.controls.up] && player.grounded) {
            player.dy = JUMP_FORCE;
            player.grounded = false;
            jumpSound.currentTime = 0;
            jumpSound.play().catch(e => console.log("Audio play blocked:", e));
        }

        // Apply gravity
        player.dy += GRAVITY;
        player.x += player.dx;
        player.y += player.dy;

        // Boundary check
        if (player.x < 0) player.x = 0;

        // Tile collisions
        checkCollisions(player);

        if (player.invincible > 0) player.invincible--;

        // Death by falling
        if (player.y > CANVAS_HEIGHT) endGame();

        // Win condition
        if (player.x > (map[0].length * TILE_SIZE) - 150) {
            winGame();
        }
    });

    enemies.forEach(enemy => {
        enemy.update();

        // Player-Enemy collision
        players.forEach(player => {
            if (!player.alive) return;
            if (enemy.alive &&
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {

                // Check if jumping on top
                if (player.dy > 0 && player.y + player.height < enemy.y + enemy.height / 2) {
                    enemy.alive = false;
                    killSound.currentTime = 0;
                    killSound.play().catch(e => console.log("Audio play blocked:", e));
                    player.dy = JUMP_FORCE / 1.5; // Small bounce
                    score += 500;
                    scoreEl.innerText = score;
                } else if (player.invincible <= 0) {
                    if (player.isBig) {
                        player.isBig = false;
                        player.invincible = 120; // ~2 seconds at 60fps
                        player.width = 32;
                        player.height = 64;
                    } else {
                        endGame();
                    }
                }
            }
        });
    });

    // Camera following (follows first player)
    if (players[0] && players[0].x > CANVAS_WIDTH / 2) {
        cameraX = players[0].x - CANVAS_WIDTH / 2;
    }
}

function checkCollisions(player) {
    player.grounded = false;

    // Check tiles around player
    const startCol = Math.floor(player.x / TILE_SIZE);
    const endCol = Math.floor((player.x + player.width) / TILE_SIZE);
    const startRow = Math.floor(player.y / TILE_SIZE);
    const endRow = Math.floor((player.y + player.height) / TILE_SIZE);

    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            if (!map[r] || !map[r][c]) continue;

            const tileType = map[r][c];
            if (tileType === 0 || tileType === 5) continue; // Air or collected coin

            const tx = c * TILE_SIZE;
            const ty = r * TILE_SIZE;

            if (tileType === 4) { // Coin
                map[r][c] = 5; // Mark as collected
                coins++;
                score += 100;
                coinsEl.innerText = coins;
                scoreEl.innerText = score;
                continue;
            }

            // AABB Collision
            if (player.x < tx + TILE_SIZE &&
                player.x + player.width > tx &&
                player.y < ty + TILE_SIZE &&
                player.y + player.height > ty) {

                // Determine collision side
                const overlapX = Math.min(player.x + player.width - tx, tx + TILE_SIZE - player.x);
                const overlapY = Math.min(player.y + player.height - ty, ty + TILE_SIZE - player.y);

                if (overlapX > overlapY) {
                    if (player.dy > 0 && player.y < ty) { // Top collision
                        player.y = ty - player.height;
                        player.dy = 0;
                        player.grounded = true;
                    } else if (player.dy < 0 && player.y > ty) { // Bottom collision
                        player.y = ty + TILE_SIZE;
                        player.dy = 0;
                    }
                } else {
                    if (player.dx > 0 && player.x < tx) { // Left collision
                        player.x = tx - player.width;
                    } else if (player.dx < 0 && player.x > tx) { // Right collision
                        player.x = tx + TILE_SIZE;
                    }
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();

    // Draw sky background color
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Clouds (Background)
    clouds.forEach(cloud => cloud.draw());

    // Draw Buildings (City Background)
    buildings.forEach(building => building.draw());

    ctx.translate(-cameraX, 0);

    // Draw Map
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            const tile = map[r][c];
            if (tile === 0 || tile === 5) continue;

            if (tile === 4) { // Coin
                if (coinImg.complete) {
                    ctx.drawImage(coinImg, c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else {
                    // Fallback yellow circle
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Determine source coordinates from tilesImg (assuming 1x3 grid for ground, brick, pipe)
                // If the generated image is complex, we might need adjustments
                let sx = 0;
                if (tile === 1) sx = 0;      // Ground
                if (tile === 2) sx = 32;     // Brick
                if (tile === 3) sx = 64;     // Pipe

                // Check if tilesImg width is enough, otherwise fallback to color
                if (tilesImg.complete && tilesImg.width >= (sx + 32)) {
                    ctx.drawImage(tilesImg, sx, 0, 32, 32, c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else if (tile === 6) { // House
                    if (houseImg.complete) {
                        ctx.drawImage(houseImg, c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    } else {
                        ctx.fillStyle = '#A52A2A'; // Brown/Red for house
                        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                        // Add some "window" details
                        if ((c + r) % 2 === 0) {
                            ctx.fillStyle = '#87CEEB';
                            ctx.fillRect(c * TILE_SIZE + 8, r * TILE_SIZE + 8, 16, 16);
                        }
                    }
                } else {
                    ctx.fillStyle = tile === 1 ? '#8B4513' : (tile === 2 ? '#B22222' : '#228B22');
                    ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }

    // Draw Players
    players.forEach(player => {
        if (!player.alive) return;
        if (player.invincible % 10 < 5) { // Flickering effect
            if (player.img.complete) {
                ctx.drawImage(player.img, player.x, player.y, player.width, player.height);
            } else {
                ctx.fillStyle = player === players[0] ? 'red' : 'green';
                ctx.fillRect(player.x, player.y, player.width, player.height);
            }
        }
    });

    // Draw Enemies
    enemies.forEach(enemy => enemy.draw());

    ctx.restore();
}

function winGame() {
    isGameOver = true;
    isGameRunning = false;
    pauseBtn.classList.add('hidden');
    bgMusic.pause();
    winScoreEl.innerText = score;
    winScreen.classList.remove('hidden');
}

function endGame() {
    isGameOver = true;
    isGameRunning = false;
    pauseBtn.classList.add('hidden');
    bgMusic.pause();
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(e => console.log("Audio play blocked:", e));
    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

startBtn1.addEventListener('click', () => { console.log('1 Player clicked'); resetGame(false); });
startBtn2.addEventListener('click', () => { console.log('2 Player clicked'); resetGame(true); });
restartBtn.addEventListener('click', () => { console.log('Restart clicked'); resetGame(isTwoPlayerMode); });
winRestartBtn.addEventListener('click', () => { console.log('Win Restart clicked'); resetGame(isTwoPlayerMode); });

// Settings Event Listeners
settingsBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    settingsScreen.classList.remove('hidden');
});

settingsBackBtn.addEventListener('click', () => {
    settingsScreen.classList.add('hidden');
    if (isPaused) {
        isPaused = false;
    } else {
        startScreen.classList.remove('hidden');
    }
});

pauseBtn.addEventListener('click', () => {
    if (isGameRunning && !isGameOver) {
        isPaused = true;
        settingsScreen.classList.remove('hidden');
        applyLanguage(currentLanguage);
    }
});

volumeSlider.addEventListener('input', updateVolumes);

languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    applyLanguage(currentLanguage);
});

gameLoop();
applyLanguage('de');
