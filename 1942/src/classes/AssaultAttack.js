import { Projectile } from './Projectile.js';

export class AssaultAttack {
    constructor(enemy) {
        this.enemy = enemy;
        this.shotCooldown = 1000 + Math.random() * 500;
        console.log('AssaultAttack constructor called');
    }

    shoot(game) {
        console.log('AssaultAttack shoot method called');
        if (this.enemy.state !== 'alive') {
            console.log('Enemy not alive, returning null');
            return null;
        }
        if (this.shotCooldown > 0) {
            console.log('Shot cooldown active, returning null. Cooldown:', this.shotCooldown);
            return null;
        }

        this.shotCooldown = 1000 + Math.random() * 500;
        console.log('Shot fired, new cooldown:', this.shotCooldown);

        const projectileSpeed = 10;
        const angleToPlayer = Math.atan2(game.player.y - this.enemy.y, game.player.x - this.enemy.x);
        const vx = Math.cos(angleToPlayer) * projectileSpeed;
        const vy = Math.sin(angleToPlayer) * projectileSpeed;

        const originX = this.enemy.x + this.enemy.width / 2;
        const originY = this.enemy.y + this.enemy.height / 2;

        const newProjectile = new Projectile(originX, originY, vx, vy, 5, 'enemy', [], '#ff00ff');
        console.log('New projectile created:', newProjectile);
        return newProjectile;
    }
}