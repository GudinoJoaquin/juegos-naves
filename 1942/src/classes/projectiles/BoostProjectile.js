import { PlayerProjectile } from './PlayerProjectile.js';

export class BoostProjectile extends PlayerProjectile {
    constructor(x, y, vx, vy, damage, owner, animationFrames) {
        super(x, y, vx, vy, damage, owner, animationFrames);
        this.width = 8; // Slightly wider than normal player projectile
        this.height = 20; // Slightly taller
    }

    draw(ctx) {
        // Use the player shot asset, or a default if not available
        if (this.animationFrames && this.animationFrames.length > 0) {
            const frame = this.animationFrames[this.currentFrame];
            ctx.drawImage(frame, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = 'blue';
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
    }
}
