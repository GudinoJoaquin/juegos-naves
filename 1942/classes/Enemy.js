import { Spaceship } from './Spaceship.js';
import { Projectile } from './Projectile.js';
import { LaserProjectile } from './LaserProjectile.js';

export class Enemy extends Spaceship {
    constructor(x, y, enemyType, assets, game) {
        const stats = {
            default: { hp: 20, speed: 4, frames: assets['enemyDefault'], scale: 2.0, score: 10 },
            tank: { hp: 100, speed: 1.5, frames: assets['enemyTank'], scale: 2.0, score: 50 },
            laser: { hp: 40, speed: 3, frames: assets['enemyLaser'], scale: 2.0, score: 30 },
            boost: { hp: 30, speed: 2.5, frames: assets['enemyBoost'], scale: 2.0, score: 40 }
        };

        const currentStats = stats[enemyType];
        if (!currentStats) {
            throw new Error(`Tipo de enemigo no válido: ${enemyType}`);
        }

        super(x, y, currentStats.hp, currentStats.speed, currentStats.frames, currentStats.scale, 'up', assets);
        this.enemyType = enemyType;
        this.assets = assets;
        this.scoreValue = currentStats.score;

        // --- IA --- 
        this.aiState = 'entering';
        this.shotCooldown = 2000 + Math.random() * 2000;
        this.age = 0;
        this.attackY = Math.random() * (game.canvas.height * 0.3) + 50;
        this.targetPoint = { x: Math.random() * game.canvas.width, y: this.attackY };
    }

    shoot(game) {
        if (this.state !== 'alive' || this.shotCooldown > 0) return null;

        let projectile;
        const projectileSpeed = 8;
        
        // Calcular el ángulo hacia el jugador justo en el momento del disparo
        const angleToPlayer = Math.atan2(game.player.y - this.y, game.player.x - this.x);
        const vx = Math.cos(angleToPlayer) * projectileSpeed;
        const vy = Math.sin(angleToPlayer) * projectileSpeed;

        const originX = this.x + this.width / 2;
        const originY = this.y + this.height / 2;

        switch (this.enemyType) {
            case 'tank':
                this.shotCooldown = 5000 + Math.random() * 2000;
                projectile = new HomingProjectile(originX, originY, 0, -3, 15, 'enemy', '#ffff00'); // Amarillo
                break;
            case 'laser':
                this.shotCooldown = 2500 + Math.random() * 1000;
                projectile = new LaserProjectile(originX, originY, vx, vy, 5, 'enemy');
                break;
            case 'boost':
                this.shotCooldown = 1000 + Math.random() * 500;
                projectile = new Projectile(originX, originY, vx, vy, 5, 'enemy', [], '#ff00ff');
                break;
            default:
                projectile = null;
        }
        return projectile;
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive') return;

        this.isMoving = true;
        this.age += deltaTime;
        if (this.shotCooldown > 0) {
            this.shotCooldown -= deltaTime;
        }

        const player = game.player;
        let dx = 0, dy = 0;

        // --- Lógica de Movimiento ---
        if (this.enemyType === 'default' || this.enemyType === 'tank') { // Kamikazes
            if (player.state === 'alive') {
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                dx = Math.cos(angle) * this.speed;
                dy = Math.sin(angle) * this.speed;
            }
        } else { // Enemigos que no chocan
            if (this.aiState === 'entering') {
                dy = this.speed;
                if (this.y >= this.attackY) {
                    this.aiState = 'attacking';
                }
            } else if (this.aiState === 'attacking') {
                switch (this.enemyType) {
                    case 'laser':
                        const dist = Math.hypot(this.targetPoint.x - this.x, this.targetPoint.y - this.y);
                        if (dist < this.speed * 2) {
                            this.targetPoint = { x: Math.random() * game.canvas.width, y: Math.random() * (game.canvas.height * 0.5) };
                        }
                        const angleToPoint = Math.atan2(this.targetPoint.y - this.y, this.targetPoint.x - this.x);
                        dx = Math.cos(angleToPoint) * this.speed;
                        dy = Math.sin(angleToPoint) * this.speed;
                        break;
                    case 'boost':
                        if (player.state === 'alive') {
                            const targetX = player.x;
                            const targetY = player.y - 250;
                            dx = (targetX - this.x) * 0.03;
                            dy = (targetY - this.y) * 0.03;
                        }
                        break;
                }
            }
        }

        this.move(dx, dy);

        // --- Lógica de Rotación ---
        if (player.state === 'alive') {
            const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
            this.angle = angleToPlayer + (Math.PI / 2) + Math.PI; // Apuntar siempre al jugador (corregido)
        }

        if (this.x < 0) this.x = 0;
        if (this.x > game.canvas.width - this.width) this.x = game.canvas.width - this.width;

        const projectile = this.shoot(game);
        if (projectile) {
            game.addProjectile(projectile);
        }

        if (this.y > game.canvas.height || this.y < -this.height * 2) {
            this.state = 'dead';
        }
    }
}