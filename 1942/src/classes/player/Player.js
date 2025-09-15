import { Spaceship } from '../core/Spaceship.js';
import { PlayerProjectile } from '../projectiles/PlayerProjectile.js';
import { RayoLaserJugador } from '../projectiles/RayoLaserJugador.js';
import { GrenadeProjectile } from '../projectiles/GrenadeProjectile.js';
import { BoostProjectile } from '../projectiles/BoostProjectile.js';

export class Player extends Spaceship {
    constructor(x, y, shipType, assets, name = 'Player') {
        const stats = {
            Assault: { hp: 100, speed: 7, frames: assets['playerAssault'], scale: 2.0, bulletDamage: 10, projectileSpeed: 15 },
            Laser: { hp: 80, speed: 9, frames: assets['playerLaser'], scale: 2.0, bulletDamage: 8, projectileSpeed: 20 },
            Tank: { hp: 150, speed: 5, frames: assets['playerTank'], scale: 2.0, bulletDamage: 15, projectileSpeed: 12 }
        };

        const currentStats = stats[shipType];
        if (!currentStats) {
            throw new Error(`Tipo de nave de jugador no válido: ${shipType}`);
        }

        super(x, y, currentStats.hp, currentStats.speed, currentStats.frames, currentStats.scale, 'down', assets, 1, name);
        
        this.shipType = shipType;
        this.score = 0;
        this.lastShotTime = 0;
        this.shotCooldown = 200; // Increased cooldown for slower initial firing
        this.assets = assets;
        this.name = name;

        // New player stats for upgrades
        this.maxHp = currentStats.hp;
        this.bulletDamage = currentStats.bulletDamage;
        this.projectileSpeed = currentStats.projectileSpeed;

        // Store initial position for reset
        this.initialX = x;
        this.initialY = y;

        // Power-up related properties
        this.isShieldActive = false;
        this.shieldHp = 0;
        this.modoLaserActivo = false;
        this.isTankMode = false;
        this.isBoostActive = false;
        this.powerUpTimer = 0;
        this.activePowerUpType = null;
        this.laserActivoJugador = null; // Referencia al rayo láser del jugador
        this.isDisparandoLaser = false; // Para saber si el jugador está manteniendo el botón de disparo
        this.laserWidth = 60; // Default laser width
        this.laserHeight = 0; // Will be set to canvas height
        this.originalStats = {
            speed: this.speed,
            bulletDamage: this.bulletDamage,
            shotCooldown: this.shotCooldown,
            projectileSpeed: this.projectileSpeed,
            scale: this.scale,
            animationFrames: this.animationFrames,
            shipType: this.shipType,
        };
    }

    reset() {
        this.hp = this.maxHp;
        this.x = this.initialX;
        this.y = this.initialY;
        this.state = 'alive';
        this.score = 0; // Reset score on death for the current player
        this.lastShotTime = 0;
        // Revert any active power-ups on reset
        this.revertPowerUp();
    }

