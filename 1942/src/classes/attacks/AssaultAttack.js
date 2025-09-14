import { Projectile } from '../projectiles/Projectile.js';

export class AssaultAttack {
    constructor(enemy) {
        this.enemy = enemy;
        this.shotCooldown = 1000 + Math.random() * 500;
    }

    shoot(game) {
        if (this.enemy.state !== 'alive') {
            return null;
        }
        if (this.shotCooldown > 0) {
            return null;
        }

        this.shotCooldown = 1000 + Math.random() * 500;

        const projectileSpeed = 10;
        const angleToPlayer = Math.atan2(game.player.y - this.enemy.y, game.player.x - this.enemy.x);
        const vx = Math.cos(angleToPlayer) * projectileSpeed;
        const vy = Math.sin(angleToPlayer) * projectileSpeed;

        const originX = this.enemy.x + this.enemy.width / 2;
        const originY = this.enemy.y + this.enemy.height / 2;

        const newProjectile = new Projectile(originX, originY, vx, vy, 5, 'enemy', [], '#ff00ff');
        return newProjectile;
    }
}