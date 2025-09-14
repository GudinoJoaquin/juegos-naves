import { Enemy } from './Enemy.js';
import { AssaultAttack } from './AssaultAttack.js';

export class BoostEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 50;
        const speed = 5;
        const animationFrames = assets['enemyBoost'];
        const scale = 1.8;
        super(x, y, hp, speed, animationFrames, scale, assets, game);
        this.scoreValue = 70;
        this.assaultAttack = new AssaultAttack(this);
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive') return;

        // Fast pursuit movement towards the player
        const player = game.player;
        if (player.state === 'alive') {
            const targetX = player.x;
            const targetY = player.y - 200; // Aim slightly above the player
            const dx = (targetX - this.x) * 0.05 * this.speed; // Accelerated movement
            const dy = (targetY - this.y) * 0.05 * this.speed; // Accelerated movement
            this.move(dx, dy);
        }

        const projectile = this.assaultAttack.shoot(game);
        if (projectile) {
            game.addProjectile(projectile);
        }
    }

    // The shoot method is now handled by AssaultAttack
    shoot() {
        return null;
    }
}
