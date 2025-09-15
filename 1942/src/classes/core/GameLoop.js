import { Player } from '../player/Player.js';
import { Enemy } from '../enemies/Enemy.js'; // Base Enemy class
import { KamikazeEnemy } from '../enemies/KamikazeEnemy.js';
import { TankEnemy } from '../enemies/TankEnemy.js';
import { LaserEnemy } from '../enemies/LaserEnemy.js';
import { AssaultEnemy } from '../enemies/AssaultEnemy.js';
import { BossEnemy } from '../enemies/BossEnemy.js';
import { ShieldPowerUp, LaserModePowerUp, TankModePowerUp, BoostPowerUp, MovementSpeedPowerUp, FireRatePowerUp, HealthPowerUp } from '../powerups/PowerUp.js';

export class GameLoop {
    constructor(canvas, inputHandler, assets, updateGameState, updateUpgradeMenuData, playerName) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.inputHandler = inputHandler;
        this.assets = assets;
        this.updateGameState = updateGameState; // Callback from Home.jsx
        this.updateUpgradeMenuData = updateUpgradeMenuData; // Callback from Home.jsx

        this.player = new Player(this.canvas.width / 2 - 25, this.canvas.height - 100, 'Assault', this.assets, playerName);

        this.enemies = [];
        this.projectiles = [];
        this.stars = [];
        this.powerUps = []; // New: Array to hold active power-ups
        this.powerUpDropChance = 0.2; // 20% chance for a power-up to drop
        
        // Categorized Power-ups
        this.commonPowerUps = [MovementSpeedPowerUp, FireRatePowerUp];
        this.rarePowerUps = [ShieldPowerUp, HealthPowerUp];
        this.epicPowerUps = [LaserModePowerUp, LaserModePowerUp, TankModePowerUp, BoostPowerUp];

        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = this.generateRandomPowerUpSpawnInterval(); // Initial random interval
        
        this.isGameOver = false;
        this.initializeStars();

        // Game progression variables
        this.currentLevel = 0;
        this.currentWave = 0;
        this.totalWavesInLevel = 0;
        this.enemiesPerWave = 0;
        this.enemiesRemainingInWave = 0; // Enemies to kill in current wave to proceed
        this.enemiesOnScreenCount = 0; // Enemies currently alive on screen
        this.bossActive = false;
        this.bossPhase = 0; // For boss fights
        this.enemySpawnQueue = []; // Enemies waiting to be spawned in the current wave
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1000; // ms between enemy spawns in a group

        this.baseEnemyProbabilities = {
            KamikazeEnemy: 1, // 100%
            AssaultEnemy: 0.8, // 80%
            TankEnemy: 0.6, // 60%
            LaserEnemy: 0.4, // 40%
        };
        this.currentEnemyProbabilities = { ...this.baseEnemyProbabilities };

        // Game states
        this._gameState = 'playing'; // Internal state, managed by setter
        this.upgradeOptions = [];
        this.selectedUpgradeIndex = 0;

