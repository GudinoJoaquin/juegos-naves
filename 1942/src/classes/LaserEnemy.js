import { Enemy } from './Enemy.js';
import { LaserProjectile } from './LaserProjectile.js';

export class LaserEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 200;
        const speed = 1;
        const animationFrames = assets['enemyLaser'];
        const scale = 2.5;
        super(x, y, hp, speed, animationFrames, scale, assets, game);
        this.scoreValue = 250;
        this.shotCooldown = 3000; // Cooldown for the burst
        this.burstShots = 0;
        this.burstCooldown = 200; // Cooldown between shots in a burst
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive') return;

        // Slow, deliberate movement
        const player = game.player;
        if (player.state === 'alive') {
            const targetX = player.x;
            const targetY = 200; // Stays at a certain height
            const dx = (targetX - this.x) * 0.005 * this.speed;
            const dy = (targetY - this.y) * 0.005 * this.speed;
            this.move(dx, dy);
        }

        const projectiles = this.shoot(game);
        if (projectiles) {
            projectiles.forEach(p => game.addProjectile(p));
        }
    }

    shoot(game) {
        if (this.state !== 'alive') return null;

        if (this.shotCooldown > 0) {
            this.shotCooldown -= game.deltaTime;
            return null;
        }

        if (this.burstShots > 0 && this.burstCooldown <= 0) {
            this.burstShots--;
            this.burstCooldown = 200; // Reset burst cooldown

            const projectiles = [];
            const projectileSpeed = 8;
            const angleToPlayer = Math.atan2(game.player.y - this.y, game.player.x - this.x);
            const vx = Math.cos(angleToPlayer) * projectileSpeed;
            const vy = Math.sin(angleToPlayer) * projectileSpeed;

            const originX = this.x + this.width / 2;
            const originY = this.y + this.height / 2;

            projectiles.push(new LaserProjectile(originX, originY, vx, vy, 5, 'enemy'));
            return projectiles;

        } else if (this.burstShots <= 0) {
            this.shotCooldown = 4000 + Math.random() * 2000; // Time until next burst
            this.burstShots = 4; // Number of shots in the burst
        }

        if (this.burstCooldown > 0) {
            this.burstCooldown -= game.deltaTime;
        }

        return null;
    }
}
