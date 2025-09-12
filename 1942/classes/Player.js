import { Spaceship } from './Spaceship.js';
import { Projectile } from './Projectile.js';

export class Player extends Spaceship {
    constructor(x, y, shipType, assets) {
        const stats = {
            Assault: { hp: 100, speed: 7, frames: assets['playerAssault'], scale: 2.0 },
            Laser: { hp: 80, speed: 9, frames: assets['playerLaser'], scale: 2.0 },
            Tank: { hp: 150, speed: 5, frames: assets['playerTank'], scale: 2.0 }
        };

        const currentStats = stats[shipType];
        if (!currentStats) {
            throw new Error(`Tipo de nave de jugador no válido: ${shipType}`);
        }

        super(x, y, currentStats.hp, currentStats.speed, currentStats.frames, currentStats.scale, 'down', assets);
        
        this.shipType = shipType;
        this.score = 0;
        this.lastShotTime = 0;
        this.shotCooldown = 150;
        this.assets = assets;
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
        const projectileSpeed = 15;

        // El disparo sale en la dirección a la que apunta la nariz de la nave
        const fireAngle = this.angle - (Math.PI / 2);
        const vx = Math.cos(fireAngle) * projectileSpeed;
        const vy = Math.sin(fireAngle) * projectileSpeed;

        return new Projectile(projectileX, projectileY, vx, vy, 20, 'player', this.assets.playerShot);
    }

    handleInput(inputHandler) {
        this.isMoving = false;
        if (this.state !== 'alive') return;

        let moveX = 0;
        let moveY = 0;

        if (inputHandler.isPressed('ArrowUp')) moveY -= 1;
        if (inputHandler.isPressed('ArrowDown')) moveY += 1;
        if (inputHandler.isPressed('ArrowLeft')) moveX -= 1;
        if (inputHandler.isPressed('ArrowRight')) moveX += 1;

        // Mover la nave
        if (moveX !== 0 || moveY !== 0) {
            this.isMoving = true;
            const moveLength = Math.sqrt(moveX * moveX + moveY * moveY);
            const dx = (moveX / moveLength) * this.speed;
            const dy = (moveY / moveLength) * this.speed;
            this.move(dx, dy);
        }

        // Inclinación de la nave
        this.angle = moveX * 0.4;
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        this.handleInput(game.inputHandler);

        if (game.inputHandler.isPressed('Space')) {
            const projectile = this.shoot();
            if (projectile) {
                game.addProjectile(projectile);
            }
        }

        if (this.state === 'alive') {
            if (this.x < 0) this.x = 0;
            if (this.x > game.canvas.width - this.width) this.x = game.canvas.width - this.width;
            if (this.y < 0) this.y = 0;
            if (this.y > game.canvas.height - this.height) this.y = game.canvas.height - this.height;
        }
    }
}