    shoot() {
        if (this.state !== 'alive') return null;
        const now = Date.now();
        if (now - this.lastShotTime < this.shotCooldown) {
            return null;
        }
        this.lastShotTime = now;
        
        const projectileX = this.x + this.width / 2;
        const projectileY = this.y + this.height / 2;

        // Handle different projectile types based on power-ups
        if (this.modoLaserActivo) {
            // El modo láser se gestiona en el método update para disparo continuo
            return null; 
        } else if (this.isTankMode) {
            const projectiles = [];
            const numGrenades = 5;
            const baseSpeed = this.projectileSpeed; // Base speed for grenades
            const spreadAngle = Math.PI / 6; // Total spread of 30 degrees (15 degrees each side from center)

            for (let i = 0; i < numGrenades; i++) {
                // Calculate angle for each projectile to create a half-moon spread
                const angle = -Math.PI / 2 + (i - (numGrenades - 1) / 2) * (spreadAngle / (numGrenades - 1));

                // Starting positions around the nose of the ship
                const startRadius = this.width / 2; // Distance from center of ship
                const grenadeX = this.x + this.width / 2 + Math.cos(angle) * startRadius;
                const grenadeY = this.y + this.height / 2 + Math.sin(angle) * startRadius;

                const vx = Math.cos(angle) * baseSpeed;
                const vy = Math.sin(angle) * baseSpeed;

                projectiles.push(new GrenadeProjectile(grenadeX, grenadeY, vx, vy, this.bulletDamage, 'player', this.assets));
            }
            return projectiles;
        } else if (this.isBoostActive) {
            // Boost shoots two projectiles
            const projectiles = [];
            projectiles.push(new BoostProjectile(this.x + this.width / 4, projectileY, 0, -this.projectileSpeed, this.bulletDamage, 'player', this.assets.playerShot));
            projectiles.push(new BoostProjectile(this.x + this.width * 3 / 4, projectileY, 0, -this.projectileSpeed, this.bulletDamage, 'player', this.assets.playerShot));
            return projectiles; // Return an array of projectiles
        } else {
            // Default projectile
            return new PlayerProjectile(projectileX, projectileY, 0, -this.projectileSpeed, this.bulletDamage, 'player', this.assets.playerShot);
        }
    }

    handleInput(inputHandler) {
        this.isMoving = false;
        if (this.state !== 'alive') return;

        let moveX = 0; // Declare here
        let moveY = 0; // Declare here

        const touchPosition = inputHandler.getTouchPosition();

        if (touchPosition !== null) { // Touch input is active
            // Set player position directly to touch position, centering the ship
            this.x = touchPosition.x - this.width / 2;
            this.y = touchPosition.y - this.height / 2;
            this.isMoving = true; // Consider it moving when touched
        } else { // No touch input, use keyboard
            if (inputHandler.isKeyDown('ArrowUp')) moveY -= 1;
            if (inputHandler.isKeyDown('ArrowDown')) moveY += 1;
            if (inputHandler.isKeyDown('ArrowLeft')) moveX -= 1;
            if (inputHandler.isKeyDown('ArrowRight')) moveX += 1;

            if (moveX !== 0 || moveY !== 0) {
                this.isMoving = true;
                const moveLength = Math.sqrt(moveX * moveX + moveY * moveY);
                const dx = (moveX / moveLength) * this.speed;
                const dy = (moveY / moveLength) * this.speed;
                this.move(dx, dy);
            }
        }

        // Inclinación de la nave (still based on horizontal movement, if any)
        // If touch is active, angle will be 0 unless we calculate it based on touch movement
        // For simplicity, let's keep it based on keyboard moveX if no touch, or 0 if touch
        if (touchPosition === null) {
            this.angle = moveX * 0.4;
        } else {
            this.angle = 0; // No angle change with direct touch follow
        }
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        this.handleInput(game.inputHandler);

        // Update power-up timer
        if (this.powerUpTimer > 0) {
            this.powerUpTimer -= deltaTime;
            if (this.powerUpTimer <= 0) {
                this.revertPowerUp();
            }
        }

        // Update active laser position and state
        if (this.activeLaser && this.isLaserMode) {
            this.activeLaser.x = this.x + this.width / 2;
            this.activeLaser.y = this.y + this.height / 2;
            this.activeLaser.update(deltaTime, game); // Allow laser to check collisions
            if (this.activeLaser.isDestroyed) {
                this.activeLaser = null; // Remove destroyed laser
            }
        } else if (this.activeLaser && !this.isLaserMode) {
            // If laser mode is no longer active, destroy the laser
            this.activeLaser.isDestroyed = true;
            this.activeLaser = null;
        }


        const touchPosition = game.inputHandler.getTouchPosition();

        // Continuous firing if touch is active, or if Space is pressed on PC
        if (touchPosition !== null || game.inputHandler.isKeyDown('Space')) {
            const projectile = this.shoot();
            if (projectile) {
                // If shoot returns an array (e.g., TankMode, Boost), add all of them
                if (Array.isArray(projectile)) {
                    projectile.forEach(p => game.addProjectile(p));
                } else {
                    game.addProjectile(projectile);
                }
            }
        }

        if (this.state === 'alive') {
            // Keep player within canvas bounds for both X and Y
            if (this.x < 0) this.x = 0;
            if (this.x > game.canvas.width - this.width) this.x = game.canvas.width - this.width;
            if (this.y < 0) this.y = 0;
            if (this.y > game.canvas.height - this.height) this.y = game.canvas.height - this.height;
        }
    }

