import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';

export class AssaultEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 30;
        const speed = 2.5;
        const animationFrames = assets['enemyAssault'];
        const scale = 2.0;
        super(x, y, hp, speed, animationFrames, scale, assets, game);
        this.scoreValue = 40;
        this.shotCooldown = 1000 + Math.random() * 500; // Initial cooldown
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive') return;

        // Fast pursuit movement towards the player
        const player = game.player;
        if (player.state === 'alive') {
            const targetX = player.x;
            const targetY = player.y - 250; // Aim slightly above the player
            const dx = (targetX - this.x) * 0.03 * this.speed; // Accelerated movement
            const dy = (targetY - this.y) * 0.03 * this.speed; // Accelerated movement
            this.move(dx, dy);
        }

        const projectile = this.shoot(game);
        if (projectile) {
            game.addProjectile(projectile);
        }
    }

    shoot(game) {
        if (this.state !== 'alive' || this.shotCooldown > 0) return null;

        this.shotCooldown = 1000 + Math.random() * 500; // Reset cooldown

        const projectileSpeed = 10; // Fast projectile
        const angleToPlayer = Math.atan2(game.player.y - this.y, game.player.x - this.x);
        const vx = Math.cos(angleToPlayer) * projectileSpeed;
        const vy = Math.sin(angleToPlayer) * projectileSpeed;

        const originX = this.x + this.width / 2;
        const originY = this.y + this.height / 2;

        return new Projectile(originX, originY, vx, vy, 5, 'enemy', [], '#ff00ff'); // Magenta color
    }
}
