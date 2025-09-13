import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';

export class BossEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 500;
        const speed = 1;
        const animationFrames = assets['enemyBoss'];
        const scale = 3.0;
        super(x, y, hp, speed, animationFrames, scale, assets, game);
        this.scoreValue = 1000;
        this.shotCooldown = 2000; // Cooldown for the burst
        this.burstShots = 0;
        this.burstCooldown = 100; // Cooldown between shots in a burst
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive') return;

        // Slow, deliberate movement
        const player = game.player;
        if (player.state === 'alive') {
            const targetX = player.x;
            const targetY = 100; // Stays at a certain height
            const dx = (targetX - this.x) * 0.01 * this.speed;
            const dy = (targetY - this.y) * 0.01 * this.speed;
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
            this.burstCooldown = 100; // Reset burst cooldown

            const projectiles = [];
            const numProjectiles = 5;
            const angleSpread = Math.PI / 4; // 45 degrees
            const angleToPlayer = Math.atan2(game.player.y - this.y, game.player.x - this.x);

            for (let i = 0; i < numProjectiles; i++) {
                const angle = angleToPlayer - angleSpread / 2 + (angleSpread / (numProjectiles - 1)) * i;
                const projectileSpeed = 7;
                const vx = Math.cos(angle) * projectileSpeed;
                const vy = Math.sin(angle) * projectileSpeed;
                const originX = this.x + this.width / 2;
                const originY = this.y + this.height / 2;
                projectiles.push(new Projectile(originX, originY, vx, vy, 10, 'enemy', [], '#ff8c00')); // Dark orange
            }
            return projectiles;

        } else if (this.burstShots <= 0) {
            this.shotCooldown = 3000 + Math.random() * 2000; // Time until next burst
            this.burstShots = 5; // Number of shots in the burst
        }

        if (this.burstCooldown > 0) {
            this.burstCooldown -= game.deltaTime;
        }

        return null;
    }
}