    takeDamage(damage) {
        if (this.state !== 'alive') return;

        if (this.isShieldActive) {
            this.shieldHp -= damage;
            if (this.shieldHp <= 0) {
                this.isShieldActive = false;
                this.shieldHp = 0;
                // Optionally, play a shield break sound/animation
            }
            return; // Shield absorbed damage
        }

        this.hp -= damage;
        this.isShielded = true;
        this.shieldTimer = this.shieldDuration;
        if (this.hp <= 0) {
            this.hp = 0;
            this.state = 'dying';
            this.frameTimer = 0; // Reiniciar timer para la animación de muerte
            if (typeof this.onDeath === 'function') {
                this.onDeath();
            }
        }
    }

    // Power-up activation methods
    activateShield(shieldHp, currentLevel) {
        // Shield is now permanent until destroyed, no timer
        this.isShieldActive = true;
        const effectiveShieldHp = Math.max(10, shieldHp * (1 - (currentLevel - 1) * 0.03)); // 3% decrease per level
        this.shieldHp = effectiveShieldHp;
        this.activePowerUpType = 'Shield';
    }

    transformToLaserMode(laserFrames, duration, currentLevel) {
        this.revertPowerUp(); // Revert any other active power-up first
        this.originalStats = {
            speed: this.speed,
            bulletDamage: this.bulletDamage,
            shotCooldown: this.shotCooldown,
            projectileSpeed: this.projectileSpeed,
            scale: this.scale,
            animationFrames: this.animationFrames,
            shipType: this.shipType,
        };
        this.isLaserMode = true;
        this.animationFrames = laserFrames;
        this.shipType = 'Laser';
        const adjustedDuration = Math.max(1000, duration * (1 - (currentLevel - 1) * 0.01)); // 1% decrease per level, min 1 sec
        this.powerUpTimer = adjustedDuration;
        this.activePowerUpType = 'LaserMode';
        // Adjust stats for LaserMode (3% effectiveness decrease per level)
        const effectivenessMultiplier = Math.max(0.1, 1 - (currentLevel - 1) * 0.03); // Min 10% effectiveness
        this.speed = this.originalStats.speed * 1.2 * effectivenessMultiplier; // Faster
        this.bulletDamage = this.originalStats.bulletDamage * 0.8 * effectivenessMultiplier; // Less damage per shot, but faster/more frequent
        this.shotCooldown = this.originalStats.shotCooldown * (0.5 + (1 - effectivenessMultiplier) * 0.5); // Faster firing, but less effective
        this.projectileSpeed = this.originalStats.projectileSpeed * 1.5 * effectivenessMultiplier; // Faster projectiles
    }

    revertirDeModoLaser() {
        this.isLaserMode = false;
        if (this.activeLaser) {
            this.activeLaser.deactivate(); // Deactivate and mark for destruction
            this.activeLaser = null;
        }
        this.animationFrames = this.originalStats.animationFrames;
        this.shipType = this.originalStats.shipType;
        this.speed = this.originalStats.speed;
        this.bulletDamage = this.originalStats.bulletDamage;
        this.shotCooldown = this.originalStats.shotCooldown;
        this.projectileSpeed = this.originalStats.projectileSpeed;
    }

