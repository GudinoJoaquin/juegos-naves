import { Projectile } from './Projectile.js';

export class LaserProjectile extends Projectile {
    constructor(x, y, vx, vy, damage, owner) {
        super(x, y, vx, vy, damage, owner, []);
        this.width = 5; // Ancho del láser
        this.height = 60; // Largo del láser
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        // Calculate angle from vx and vy, and add PI/2 because the laser sprite is drawn vertically by default
        const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
        context.rotate(angle);

        context.fillStyle = '#00ff00'; // Color verde brillante
        context.shadowColor = '#00ff00';
        context.shadowBlur = 10;
        context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        context.shadowBlur = 0; // Resetear sombra
        context.restore();
    }
}
