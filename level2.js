const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-button');
const finalScoreEl = document.getElementById('final-score');
const winScreen = document.getElementById('win-screen');
const winScoreEl = document.getElementById('win-score');
const winRestartBtn = document.getElementById('win-restart-button');
const settingsBtn = document.getElementById('settings-button');
const settingsScreen = document.getElementById('settings-screen');
const settingsBackBtn = document.getElementById('settings-back-button');
const volumeSlider = document.getElementById('volume-slider');
const pauseBtn = document.getElementById('pause-button');

// Game constants
const TILE_SIZE = 32;
const GRAVITY = 0.5;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 480;

// Game state
let score = 0;
let coins = 0;
let isGameOver = false;
let isGameRunning = true;
let isPaused = false;
let cameraX = 0;
let players = [];
let enemies = [];
const map = [];
let peer = null;
let conn = null;
let isHost = false;
let joinId = null;

// Get parameters from URL
const urlParams = new URLSearchParams(window.location.search);
score = parseInt(urlParams.get('score')) || 0;
coins = parseInt(urlParams.get('coins')) || 0;
const isTwoPlayer = urlParams.get('twoPlayer') === 'true';
isHost = urlParams.get('isHost') === 'true';
joinId = urlParams.get('join');

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

// Audio
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

// Input
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

/**
 * Tile Types:
 * 0: Air
 * 2: Floor (Brick)
 * 4: Coin
 * 10: Window (Fenster)
 * 11: Door (Tür)
 * 12: Desk (Schreibtisch)
 * 13: Stairs (Stiege)
 * 14: Railing (Geländer)
 */
function initMap() {
    const cols = 200;
    for (let r = 0; r < 15; r++) {
        map[r] = new Array(cols).fill(0);
    }
    for (let c = 0; c < cols; c++) {
        // Continuous Floor
        map[13][c] = 2;
        map[14][c] = 2;

        // Windows every 15 tiles
        if (c % 15 === 5) {
            map[4][c] = 10;
            map[4][c + 1] = 10;
            map[5][c] = 10;
            map[5][c + 1] = 10;
        }

        // Doors every 20 tiles
        if (c % 20 === 12) {
            map[10][c] = 11;
            map[11][c] = 11;
            map[12][c] = 11;
        }

        // Desks
        if (c % 15 === 10) {
            map[12][c] = 12;
            map[12][c + 1] = 12;
            map[10][c] = 4; // Coin above desk
        }

        // Stairs and Railings at certain points
        if (c > 30 && c < 35) {
            let stepHeight = c - 30;
            for (let i = 0; i < stepHeight; i++) {
                map[13 - i][c] = 13;
            }
            map[13 - stepHeight][c] = 14; // Railing on top
        }

        // High platform / 2nd floor sections
        if (c > 35 && c < 60) {
            map[9][c] = 2;
            if (c % 10 === 0) map[8][c] = 4;
        }
    }
}

function createPlayer(x, y, img, controls) {
    return {
        x, y, width: 48, height: 96, dx: 0, dy: 0,
        grounded: false, isBig: true, invincible: 0,
        img, controls, alive: true
    };
}

