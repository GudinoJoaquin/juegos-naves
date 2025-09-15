import { Spaceship } from '../core/Spaceship.js';

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
    }

    reset() {
        this.hp = this.maxHp;
        this.x = this.initialX;
        this.y = this.initialY;
        this.state = 'alive';
        this.score = 0; // Reset score on death for the current player
        this.lastShotTime = 0;
        // Keep upgrades, as per shared stats requirement
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

        // El disparo siempre sale hacia arriba
        const vx = 0;
        const vy = -this.projectileSpeed;

        return new PlayerProjectile(projectileX, projectileY, vx, vy, this.bulletDamage, 'player', this.assets.playerShot);
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

        const touchPosition = game.inputHandler.getTouchPosition();

        // Continuous firing if touch is active, or if Space is pressed on PC
        if (touchPosition !== null || game.inputHandler.isKeyDown('Space')) {
            const projectile = this.shoot();
            if (projectile) {
                game.addProjectile(projectile);
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

class PlayerProjectile {
    constructor(x, y, vx, vy, damage, owner, animationFrames) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.owner = owner;
        this.animationFrames = animationFrames;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameInterval = 100; // ms
        this.isDestroyed = false;
        this.width = 4; // Made thinner
        this.height = 16; // Assuming a default height for player projectiles
    }

    update(deltaTime, game) {
        this.x += this.vx;
        this.y += this.vy;

        // Update animation frame
        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameInterval) {
            this.currentFrame = (this.currentFrame + 1) % this.animationFrames.length;
            this.frameTimer = 0;
        }

        // Check if out of bounds
        if (this.x < 0 || this.x > game.canvas.width || this.y < 0 || this.y > game.canvas.height) {
            this.isDestroyed = true;
        }
    }

    draw(ctx) {
        if (this.isDestroyed) return;
        // Always draw a simple rectangle
        ctx.fillStyle = 'yellow'; // Or any other color
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}
