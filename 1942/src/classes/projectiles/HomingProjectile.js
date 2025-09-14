import { Projectile } from './Projectile.js';

export class HomingProjectile extends Projectile {
    constructor(x, y, vx, vy, damage, owner, color, homingSpeed) {
        super(x, y, vx, vy, damage, owner, [], color);
        this.width = 15;
        this.height = 15;
        this.homingSpeed = homingSpeed;
    }

    update(deltaTime, game) {
        // Homing logic
        const player = game.player;
        if (player.state === 'alive') {
            const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
            this.vx = Math.cos(angleToPlayer) * this.homingSpeed;
            this.vy = Math.sin(angleToPlayer) * this.homingSpeed;
        }

        super.update(deltaTime, game);
    }
}
