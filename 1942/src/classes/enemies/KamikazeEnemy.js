import { Enemy } from './Enemy.js';

export class KamikazeEnemy extends Enemy {
    constructor(x, y, assets, game, options = {}) {
        const {
            hp = 20,
            speed = 4,
            scale = 2.0,
            scoreValue = 10,
            explosionRadius = 100,
            explosionDamage = 30,
            explosionDuration = 800,
            level = 1
        } = options;

        const animationFrames = assets['enemyKamikaze'];
        super(x, y, hp, speed, animationFrames, scale, assets, game, level);

        this.scoreValue = scoreValue;
        this.level = level;

        this.explosionRadius = explosionRadius;
        this.explosionDamage = explosionDamage;
        this.hasExploded = false;

        this.explosionTimer = 0;
        this.explosionDuration = explosionDuration;
        this.currentExplosionRadius = 0;
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
        // Dibujar explosión animada
        if (this.hasExploded && this.explosionTimer > 0) {
            const alpha = this.explosionTimer / this.explosionDuration;
            ctx.save();
            ctx.strokeStyle = `rgba(255,0,0,${alpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.currentExplosionRadius, 0, Math.PI*2);
            ctx.stroke();
            ctx.restore();
        }

        super.draw(ctx);
    }

    shoot() {
        return null;
    }
}
