import { Enemy } from './Enemy.js';

export class KamikazeEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 20;
        const speed = 4;
        const animationFrames = assets['enemyKamikaze'];
        const scale = 2.0;
        super(x, y, hp, speed, animationFrames, scale, assets, game);

        this.scoreValue = 10;
        this.explosionRadius = 100;
        this.explosionDamage = 30;
        this.hasExploded = false;

        this.explosionTimer = 0; // Tiempo restante de explosión
        this.explosionDuration = 800; // 0.8 segundos
        this.currentExplosionRadius = 0; // radio actual durante animación
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);

        const player = game.player;

        if (this.state === 'dying' && !this.hasExploded) {
            this.hasExploded = true;
            this.explosionTimer = this.explosionDuration;
            this.currentExplosionRadius = 0;
        }

        // Animación de la explosión
        if (this.hasExploded && this.explosionTimer > 0) {
            this.explosionTimer -= deltaTime;

            // Crece el radio progresivamente
            const progress = 1 - this.explosionTimer / this.explosionDuration;
            this.currentExplosionRadius = this.explosionRadius * progress;

            // Revisar daño al jugador mientras la explosión se expande
            if (player && player.state === 'alive') {
                const dx = this.x - (player.x + player.width/2);
                const dy = this.y - (player.y + player.height/2);
                const distance = Math.hypot(dx, dy);

                if (distance <= this.currentExplosionRadius + Math.max(player.width, player.height)/2) {
                    player.takeDamage(this.explosionDamage);
                }
            }
        }

        if (this.state !== 'alive') return;

        // Movimiento kamikaze hacia el jugador
        if (player && player.state === 'alive') {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            const dx = Math.cos(angle) * this.speed;
            const dy = Math.sin(angle) * this.speed;
            this.move(dx, dy);
        }
    }

    draw(ctx) {
        super.draw(ctx);

        // Dibujar explosión animada
        if (this.hasExploded && this.explosionTimer > 0) {
            const alpha = this.explosionTimer / this.explosionDuration;
            ctx.save();
            ctx.strokeStyle = `rgba(255,100,0,${alpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.currentExplosionRadius, 0, Math.PI*2);
            ctx.stroke();
            ctx.restore();
        }
    }

    shoot() {
        return null;
    }
}