        this.initializeGame(); // Uncommented to start the game properly
    }

    generateRandomPowerUpSpawnInterval() {
        const rand = Math.random();
        let selectedRarity;

        if (rand < 0.6) { // 60% chance for Common
            selectedRarity = 'common';
        } else if (rand < 0.9) { // 30% chance for Rare (0.6 to 0.9)
            selectedRarity = 'rare';
        } else { // 10% chance for Epic (0.9 to 1.0)
            selectedRarity = 'epic';
        }

        let minInterval, maxInterval;
        switch (selectedRarity) {
            case 'common':
                minInterval = 5000; // 5 seconds
                maxInterval = 10000; // 10 seconds
                break;
            case 'rare':
                minInterval = 10000; // 10 seconds
                maxInterval = 15000; // 15 seconds
                break;
            case 'epic':
                minInterval = 15000; // 15 seconds
                maxInterval = 20000; // 20 seconds
                break;
            default:
                minInterval = 10000; // Default to rare if something goes wrong
                maxInterval = 15000;
        }
        return Math.random() * (maxInterval - minInterval) + minInterval;
    }

    setGameState(newState) {
        this._gameState = newState;
        this.updateGameState(newState);
    }

    get gameState() {
        return this._gameState;
    }

    initializeStars() {
        const starCount = 200;
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.2,
            });
        }
    }

    initializeGame() {
        this.currentLevel = 1;
        this.setupLevel();
        this.player.transformToLaserMode(this.assets.playerLaser, 60000, this.currentLevel);
    }

    setupLevel() {
        this.currentWave = 0;
        this.enemies = []; // Clear existing enemies
        this.projectiles = []; // Clear existing projectiles
        this.powerUps = []; // Clear existing power-ups
        this.bossActive = false;
        this.bossPhase = 0;
        this.enemiesOnScreenCount = 0;
        this.enemySpawnQueue = [];

        if (this.currentLevel === 1) {
            this.enemiesPerWave = 5;
            this.totalWavesInLevel = 5;
        } else if (this.currentLevel === 2) {
            this.enemiesPerWave = 7;
            this.totalWavesInLevel = 7;
        } else if (this.currentLevel === 3) {
            this.enemiesPerWave = 9;
            this.totalWavesInLevel = 9;
        } else {
            // From level 4 onwards
            const prevLevel = this.currentLevel - 1;
            const prevEnemiesPerWave = (prevLevel === 1) ? 5 : (prevLevel === 2) ? 7 : (prevLevel === 3) ? 9 : (9 + (prevLevel - 3) * 2);
            const prevTotalWaves = (prevLevel === 1) ? 5 : (prevLevel === 2) ? 7 : (prevLevel === 3) ? 9 : (9 + (prevLevel - 3) * 2);

            this.enemiesPerWave = prevEnemiesPerWave + 2;
            this.totalWavesInLevel = prevTotalWaves + 2;
        }

        // Increase probabilities by 2% per level
        for (const type in this.baseEnemyProbabilities) {
            this.currentEnemyProbabilities[type] = Math.min(1, this.baseEnemyProbabilities[type] + (this.currentLevel - 1) * 0.02);
        }

        console.log(`Level ${this.currentLevel}: Enemies per wave: ${this.enemiesPerWave}, Total waves: ${this.totalWavesInLevel}`);
        this.startNextWave();
    }

    startNextWave() {
        this.currentWave++;
        this.enemySpawnQueue = []; // Clear previous queue
        this.enemySpawnTimer = 0; // Reset timer for new wave

        if (this.currentWave > this.totalWavesInLevel) {
            // All waves cleared, spawn boss
            this.spawnBoss();
        } else {
            // Prepare enemies for the current wave
            this.enemiesRemainingInWave = this.enemiesPerWave;
            this.fillSpawnQueue();
            // The actual spawning will happen in update() based on enemySpawnTimer
        }
    }

    fillSpawnQueue() {
        this.enemySpawnQueue = []; // Ensure it's clear before filling

        // Create an array of enemy types with their current probabilities as weights
        const enemyTypeWeights = [];
        for (const type in this.currentEnemyProbabilities) {
            // Only add if probability is greater than 0
            if (this.currentEnemyProbabilities[type] > 0) {
                enemyTypeWeights.push({ type: type, weight: this.currentEnemyProbabilities[type] * 100 }); // Convert to integer weights for easier calculation
            }
        }

        for (let i = 0; i < this.enemiesPerWave; i++) {
            let totalWeight = enemyTypeWeights.reduce((sum, enemy) => sum + enemy.weight, 0);
            if (totalWeight === 0) { // Avoid division by zero if no enemies can spawn
                console.warn("No enemy types available to spawn based on current probabilities.");
                break;
            }
            let randomWeight = Math.random() * totalWeight;

            let chosenEnemyType = null;
            for (const enemy of enemyTypeWeights) {
                randomWeight -= enemy.weight;
                if (randomWeight <= 0) {
                    chosenEnemyType = enemy.type;
                    break;
                }
            }

            if (chosenEnemyType) {
                let EnemyConstructor;
                switch(chosenEnemyType) {
                    case 'KamikazeEnemy': EnemyConstructor = KamikazeEnemy; break;
                    case 'AssaultEnemy': EnemyConstructor = AssaultEnemy; break;
                    case 'TankEnemy': EnemyConstructor = TankEnemy; break;
                    case 'LaserEnemy': EnemyConstructor = LaserEnemy; break;
                    default: console.error('Unknown enemy type:', chosenEnemyType); continue;
                }
                this.enemySpawnQueue.push(EnemyConstructor);
            }
        }
    }

    spawnEnemyGroup() {
        // Spawn enemies from the queue one by one based on the spawn interval
        if (this.enemySpawnQueue.length > 0 && this.player.state === 'alive' && !this.bossActive) {
            const EnemyConstructor = this.enemySpawnQueue.shift(); // Get enemy from queue
            if (EnemyConstructor) {
                const y = -100; // Start off-screen
                const x = Math.random() * (this.canvas.width - 100); // Random X position
                const enemy = this.createEnemyWithDifficulty(EnemyConstructor, x, y, this.assets, this, this.currentLevel);
                this.enemies.push(enemy);
                this.enemiesOnScreenCount++;
            }
        }
    }

    spawnBoss() {
        this.bossActive = true;
        this.enemies = []; // Clear any remaining regular enemies
        this.projectiles = []; // Clear any remaining projectiles
        this.powerUps = []; // Clear any remaining power-ups
        this.enemiesOnScreenCount = 0; // Reset count

        const x = this.canvas.width / 2 - 100; // Center the boss
        const y = -200; // Start off-screen
        const boss = this.createEnemyWithDifficulty(BossEnemy, x, y, this.assets, this, this.currentLevel);
        this.enemies.push(boss);
        this.enemiesOnScreenCount++;
        this.bossPhase = 1; // Initial boss phase
        console.log(`Boss spawned for Level ${this.currentLevel}!`);
    }

    start() {
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    }

    stop() {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null; // Ensure it's null after stopping
    }

    pause() {
        this.stop();
    }

    resume() {
        if (!this.animationFrameId) { // Only start if not already running
            this.start();
        }
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        if (!this.isGameOver) {
            this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
        } else {
            this.drawGameOver();
        }
    }

    update(deltaTime) {
        if (this.isGameOver) return;

        if (this.gameState === 'playing') {
            this.stars.forEach(star => {
                star.y += star.speed * (deltaTime / 16.67);
                if (star.y > this.canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * this.canvas.width;
                }
            });

            this.player.update(this, deltaTime);

            // Update power-ups
            this.powerUps.forEach(powerUp => powerUp.update(deltaTime, this));
            this.powerUps = this.powerUps.filter(powerUp => !powerUp.isCollected);

            // Timed power-up spawning
            this.powerUpSpawnTimer += deltaTime;
            if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
                const rand = Math.random();
                let PowerUpConstructor;

                if (rand < 0.6) { // 60% chance for Common
                    PowerUpConstructor = this.commonPowerUps[Math.floor(Math.random() * this.commonPowerUps.length)];
                } else if (rand < 0.9) { // 30% chance for Rare
                    PowerUpConstructor = this.rarePowerUps[Math.floor(Math.random() * this.rarePowerUps.length)];
                } else { // 10% chance for Epic
                    PowerUpConstructor = this.epicPowerUps[Math.floor(Math.random() * this.epicPowerUps.length)];
                }
                
                const x = Math.random() * (this.canvas.width - 50); // Random X position, ensure it's within bounds
                const y = -50; // Start just above the canvas
                this.powerUps.push(new PowerUpConstructor(x, y, this.assets));
                this.powerUpSpawnTimer = 0;
                this.powerUpSpawnInterval = this.generateRandomPowerUpSpawnInterval(); // New random interval based on rarity
            }

            // Handle enemy spawning for current wave
            if (!this.bossActive && this.currentWave <= this.totalWavesInLevel) {
                if (this.enemySpawnQueue.length > 0) {
                    this.enemySpawnTimer += deltaTime;
                    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
                        this.spawnEnemyGroup();
                        this.enemySpawnTimer = 0;
                    }
                }
            }
            
            this.enemies.forEach(enemy => enemy.update(this, deltaTime));

            this.projectiles.forEach(p => p.update(deltaTime, this)); // Pasar el juego a los proyectiles

            this.checkCollisions();

            // Filter out dead enemies and destroyed projectiles
            this.enemies = this.enemies.filter(e => {
                if (e.state === 'dead' && e.destructionFrame >= e.destructionFrameCount) {
                    this.enemiesOnScreenCount--;
                    // Randomly spawn a power-up on enemy death
                    // Removed power-up drop from enemies as per new requirement
                    if (e instanceof BossEnemy) {
                        this.bossActive = false;
                        this.setGameState('upgradeMenu'); // Transition to upgrade menu
                        this.generateUpgradeOptions();
                        this.updateUpgradeMenuData(this.player.getStats(), this.upgradeOptions, this.selectedUpgradeIndex, this.currentLevel);
                    }
                    return false;
                }
                return true;
            });
            this.projectiles = this.projectiles.filter(p => !p.isDestroyed);
            
            if (this.player.state === 'dead') {
                this.isGameOver = true;
            }

            // Check for wave completion
            if (!this.bossActive && this.currentWave <= this.totalWavesInLevel && this.enemiesOnScreenCount === 0 && this.enemySpawnQueue.length === 0) {
                this.startNextWave();
            }
        }

        this.inputHandler.clearPressedKeys(); // Clear pressed keys at the end of update
    }

    draw() {
        // Clear the canvas only if we are playing or game over, not during upgrade menu
        if (this.gameState === 'playing' || this.isGameOver) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        if (this.gameState === 'playing') {
            this.context.fillStyle = 'white';
            this.stars.forEach(star => {
                this.context.fillRect(star.x, star.y, star.size, star.size);
            });

            this.player.draw(this.context);
            this.enemies.forEach(enemy => enemy.draw(this.context));
            this.projectiles.forEach(p => p.draw(this.context));
            this.powerUps.forEach(powerUp => powerUp.draw(this.context)); // New: Draw power-ups
            
            this.drawHUD();
        } else if (this.isGameOver) {
            this.drawGameOver();
        }
        // Upgrade menu is now drawn by React component
    }
    
    drawHUD() {
        this.context.fillStyle = 'white';
        this.context.font = '20px Arial';
        this.context.textAlign = 'left';
        this.context.fillText(`HP: ${this.player.hp}`, 10, 30);
        this.context.fillText(`Score: ${this.player.score}`, 10, 60);
        this.context.fillText(`Level: ${this.currentLevel}`, this.canvas.width / 2 - 50, 30);
        
        // Display active power-up
        if (this.player.activePowerUpType) {
            this.context.fillText(`Power-up: ${this.player.activePowerUpType} (${Math.ceil(this.player.powerUpTimer / 1000)}s)`, this.canvas.width - 250, 60);
        }

        if (this.bossActive) {
            this.context.fillText('Boss', this.canvas.width / 2 - 25, 60);
        } else {
            this.context.fillText(`Wave: ${this.currentWave}/${this.totalWavesInLevel}`, this.canvas.width / 2 - 50, 60);
            this.context.fillText(`Enemies Left: ${this.enemiesOnScreenCount + this.enemySpawnQueue.length}`, this.canvas.width - 200, 30);
        }
    }

    drawGameOver() {
        this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = 'white';
        this.context.font = '50px Arial';
        this.context.textAlign = 'center';
        this.context.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
    }

    generateUpgradeOptions() {
        this.upgradeOptions = [];
        const availableUpgrades = [
            { type: 'hp', description: 'Aumentar HP Máximo', apply: (player, value) => player.maxHp += value },
            { type: 'speed', description: 'Aumentar Velocidad de Nave', apply: (player, value) => player.speed += value },
            { type: 'bulletDamage', description: 'Aumentar Daño de Bala', apply: (player, value) => player.bulletDamage += value },
            { type: 'fireRate', description: 'Reducir Enfriamiento de Disparo', apply: (player, value) => player.shotCooldown = Math.max(50, player.shotCooldown - value) },
            { type: 'projectileSpeed', description: 'Aumentar Velocidad de Proyectil', apply: (player, value) => player.projectileSpeed += value },
        ];
    
        // Scale upgrade values based on currentLevel
        const levelMultiplier = 1 + (this.currentLevel - 1) * 0.1; // 10% increase per level
    
        // Select 3 random unique upgrades
        const chosenUpgradeTypes = [];
        while (chosenUpgradeTypes.length < 3 && chosenUpgradeTypes.length < availableUpgrades.length) {
            const randomIndex = Math.floor(Math.random() * availableUpgrades.length);
            const chosen = availableUpgrades[randomIndex];
            if (!chosenUpgradeTypes.some(u => u.type === chosen.type)) {
                chosenUpgradeTypes.push(chosen);
            }
        }
    
        chosenUpgradeTypes.forEach(upgradeType => {
            let value;
            let description;
            switch (upgradeType.type) {
                case 'hp':
                    value = Math.floor(20 * levelMultiplier);
                    description = `Aumentar HP Máximo en ${value}`;
                    break;
                case 'speed':
                    value = 0.5 * levelMultiplier;
                    description = `Aumentar Velocidad de Nave en ${value.toFixed(1)}`;
                    break;
                case 'bulletDamage':
                    value = Math.floor(5 * levelMultiplier);
                    description = `Aumentar Daño de Bala en ${value}`;
                    break;
                case 'fireRate':
                    value = Math.floor(20 * levelMultiplier);
                    description = `Reducir Enfriamiento de Disparo en ${value}ms`;
                    break;
                case 'projectileSpeed':
                    value = Math.floor(2 * levelMultiplier);
                    description = `Aumentar Velocidad de Proyectil en ${value}`;
                    break;
                default:
                    value = 0;
                    description = 'Mejora Desconocida';
            }
            this.upgradeOptions.push({ ...upgradeType, value, description });
        });
    
        this.selectedUpgradeIndex = 0; // Default selected option
    }

    applyUpgrade(upgrade) {
        upgrade.apply(this.player, upgrade.value);
        // Special handling for maxHp to also increase current hp
        if (upgrade.type === 'hp') {
            this.player.hp = this.player.maxHp;
        }
        this.setGameState('playing'); // Use setter to update state in Home.jsx
        this.currentLevel++;
        this.setupLevel();
    }

    createEnemyWithDifficulty(EnemyConstructor, x, y, assets, game, level) {
        let options = { level: level };

        // Base scaling factor, can be adjusted
        let scaleFactor = 1 + (level - 1) * 0.1; // 10% increase per level
        let attackScaleFactor = 1 + (level - 1) * 0.05; // 5% increase for attack related stats

        // --- NEW DIFFICULTY ADJUSTMENT ---
        // Apply a base difficulty reduction for common enemies at lower levels
        if (EnemyConstructor !== BossEnemy) {
            // Example: Start common enemies at 70% of their base stats at level 1
            // and gradually increase this multiplier to 1 over 5 levels.
            const initialDifficultyReduction = 0.7; // Start at 70% of base stats
            const difficultyRampUpLevels = 5; // Over how many levels to reach full base stats

            // This multiplier will go from initialDifficultyReduction to 1 over difficultyRampUpLevels
            const currentReductionMultiplier = Math.min(1, initialDifficultyReduction + (1 - initialDifficultyReduction) * ((level - 1) / difficultyRampUpLevels));

            scaleFactor *= currentReductionMultiplier;
            attackScaleFactor *= currentReductionMultiplier;
        }
        // --- END NEW DIFFICULTY ADJUSTMENT ---

        switch (EnemyConstructor) {
            case AssaultEnemy:
                options.hp = Math.floor(30 * scaleFactor);
                options.speed = 2.5 * scaleFactor;
                options.scoreValue = Math.floor(40 * scaleFactor);
                options.burstShots = Math.floor(3 + (level - 1) * 0.5); // More shots
                options.projectileWidth = Math.floor(30 * attackScaleFactor); // Larger projectiles
                options.projectileHeight = Math.floor(5 * attackScaleFactor); // Larger projectiles
                options.projectileDamage = Math.floor(5 * attackScaleFactor); // More damage
                break;
            case KamikazeEnemy:
                options.hp = Math.floor(20 * scaleFactor);
                options.speed = 4 * scaleFactor;
                options.scoreValue = Math.floor(10 * scaleFactor);
                options.explosionDamage = Math.floor(30 * attackScaleFactor);
                options.explosionRadius = Math.floor(100 * attackScaleFactor);
                break;
            case LaserEnemy:
                options.hp = Math.floor(120 * scaleFactor);
                options.speed = 1.5 * scaleFactor;
                options.scoreValue = Math.floor(250 * scaleFactor);
                options.laserWidth = Math.floor(20 * attackScaleFactor); // Wider laser
                options.laserCooldown = Math.floor(2000 / attackScaleFactor); // Less cooldown
                options.laserDuration = Math.floor(1500 * attackScaleFactor);
                break;
            case TankEnemy:
                options.hp = Math.floor(200 * scaleFactor); // Reduced base HP from 300 to 200
                options.speed = 0.8 * scaleFactor; // Made slower
                options.scoreValue = Math.floor(300 * scaleFactor);
                options.grenadeDamage = Math.floor(30 * attackScaleFactor);
                options.burstShots = Math.floor(2 + (level - 1) * 0.5); // Fewer initial grenades
                options.grenadeSpeed = Math.floor(3 * attackScaleFactor); // Faster grenades
                options.grenadeRadius = Math.floor(50 * attackScaleFactor);
                break;
            case BossEnemy:
                // Boss stats are not affected by the initialDifficultyReduction
                options.hp = Math.floor(1200 * scaleFactor);
                options.speed = 1.2 * scaleFactor;
                options.scoreValue = Math.floor(5000 * scaleFactor);
                options.orbDamage = Math.floor(20 * attackScaleFactor);
                options.blackholeDamage = Math.floor(40 * attackScaleFactor);
                options.gunDamage = Math.floor(8 * attackScaleFactor);
                options.orbCount = Math.floor(20 + (level - 1) * 1); // More orbs
                options.orbSpeed = Math.floor(3 * attackScaleFactor); // Faster orbs
                options.blackholeMaxRadius = Math.floor(50 * attackScaleFactor); // Larger blackhole
                options.gunDuration = Math.floor(3000 * attackScaleFactor);
                break;
        }
        return new EnemyConstructor(x, y, assets, game, options);
    }

    addProjectile(projectile) {
        if (projectile) {
            // If projectile is an array, add all elements
            if (Array.isArray(projectile)) {
                this.projectiles.push(...projectile);
            } else {
                this.projectiles.push(projectile);
            }
        }
    }

    checkCollisions() {
        // Proyectiles del jugador vs enemigos
        this.projectiles.forEach(p => {
            if (p.owner === 'player') {
                this.enemies.forEach(e => {
                    if (e.state === 'alive' && this.isColliding(p, e)) {
                        e.takeDamage(p.damage);
                        p.isDestroyed = true;
                        if (e.state === 'dying') {
                            this.player.score += e.scoreValue * e.level;
                        }
                    }
                });
            }
        });

        // Proyectiles enemigos vs jugador
        this.projectiles.forEach(p => {
            if (p.owner === 'enemy' && this.player.state === 'alive') {
                if (this.isColliding(p, this.player)) {
                    this.player.takeDamage(p.damage);
                    p.isDestroyed = true;
                }
            }
        });

        // Enemigos vs jugador
        this.enemies.forEach(e => {
            if (e.state === 'alive' && this.player.state === 'alive') {
                if (this.isColliding(e, this.player)) {
                    if (!(e instanceof BossEnemy)) {
                        e.takeDamage(e.hp); // Enemy takes full damage and dies on collision
                    }
                    this.player.takeDamage(20); // Player takes damage from collision
                }
            }
        });

        // Player vs Power-ups
        this.powerUps.forEach(powerUp => {
            if (!powerUp.isCollected && this.isColliding(this.player, powerUp)) {
                powerUp.apply(this.player, this); // Pass 'this' (GameLoop instance) as the game object
                powerUp.isCollected = true;
            }
        });
    }

    isColliding(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
}