class Enemy {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.width = 30; this.height = 30;
        this.dx = -2; this.dy = 0;
        this.alive = true;
    }
    update() {
        if (!this.alive) return;
        this.dy += GRAVITY;
        this.x += this.dx;
        this.y += this.dy;
        this.checkTileCollisions();
    }
    checkTileCollisions() {
        const col = Math.floor((this.dx > 0 ? this.x + this.width : this.x) / TILE_SIZE);
        const row = Math.floor((this.y + this.height / 2) / TILE_SIZE);
        // Collision with floor, stairs, desks
        if (map[row] && map[row][col] && [2, 12, 13].includes(map[row][col])) {
            this.dx *= -1;
        }
        const groundRow = Math.floor((this.y + this.height) / TILE_SIZE);
        const groundCol = Math.floor((this.x + this.width / 2) / TILE_SIZE);
        if (map[groundRow] && map[groundRow][groundCol] && [2, 12, 13].includes(map[groundRow][groundCol])) {
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

function resetLevel() {
    isGameOver = false;
    isGameRunning = true;
    cameraX = 0;
    initMap();
    players = [];
    const p1Controls = (conn && !isHost) ? { up: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight' } : { up: 'KeyW', left: 'KeyA', right: 'KeyD' };
    players.push(createPlayer(100, 310, marioImg, p1Controls));

    if (isTwoPlayer) {
        const p2Controls = (conn && !isHost) ? { up: 'KeyW', left: 'KeyA', right: 'KeyD' } : { up: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight' };
        players.push(createPlayer(150, 310, luigiImg, p2Controls));
    }
    enemies = [];
    for (let i = 0; i < 15; i++) {
        enemies.push(new Enemy(800 + i * 400, 350));
    }
    scoreEl.innerText = score;
    coinsEl.innerText = coins;
    gameOverScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    bgMusic.play().catch(() => { });
}

function checkCollisions(player) {
    player.grounded = false;
    const startCol = Math.floor(player.x / TILE_SIZE);
    const endCol = Math.floor((player.x + player.width) / TILE_SIZE);
    const startRow = Math.floor(player.y / TILE_SIZE);
    const endRow = Math.floor((player.y + player.height) / TILE_SIZE);

    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            if (!map[r] || !map[r][c]) continue;
            const tile = map[r][c];
            if (tile === 4) {
                if (player.x < c * TILE_SIZE + TILE_SIZE && player.x + player.width > c * TILE_SIZE &&
                    player.y < r * TILE_SIZE + TILE_SIZE && player.y + player.height > r * TILE_SIZE) {
                    map[r][c] = 0;
                    coins++; score += 100;
                    scoreEl.innerText = score; coinsEl.innerText = coins;
                }
                continue;
            }
            // Ignore non-collidable tiles (windows 10, doors 11, railing 14)
            if ([0, 10, 11, 14].includes(tile)) continue;

            const tx = c * TILE_SIZE; const ty = r * TILE_SIZE;
            if (player.x < tx + TILE_SIZE && player.x + player.width > tx &&
                player.y < ty + TILE_SIZE && player.y + player.height > ty) {
                const ox = Math.min(player.x + player.width - tx, tx + TILE_SIZE - player.x);
                const oy = Math.min(player.y + player.height - ty, ty + TILE_SIZE - player.y);
                if (ox > oy) {
                    if (player.dy > 0 && player.y < ty) { player.y = ty - player.height; player.dy = 0; player.grounded = true; }
                    else if (player.dy < 0 && player.y > ty) { player.y = ty + TILE_SIZE; player.dy = 0; }
                } else {
                    if (player.dx > 0 && player.x < tx) player.x = tx - player.width;
                    else if (player.dx < 0 && player.x > tx) player.x = tx + TILE_SIZE;
                }
            }
        }
    }
}

function update() {
    if (!isGameRunning || isPaused || isGameOver) return;
    players.forEach((p, index) => {
        if (!p.alive) return;

        const isLocal = !conn || (isHost && index === 0) || (!isHost && index === 1);

        if (isLocal) {
            if (keys[p.controls.right]) p.dx = MOVE_SPEED;
            else if (keys[p.controls.left]) p.dx = -MOVE_SPEED;
            else p.dx = 0;
            if (keys[p.controls.up] && p.grounded) { p.dy = JUMP_FORCE; p.grounded = false; jumpSound.play().catch(() => { }); }
        }
        p.dy += GRAVITY; p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = 0;
        checkCollisions(p);
        if (p.y > CANVAS_HEIGHT) endGame();
        if (p.x > (map[0].length * TILE_SIZE) - 200) winGame();
    });

    // Multiplayer Data Sync
    if (conn && conn.open) {
        const localPlayer = isHost ? players[0] : players[1];
        if (localPlayer) {
            conn.send({
                type: 'pos',
                x: localPlayer.x,
                y: localPlayer.y,
                dx: localPlayer.dx,
                dy: localPlayer.dy,
                isBig: localPlayer.isBig,
                alive: localPlayer.alive
            });
        }
    }

    enemies.forEach(e => {
        e.update();
        players.forEach(p => {
            if (e.alive && p.x < e.x + e.width && p.x + p.width > e.x && p.y < e.y + e.height && p.y + p.height > e.y) {
                if (p.dy > 0 && p.y + p.height < e.y + e.height / 2) {
                    e.alive = false; killSound.play().catch(() => { });
                    p.dy = JUMP_FORCE / 1.5; score += 500; scoreEl.innerText = score;
                } else { endGame(); }
            }
        });
    });
    if (players[0] && players[0].x > CANVAS_WIDTH / 2) cameraX = players[0].x - CANVAS_WIDTH / 2;
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#2c3e50'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save(); ctx.translate(-cameraX, 0);
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            const tile = map[r][c]; if (tile === 0) continue;
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;

            if (tile === 4) {
                if (coinImg.complete) ctx.drawImage(coinImg, x, y, TILE_SIZE, TILE_SIZE);
                else { ctx.fillStyle = 'gold'; ctx.beginPath(); ctx.arc(x + 16, y + 16, 10, 0, Math.PI * 2); ctx.fill(); }
            } else if (tile === 10) { // Window
                ctx.fillStyle = '#3498db'; // Glass blue
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
                // Mini cloud in window
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(x + 10, y + 20, 5, 0, Math.PI * 2);
                ctx.arc(x + 16, y + 15, 6, 0, Math.PI * 2);
                ctx.arc(x + 22, y + 20, 5, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 11) { // Door
                ctx.fillStyle = '#795548'; // Wood brown
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = 'black'; // Door handle
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE - 6, y + TILE_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 12) { // Desk
                ctx.fillStyle = '#8d6e63';
                ctx.fillRect(x, y, TILE_SIZE, 8); // Top
                ctx.fillRect(x + 4, y + 8, 4, TILE_SIZE - 8); // Leg 1
                ctx.fillRect(x + TILE_SIZE - 8, y + 8, 4, TILE_SIZE - 8); // Leg 2
            } else if (tile === 13) { // Stairs/Brick
                let sx = 32; // Brick texture
                if (tilesImg.complete) ctx.drawImage(tilesImg, sx, 0, 32, 32, x, y, TILE_SIZE, TILE_SIZE);
                else { ctx.fillStyle = 'gray'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE); }
            } else if (tile === 14) { // Railing
                ctx.strokeStyle = '#9e9e9e';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x, y + 16);
                ctx.lineTo(x + TILE_SIZE, y + 16);
                ctx.moveTo(x + 16, y + 16);
                ctx.lineTo(x + 16, y + TILE_SIZE);
                ctx.stroke();
            } else {
                let sx = tile === 1 ? 0 : 32;
                if (tilesImg.complete) ctx.drawImage(tilesImg, sx, 0, 32, 32, x, y, TILE_SIZE, TILE_SIZE);
                else { ctx.fillStyle = tile === 1 ? 'brown' : 'gray'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE); }
            }
        }
    }
    players.forEach(p => { if (p.img.complete) ctx.drawImage(p.img, p.x, p.y, p.width, p.height); else { ctx.fillStyle = 'red'; ctx.fillRect(p.x, p.y, p.width, p.height); } });
    enemies.forEach(e => e.draw());
    ctx.restore();
}