    transformToTankMode(tankFrames, duration, currentLevel) {
        this.revertPowerUp(); // Revert any other active power-up first
        this.originalStats = {
            speed: this.speed,
            bulletDamage: this.bulletDamage,
            shotCooldown: this.shotCooldown,
            projectileSpeed: this.projectileSpeed,
            scale: this.scale,
            animationFrames: this.animationFrames,
            shipType: this.shipType,
        };
        this.isTankMode = true;
        this.animationFrames = tankFrames;
        this.shipType = 'Tank';
        const adjustedDuration = Math.max(1000, duration * (1 - (currentLevel - 1) * 0.01)); // 1% decrease per level, min 1 sec
        this.powerUpTimer = adjustedDuration;
        this.activePowerUpType = 'TankMode';
        // Adjust stats for TankMode (3% effectiveness decrease per level)
        const effectivenessMultiplier = Math.max(0.1, 1 - (currentLevel - 1) * 0.03); // Min 10% effectiveness
        this.speed = this.originalStats.speed * 0.6 * effectivenessMultiplier; // Slower
        this.bulletDamage = this.originalStats.bulletDamage * 1.5 * effectivenessMultiplier; // More damage per grenade
        this.shotCooldown = this.originalStats.shotCooldown * (1.5 - (1 - effectivenessMultiplier) * 0.5); // Slower firing, but powerful
        this.projectileSpeed = this.originalStats.projectileSpeed * 0.8 * effectivenessMultiplier; // Slower grenades
        const hpIncrease = 50 * effectivenessMultiplier;
        this.maxHp += hpIncrease; // Increase max HP
        this.hp += hpIncrease; // Also increase current HP
    }

    revertFromTankMode() {
        this.isTankMode = false;
        this.animationFrames = this.originalStats.animationFrames;
        this.shipType = this.originalStats.shipType;
        this.speed = this.originalStats.speed;
        this.bulletDamage = this.originalStats.bulletDamage;
        this.shotCooldown = this.originalStats.shotCooldown;
        this.projectileSpeed = this.originalStats.projectileSpeed;
        this.maxHp -= 50; // Revert max HP
        if (this.hp > this.maxHp) this.hp = this.maxHp; // Adjust current HP if it exceeds new max
    }

    increaseMovementSpeed(value) {
        this.speed += value;
    }

    increaseFireRate(value) {
        this.shotCooldown = Math.max(50, this.shotCooldown - value); // Ensure minimum cooldown
    }

    increaseHealth(value, currentLevel) {
        const initialPercentage = 0.8; // 80% at level 1
        const percentageDecreasePerLevel = 0.03; // 3% decrease per level
        const minPercentage = 0.2; // Minimum 20% restoration

        const effectivePercentage = Math.max(minPercentage, initialPercentage - (currentLevel - 1) * percentageDecreasePerLevel);
        const healthRestored = this.maxHp * effectivePercentage;
        this.hp = Math.min(this.maxHp, this.hp + healthRestored);
    }

    activateMovementSpeed(value, duration, currentLevel) {
        this.revertPowerUp();
        this.originalStats = {
            speed: this.speed,
            bulletDamage: this.bulletDamage,
            shotCooldown: this.shotCooldown,
            projectileSpeed: this.projectileSpeed,
            scale: this.scale,
            animationFrames: this.animationFrames,
            shipType: this.shipType,
        };
        this.isMovementSpeedActive = true;
        const effectiveValue = Math.max(0.1, value * (1 - (currentLevel - 1) * 0.03)); // 3% decrease per level
        this.speed += effectiveValue;
        const adjustedDuration = Math.max(1000, duration * (1 - (currentLevel - 1) * 0.01));
        this.powerUpTimer = adjustedDuration;
        this.activePowerUpType = 'MovementSpeed';
    }

    revertFromMovementSpeed() {
        this.isMovementSpeedActive = false;
        this.speed = this.originalStats.speed;
    }

    activateFireRate(value, duration, currentLevel) {
        this.revertPowerUp();
        this.originalStats = {
            speed: this.speed,
            bulletDamage: this.bulletDamage,
            shotCooldown: this.shotCooldown,
            projectileSpeed: this.projectileSpeed,
            scale: this.scale,
            animationFrames: this.animationFrames,
            shipType: this.shipType,
        };
        this.isFireRateActive = true;
        const effectiveValue = Math.max(10, value * (1 - (currentLevel - 1) * 0.03)); // 3% decrease per level, min 10ms reduction
        this.shotCooldown = Math.max(50, this.shotCooldown - effectiveValue);
        const adjustedDuration = Math.max(1000, duration * (1 - (currentLevel - 1) * 0.01));
        this.powerUpTimer = adjustedDuration;
        this.activePowerUpType = 'FireRate';
    }

