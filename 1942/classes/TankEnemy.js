import { Enemy } from './Enemy.js';
import { HomingProjectile } from './HomingProjectile.js';

export class TankEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 100;
        const speed = 1.5;
        const animationFrames = assets['enemyTank'];
        const scale = 2.0;
        super(x, y, hp, speed, animationFrames, scale, assets, game);
        this.scoreValue = 50;
        this.shotCooldown = 5000 + Math.random() * 2000; // Initial cooldown
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive') return;

        // Slow movement towards the player
        const player = game.player;
        if (player.state === 'alive') {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            const dx = Math.cos(angle) * this.speed;
            const dy = Math.sin(angle) * this.speed;
            this.move(dx, dy);
        }

        const projectile = this.shoot(game);
        if (projectile) {
            game.addProjectile(projectile);
        }
    }

    shoot(game) {
        if (this.state !== 'alive' || this.shotCooldown > 0) return null;

        this.shotCooldown = 5000 + Math.random() * 2000; // Reset cooldown

        const originX = this.x + this.width / 2;
        const originY = this.y + this.height / 2;

        // HomingProjectile needs speed in its constructor now
        const projectileSpeed = 3; // Example speed for homing projectile
        return new HomingProjectile(originX, originY, 0, -projectileSpeed, 15, 'enemy', '#ffff00', projectileSpeed);
    }
}