function winGame() { isGameOver = true; isGameRunning = false; winScoreEl.innerText = score; winScreen.classList.remove('hidden'); }
function endGame() { isGameOver = true; isGameRunning = false; finalScoreEl.innerText = score; gameOverScreen.classList.remove('hidden'); gameOverSound.play().catch(() => { }); }

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

volumeSlider.addEventListener('input', updateVolumes);
pauseBtn.addEventListener('click', () => { isPaused = !isPaused; settingsScreen.classList.toggle('hidden'); });
settingsBackBtn.addEventListener('click', () => { isPaused = false; settingsScreen.classList.add('hidden'); });
winRestartBtn.addEventListener('click', () => window.location.href = 'index.html');
restartBtn.addEventListener('click', () => window.location.href = 'index.html');

// Multiplayer Logic for Level 2
function initPeer() {
    // If hosting, we try to use the same ID we had in Level 1 (if it was passed)
    // or just a new one and let the other join via the ID in the URL.
    peer = new Peer();

    peer.on('open', (id) => {
        console.log('Level 2 Peer ID:', id);
        if (!isHost && joinId) {
            // Client joins the host
            conn = peer.connect(joinId);
            setupConnection();
        }
    });

    peer.on('connection', (connection) => {
        console.log('Incoming connection in Level 2...');
        conn = connection;
        setupConnection();
    });
}

function setupConnection() {
    conn.on('open', () => {
        console.log('Level 2 Multiplayer Connected!');
    });

    conn.on('data', (data) => {
        if (data.type === 'pos') {
            const remotePlayer = isHost ? players[1] : players[0];
            if (remotePlayer) {
                remotePlayer.x = data.x;
                remotePlayer.y = data.y;
                remotePlayer.dx = data.dx;
                remotePlayer.dy = data.dy;
                remotePlayer.isBig = data.isBig;
                remotePlayer.alive = data.alive;
            }
        }
    });
}

if (isTwoPlayer && joinId) {
    initPeer();
}

resetLevel();
gameLoop();
updateVolumes();