    revertFromFireRate() {
        this.isFireRateActive = false;
        this.shotCooldown = this.originalStats.shotCooldown;
    }

    activateBoost(duration, currentLevel) {
        this.revertPowerUp(); // Revert any other active power-up first
        this.originalStats = {
            speed: this.speed,
            bulletDamage: this.bulletDamage,
            shotCooldown: this.shotCooldown,
            projectileSpeed: this.projectileSpeed,
            scale: this.scale,
            animationFrames: this.animationFrames,
            shipType: this.shipType,
        };
        this.isBoostActive = true;
        const adjustedDuration = Math.max(1000, duration * (1 - (currentLevel - 1) * 0.01)); // 1% decrease per level, min 1 sec
        this.powerUpTimer = adjustedDuration;
        this.activePowerUpType = 'Boost';
        // Adjust stats for Boost (nerfed to 1.5x, and 3% effectiveness decrease per level)
        const effectivenessMultiplier = Math.max(0.1, 1 - (currentLevel - 1) * 0.03); // Min 10% effectiveness
        this.speed = this.originalStats.speed * 1.5 * effectivenessMultiplier;
        this.bulletDamage = this.originalStats.bulletDamage * 1.5 * effectivenessMultiplier;
        this.shotCooldown = this.originalStats.shotCooldown * (0.75 + (1 - effectivenessMultiplier) * 0.25); // Adjusted for 1.5x effect, less effective with level
        this.projectileSpeed = this.originalStats.projectileSpeed * 1.5 * effectivenessMultiplier;
        this.scale = this.originalStats.scale * 1.5 * effectivenessMultiplier; // Make ship 1.5x larger, less with level
        this.width = (this.animationFrames[0] ? this.animationFrames[0].width : 50) * this.scale;
        this.height = (this.animationFrames[0] ? this.animationFrames[0].height : 50) * this.scale;
    }

    deactivateBoost() {
        this.isBoostActive = false;
        this.speed = this.originalStats.speed;
        this.bulletDamage = this.originalStats.bulletDamage;
        this.shotCooldown = this.originalStats.shotCooldown;
        this.projectileSpeed = this.originalStats.projectileSpeed;
        this.scale = this.originalStats.scale;
        this.width = (this.animationFrames[0] ? this.animationFrames[0].width : 50) * this.scale;
        this.height = (this.animationFrames[0] ? this.animationFrames[0].height : 50) * this.scale;
    }

    revertPowerUp() {
        if (this.activePowerUpType === 'ModoLaser') {
            this.revertFromLaserMode();
        } else if (this.activePowerUpType === 'TankMode') {
            this.revertFromTankMode();
        } else if (this.activePowerUpType === 'Boost') {
            this.deactivateBoost();
        } else if (this.activePowerUpType === 'MovementSpeed') {
            this.revertFromMovementSpeed();
        } else if (this.activePowerUpType === 'FireRate') {
            this.revertFromFireRate();
        }
        this.isShieldActive = false; // Shield is handled differently, just deactivate it
        this.shieldHp = 0;
        this.powerUpTimer = 0;
        this.activePowerUpType = null;
    }

    draw(context) {
        super.draw(context);

        // Dibujar el escudo del jugador si está activo
        if (this.isShieldActive) {
            context.save();
            const green = Math.floor((this.shieldHp / 100) * 255); // Assuming max shieldHp is 100 for color calculation
            context.strokeStyle = `rgba(0,${green},255,0.7)`;
            context.lineWidth = 5; // Adjust line width for player shield
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 10, 0, Math.PI * 2);
            context.stroke();
            context.restore();
        }
    }

    getStats() {
        return {
            hp: this.hp,
            maxHp: this.maxHp,
            speed: this.speed,
            bulletDamage: this.bulletDamage,
            shotCooldown: this.shotCooldown,
            projectileSpeed: this.projectileSpeed,
        };
    }
}


