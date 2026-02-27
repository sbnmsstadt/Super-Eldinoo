const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-button');
const restartBtn = document.getElementById('restart-button');
const finalScoreEl = document.getElementById('final-score');

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
const playerImg = new Image();
playerImg.src = 'assets/mario.png';
const tilesImg = new Image();
tilesImg.src = 'assets/tiles.png';
const coinImg = new Image();
coinImg.src = 'assets/coin.png';
const monsterImg = new Image();
monsterImg.src = 'assets/monster.png';

// Input handling
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Tilemap (0: air, 1: ground/grass, 2: brick, 3: pipe, 4: coin)
const map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 4, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 4, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 4, 4, 4, 0, 2, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const player = {
    x: 100,
    y: 300,
    width: 48,  // Adjusted for 495x978 asset aspect ratio (approx 1:2)
    height: 96, // Adjusted for 495x978 asset aspect ratio
    dx: 0,
    dy: 0,
    grounded: false,
    jumpCount: 0
};

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
            ctx.drawImage(monsterImg, this.x - cameraX, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'purple';
            ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
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

function resetGame() {
    score = 0;
    coins = 0;
    isGameOver = false;
    isGameRunning = true;
    cameraX = 0;
    player.x = 100;
    player.y = 350;
    player.dx = 0;
    player.dy = 0;
    scoreEl.innerText = score;
    coinsEl.innerText = coins;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    // Spawn enemies
    enemies = [
        new Enemy(600, 350),
        new Enemy(1200, 350),
        new Enemy(1800, 350),
        new Enemy(2200, 250),
        new Enemy(2800, 350),
        // Add flying monsters
        new FlyingEnemy(900, 150),
        new FlyingEnemy(1500, 200),
        new FlyingEnemy(2500, 100)
    ];

    // Reiniciar mapa para monedas
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 5) map[r][c] = 4; // Reset collected coins (stored as 5 internally)
        }
    }
}

function update() {
    if (!isGameRunning || isGameOver) return;

    // Movement
    if (keys['ArrowRight']) player.dx = MOVE_SPEED;
    else if (keys['ArrowLeft']) player.dx = -MOVE_SPEED;
    else player.dx = 0;

    if (keys['ArrowUp'] && player.grounded) {
        player.dy = JUMP_FORCE;
        player.grounded = false;
    }

    // Apply gravity
    player.dy += GRAVITY;
    player.x += player.dx;
    player.y += player.dy;

    // Boundary check
    if (player.x < 0) player.x = 0;

    // Tile collisions
    checkCollisions();

    // Enemy logic
    enemies.forEach(enemy => {
        enemy.update();

        // Player-Enemy collision
        if (enemy.alive &&
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {

            // Check if jumping on top
            if (player.dy > 0 && player.y + player.height < enemy.y + enemy.height / 2) {
                enemy.alive = false;
                player.dy = JUMP_FORCE / 1.5; // Small bounce
                score += 500;
                scoreEl.innerText = score;
            } else {
                endGame();
            }
        }
    });

    // Camera following
    if (player.x > CANVAS_WIDTH / 2) {
        cameraX = player.x - CANVAS_WIDTH / 2;
    }

    // Death by falling (if map had holes)
    if (player.y > CANVAS_HEIGHT) endGame();

    // Win condition (reaching end of map)
    if (player.x > (map[0].length * TILE_SIZE) - 100) {
        // Simple win
        endGame();
    }
}

function checkCollisions() {
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
    ctx.translate(-cameraX, 0);

    // Draw Map
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            const tile = map[r][c];
            if (tile === 0 || tile === 5) continue;

            if (tile === 4) { // Coin
                ctx.drawImage(coinImg, c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
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
                } else {
                    ctx.fillStyle = tile === 1 ? '#8B4513' : (tile === 2 ? '#B22222' : '#228B22');
                    ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }

    // Draw Player
    if (playerImg.complete) {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // Draw Enemies
    enemies.forEach(enemy => enemy.draw());

    ctx.restore();
}

function endGame() {
    isGameOver = true;
    isGameRunning = false;
    finalScoreEl.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

startBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);

gameLoop();
