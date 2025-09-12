import { Projectile } from './Projectile.js';

export class HomingProjectile extends Projectile {
    constructor(x, y, vx, vy, damage, owner, color, speed = 2, lifetime = 5000, hp = 10) {
        // El misil no tiene animación de sprite, así que pasamos un array vacío
        super(x, y, vx, vy, damage, owner, [], color);

        this.hp = hp;
        this.lifetime = lifetime; // ms
        this.speed = speed; // Usa la velocidad pasada
        this.turnSpeed = 0.05; // Qué tan rápido puede girar
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.isDestroyed = true;
        }
    }

    update(deltaTime, game) {
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.isDestroyed = true;
            return;
        }

        if (game.player && game.player.state === 'alive') {
            // Lógica de persecución
            const angleToPlayer = Math.atan2(game.player.y - this.y, game.player.x - this.x);
            const currentAngle = Math.atan2(this.vy, this.vx);

            // Interpolar suavemente hacia el ángulo del jugador
            let angleDiff = angleToPlayer - currentAngle;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.turnSpeed);

            this.vx = Math.cos(newAngle) * this.speed;
            this.vy = Math.sin(newAngle) * this.speed;
            this.angle = newAngle + Math.PI / 2;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Comprobación de límites de pantalla
        if (this.y < -this.height || this.y > game.canvas.height || this.x < -this.width || this.x > game.canvas.width) {
            this.isDestroyed = true;
        }
    }

    draw(context) {
        // Dibuja una bolita brillante
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.fillStyle = this.color;
        context.shadowColor = this.color;
        context.shadowBlur = 10;
        context.beginPath();
        context.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
}
