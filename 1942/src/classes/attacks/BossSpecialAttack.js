import { Projectile } from '../projectiles/Projectile.js';

export class BossSpecialAttack {
    constructor(enemy) {
        this.enemy = enemy;
        this.shotCooldown = 2500; // Cooldown for this special attack
        this.shotTimer = 0;
        this.numProjectiles = 5; // Number of projectiles in the barrage
        this.spreadAngle = Math.PI / 4; // Total spread angle (45 degrees)
        this.projectileSpeed = 8;
        this.projectileDamage = 15;
    }

    update(game, deltaTime) {
        if (this.shotTimer > 0) {
            this.shotTimer -= deltaTime;
        }
    }

    shoot(game) {
        if (this.enemy.state !== 'alive' || this.shotTimer > 0) {
            return []; // Return an empty array if not alive or on cooldown
        }

        this.shotTimer = this.shotCooldown; // Reset cooldown

        const projectiles = [];
        const baseAngle = Math.atan2(game.player.y - this.enemy.y, game.player.x - this.enemy.x);
        const startAngle = baseAngle - (this.spreadAngle / 2);
        const angleIncrement = this.spreadAngle / (this.numProjectiles - 1);

        for (let i = 0; i < this.numProjectiles; i++) {
            const currentAngle = startAngle + i * angleIncrement;
            const vx = Math.cos(currentAngle) * this.projectileSpeed;
            const vy = Math.sin(currentAngle) * this.projectileSpeed;

            const originX = this.enemy.x + this.enemy.width / 2;
            const originY = this.enemy.y + this.enemy.height / 2;

            const newProjectile = new Projectile(originX, originY, vx, vy, this.projectileDamage, 'enemy', [], '#FFD700'); // Gold color
            projectiles.push(newProjectile);
        }
        return projectiles;
    }
}
