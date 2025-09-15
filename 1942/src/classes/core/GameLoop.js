import { Player } from '../player/Player.js';
import { Enemy } from '../enemies/Enemy.js'; // Base Enemy class
import { KamikazeEnemy } from '../enemies/KamikazeEnemy.js';
import { TankEnemy } from '../enemies/TankEnemy.js';
import { LaserEnemy } from '../enemies/LaserEnemy.js';
import { AssaultEnemy } from '../enemies/AssaultEnemy.js';
import { BossEnemy } from '../enemies/BossEnemy.js';
import { ShieldPowerUp, LaserModePowerUp, TankModePowerUp, BoostPowerUp, MovementSpeedPowerUp, FireRatePowerUp, HealthPowerUp } from '../powerups/PowerUp.js';

export class GameLoop {
    constructor(canvas, inputHandler, assets, updateGameState, updateUpgradeMenuData, updateHUDData, addHologramEffect, playerNames) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.inputHandler = inputHandler;
        this.assets = assets;
        this.updateGameState = updateGameState;
        this.updateUpgradeMenuData = updateUpgradeMenuData;
        this.updateHUDData = updateHUDData;
        this.addHologramEffect = addHologramEffect;

        this.playerNames = playerNames;
        this.players = this.playerNames.map(name => 
            new Player(this.canvas.width / 2 - 25, this.canvas.height - 100, 'Assault', this.assets, name)
        );
        this.currentPlayerIndex = 0;
        this.player = this.players[this.currentPlayerIndex];

        this.enemies = [];
        this.projectiles = [];
        this.stars = [];
        this.powerUps = [];
        this.powerUpDropChance = 0.2;
        
        this.commonPowerUps = [MovementSpeedPowerUp, FireRatePowerUp];
        this.rarePowerUps = [ShieldPowerUp, HealthPowerUp];
        this.epicPowerUps = [LaserModePowerUp, TankModePowerUp, BoostPowerUp];

        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = this.generateRandomPowerUpSpawnInterval();
        
        this.isGameOver = false;
        this.initializeStars();

        this.currentLevel = 0;
        this.currentWave = 0;
        this.totalWavesInLevel = 0;
        this.enemiesPerWave = 0;
        this.enemiesRemainingInWave = 0;
        this.enemiesOnScreenCount = 0;
        this.bossActive = false;
        this.bossPhase = 0;
        this.enemySpawnQueue = [];
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1000;

        this.baseEnemyProbabilities = {
            KamikazeEnemy: 1,
            AssaultEnemy: 0.8,
            TankEnemy: 0.6,
            LaserEnemy: 0.4,
        };
        this.currentEnemyProbabilities = { ...this.baseEnemyProbabilities };

        this._gameState = 'loading';
        this.upgradeOptions = [];
        this.selectedUpgradeIndex = 0;

        this.enemiesDestroyed = 0;
        this.powerUpsCollected = 0;
        this.totalGameTime = 0;

        // State for switching players
        this.switchPlayerCountdown = 0;
        this.timeToSwitchPlayer = 3000; // 3 seconds

