import { Projectile } from './Projectile.js';

export class LaserProjectile extends Projectile {
    constructor(x, y, vx, vy, damage, owner) {
        super(x, y, vx, vy, damage, owner, []);
        this.width = 5; // Ancho del láser
        this.height = 60; // Largo del láser
    }

    draw(context) {
        // Dibuja un rectángulo simple como láser
        context.fillStyle = '#00ff00'; // Color verde brillante
        context.shadowColor = '#00ff00';
        context.shadowBlur = 10;
        context.fillRect(this.x, this.y, this.width, this.height);
        context.shadowBlur = 0; // Resetear sombra
    }
}
