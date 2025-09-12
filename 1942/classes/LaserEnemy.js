import { Enemy } from './Enemy.js';
import { LaserProjectile } from './LaserProjectile.js';

export class LaserEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 40;
        const speed = 3;
        const animationFrames = assets['enemyLaser'];
        const scale = 2.0;
        super(x, y, hp, speed, animationFrames, scale, assets, game);
        this.scoreValue = 30;
        this.shotCooldown = 2500 + Math.random() * 1000; // Initial cooldown
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive') return;

        // Movement: move from point to point
        if (this.aiState === 'entering') {
            this.move(0, this.speed);
            if (this.y >= this.attackY) {
                this.aiState = 'attacking';
            }
        } else if (this.aiState === 'attacking') {
            const dist = Math.hypot(this.targetPoint.x - this.x, this.targetPoint.y - this.y);
            if (dist < this.speed * 2) {
                this.targetPoint = { x: Math.random() * game.canvas.width, y: Math.random() * (game.canvas.height * 0.5) };
            }
            const angleToPoint = Math.atan2(this.targetPoint.y - this.y, this.targetPoint.x - this.x);
            const dx = Math.cos(angleToPoint) * this.speed;
            const dy = Math.sin(angleToPoint) * this.speed;
            this.move(dx, dy);
        }

        const projectile = this.shoot(game);
        if (projectile) {
            game.addProjectile(projectile);
        }
    }

    shoot(game) {
        if (this.state !== 'alive' || this.shotCooldown > 0) return null;

        this.shotCooldown = 2500 + Math.random() * 1000; // Reset cooldown

        const projectileSpeed = 8;
        const angleToPlayer = Math.atan2(game.player.y - this.y, game.player.x - this.x);
        const vx = Math.cos(angleToPlayer) * projectileSpeed;
        const vy = Math.sin(angleToPlayer) * projectileSpeed;

        const originX = this.x + this.width / 2;
        const originY = this.y + this.height / 2;

        return new LaserProjectile(originX, originY, vx, vy, 5, 'enemy');
    }
}