        this.initializeGame();
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
        this.generateUpgradeOptions();
        const gameStats = {
            score: 0, // Start with 0 score for display
            level: this.currentLevel,
            enemiesDestroyed: this.enemiesDestroyed,
            powerUpsCollected: this.powerUpsCollected,
            totalGameTime: this.totalGameTime
        };
        this.updateUpgradeMenuData(this.player.getStats(), this.upgradeOptions, 0, gameStats);
        this.setGameState('initialUpgrade');
    }

    startGame(upgrade) {
        if (upgrade) {
            upgrade.apply(this.player, upgrade.value);
            if (upgrade.type === 'hp') {
                this.player.hp = this.player.maxHp;
            }
        }
        this.setupLevel();
        this.setGameState('playing');
    }

    applyUpgrade(upgrade) {
        upgrade.apply(this.player, upgrade.value);
        if (upgrade.type === 'hp') {
            this.player.hp = this.player.maxHp;
        }
        this.currentLevel++;
        this.setupLevel();
        this.setGameState('playing');
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
        if (!this.lastTime) {
            this.lastTime = timestamp;
        }
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        if (!this.isGameOver) {
            this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
        }
    }

    update(deltaTime) {
        if (this.isGameOver || this.gameState === 'upgradeMenu' || this.gameState === 'initialUpgrade') {
            return;
        }

        if (this.gameState === 'switchingPlayer') {
            this.switchPlayerCountdown -= deltaTime;
            if (this.switchPlayerCountdown <= 0) {
                this.currentPlayerIndex++;
                this.player = this.players[this.currentPlayerIndex];
                this.player.reset(); // Resetea la posición y vida del nuevo jugador
                this.setupLevel(); // Reinicia el nivel para el nuevo jugador
                this.setGameState('playing');
            }
            this.updateHUDData({ switchingToPlayer: this.playerNames[this.currentPlayerIndex + 1], countdown: Math.ceil(this.switchPlayerCountdown / 1000) });
            return;
        }

        this.totalGameTime += deltaTime;
        const levelSpeedMultiplier = 1 + (this.currentLevel - 1) * 0.1;
        this.stars.forEach(star => {
            star.y += star.speed * (deltaTime / 16.67) * levelSpeedMultiplier;
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
                this.enemiesDestroyed++; // Increment here
                if (e instanceof BossEnemy) {
                    this.bossActive = false;
                    this.setGameState('upgradeMenu'); // Transition to upgrade menu
                    this.generateUpgradeOptions();
                    const gameStats = {
                        score: this.player.score,
                        level: this.currentLevel,
                        enemiesDestroyed: this.enemiesDestroyed,
                        powerUpsCollected: this.powerUpsCollected,
                        totalGameTime: this.totalGameTime
                    };
                    this.updateUpgradeMenuData(this.player.getStats(), this.upgradeOptions, this.selectedUpgradeIndex, gameStats);
                }
                return false;
            }
            return true;
        });
        this.projectiles = this.projectiles.filter(p => !p.isDestroyed);
        
        if (this.player.state === 'dead') {
            if (this.currentPlayerIndex < this.players.length - 1) {
                this.setGameState('switchingPlayer');
                this.switchPlayerCountdown = this.timeToSwitchPlayer;
            } else {
                this.isGameOver = true;
                this.setGameState('gameOver');
            }
        }

        // Check for wave completion
        if (!this.bossActive && this.currentWave <= this.totalWavesInLevel && this.enemiesOnScreenCount === 0 && this.enemySpawnQueue.length === 0) {
            this.startNextWave();
        }

        this.inputHandler.clearPressedKeys(); // Clear pressed keys at the end of update

        // Update HUD data for React component
        this.updateHUDData({
            hp: this.player.hp,
            maxHp: this.player.maxHp,
            score: this.player.score,
            level: this.currentLevel,
            wave: this.currentWave,
            totalWaves: this.totalWavesInLevel,
            enemiesLeft: this.enemiesOnScreenCount + this.enemySpawnQueue.length,
            activePowerUpType: this.player.activePowerUpType,
            powerUpTimer: this.player.powerUpTimer,
            bossActive: this.bossActive,
            playerName: this.player.playerName
        });
    }

    draw() {
        if (this.gameState === 'playing' || this.gameState === 'switchingPlayer') {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = 'white';
            this.stars.forEach(star => {
                this.context.fillRect(star.x, star.y, star.size, star.size);
            });
            this.player.draw(this.context);
            this.enemies.forEach(enemy => enemy.draw(this.context));
            this.projectiles.forEach(p => p.draw(this.context));
            this.powerUps.forEach(powerUp => powerUp.draw(this.context));
        }
    }

    generateUpgradeOptions() {
        this.upgradeOptions = [];
        const availableUpgrades = [
            { type: 'hp', shortDescription: 'Aumentar HP', apply: (player, value) => player.maxHp += value },
            { type: 'speed', shortDescription: 'Velocidad Nave', apply: (player, value) => player.speed += value },
            { type: 'bulletDamage', shortDescription: 'Daño Bala', apply: (player, value) => player.bulletDamage += value },
            { type: 'fireRate', shortDescription: 'Cadencia Disparo', apply: (player, value) => player.shotCooldown = Math.max(50, player.shotCooldown - value) },
            { type: 'projectileSpeed', shortDescription: 'Vel. Proyectil', apply: (player, value) => player.projectileSpeed += value },
        ];
    
        const levelMultiplier = 1 + (this.currentLevel - 1) * 0.1;
    
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
            let valueDescription;
            switch (upgradeType.type) {
                case 'hp':
                    value = Math.floor(20 * levelMultiplier);
                    valueDescription = `+${value} HP Máximo`;
                    break;
                case 'speed':
                    value = 0.5 * levelMultiplier;
                    valueDescription = `+${value.toFixed(1)} Velocidad`;
                    break;
                case 'bulletDamage':
                    value = Math.floor(5 * levelMultiplier);
                    valueDescription = `+${value} Daño`;
                    break;
                case 'fireRate':
                    value = Math.floor(20 * levelMultiplier);
                    valueDescription = `-${value}ms Enfriamiento`;
                    break;
                case 'projectileSpeed':
                    value = Math.floor(2 * levelMultiplier);
                    valueDescription = `+${value} Vel. Proyectil`;
                    break;
                default:
                    value = 0;
                    valueDescription = 'Desconocido';
            }
            this.upgradeOptions.push({ ...upgradeType, value, valueDescription });
        });
    
        this.selectedUpgradeIndex = 0;
    }

    createEnemyWithDifficulty(EnemyConstructor, x, y, assets, game, level) {
        let options = { level: level };

        let scaleFactor = 1 + (level - 1) * 0.1;
        let attackScaleFactor = 1 + (level - 1) * 0.05;

        if (EnemyConstructor !== BossEnemy) {
            const initialDifficultyReduction = 0.7;
            const difficultyRampUpLevels = 5;
            const currentReductionMultiplier = Math.min(1, initialDifficultyReduction + (1 - initialDifficultyReduction) * ((level - 1) / difficultyRampUpLevels));
            scaleFactor *= currentReductionMultiplier;
            attackScaleFactor *= currentReductionMultiplier;
        }

        switch (EnemyConstructor) {
            case AssaultEnemy:
                options.hp = Math.floor(30 * scaleFactor);
                options.speed = 2.5 * scaleFactor;
                options.scoreValue = Math.floor(40 * scaleFactor);
                options.burstShots = Math.floor(3 + (level - 1) * 0.5);
                options.projectileWidth = Math.floor(30 * attackScaleFactor);
                options.projectileHeight = Math.floor(5 * attackScaleFactor);
                options.projectileDamage = Math.floor(5 * attackScaleFactor);
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
                options.laserWidth = Math.floor(20 * attackScaleFactor);
                options.laserCooldown = Math.floor(2000 / attackScaleFactor);
                options.laserDuration = Math.floor(1500 * attackScaleFactor);
                break;
            case TankEnemy:
                options.hp = Math.floor(200 * scaleFactor);
                options.speed = 0.8 * scaleFactor;
                options.scoreValue = Math.floor(300 * scaleFactor);
                options.grenadeDamage = Math.floor(30 * attackScaleFactor);
                options.burstShots = Math.floor(2 + (level - 1) * 0.5);
                options.grenadeSpeed = Math.floor(3 * attackScaleFactor);
                options.grenadeRadius = Math.floor(50 * attackScaleFactor);
                break;
            case BossEnemy:
                options.hp = Math.floor(1200 * scaleFactor);
                options.speed = 1.2 * scaleFactor;
                options.scoreValue = Math.floor(5000 * scaleFactor);
                options.orbDamage = Math.floor(20 * attackScaleFactor);
                options.blackholeDamage = Math.floor(40 * attackScaleFactor);
                options.gunDamage = Math.floor(8 * attackScaleFactor);
                options.orbCount = Math.floor(20 + (level - 1) * 1);
                options.orbSpeed = Math.floor(3 * attackScaleFactor);
                options.blackholeMaxRadius = Math.floor(50 * attackScaleFactor);
                options.gunDuration = Math.floor(3000 * attackScaleFactor);
                break;
        }
        return new EnemyConstructor(x, y, assets, game, options);
    }

    addProjectile(projectile) {
        if (projectile) {
            if (Array.isArray(projectile)) {
                this.projectiles.push(...projectile);
            } else {
                this.projectiles.push(projectile);
            }
        }
    }

    checkCollisions() {
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

        this.projectiles.forEach(p => {
            if (p.owner === 'enemy' && this.player.state === 'alive') {
                if (this.isColliding(p, this.player)) {
                    this.player.takeDamage(p.damage);
                    p.isDestroyed = true;
                }
            }
        });

        this.enemies.forEach(e => {
            if (e.state === 'alive' && this.player.state === 'alive') {
                if (this.isColliding(e, this.player)) {
                    if (!(e instanceof BossEnemy)) {
                        e.takeDamage(e.hp);
                    }
                    this.player.takeDamage(20);
                }
            }
        });

        this.powerUps.forEach(powerUp => {
            if (!powerUp.isCollected && this.isColliding(this.player, powerUp)) {
                powerUp.apply(this.player, this);
                powerUp.isCollected = true;
                this.powerUpsCollected++;
                // Notify about power-up collection with position
                this.addHologramEffect(
                    `+ ${powerUp.constructor.name.replace('PowerUp', '')}`,
                    powerUp.x + powerUp.width / 2, // Center X of power-up
                    powerUp.y + powerUp.height / 2, // Center Y of power-up
                    'powerup'
                );
            }
        });
    }

    isColliding(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + b.height > b.y
        );
    }
}