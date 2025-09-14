import { Enemy } from './Enemy.js';

export class AssaultEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 30;
        const speed = 2.5;
        const animationFrames = assets['enemyAssault'];
        const scale = 2.0;
        super(x, y, hp, speed, animationFrames, scale, assets, game);

        this.scoreValue = 40;

        // Configuración de ráfaga
        this.burstShots = 3;
        this.burstCooldown = 150;
        this.burstTimer = 0;
        this.shotCooldown = 2000;

        this.projectiles = [];
        this.projectileSpeed = 6;
        this.projectileWidth = 30;   // más finito
        this.projectileHeight = 5; // más largo
        this.projectileDamage = 5;  // más daño
        this.projectileDuration = 2000;
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive' && this.projectiles.length === 0) return;

        const player = game.player;
        if (!player) return;

        // Movimiento rápido hacia el jugador
        if (player.state === 'alive') {
            const targetX = player.x;
            const targetY = player.y - 250;
            const dx = (targetX - this.x) * 0.03 * this.speed;
            const dy = (targetY - this.y) * 0.03 * this.speed;
            this.move(dx, dy);
        }

        // Manejar ráfaga solo si la nave está viva
        if (this.state === 'alive') this.handleBurstShooting(player, deltaTime);

        // Actualizar proyectiles
        this.projectiles.forEach(p => {
            p.x += Math.cos(p.angle) * this.projectileSpeed;
            p.y += Math.sin(p.angle) * this.projectileSpeed;
            p.timer -= deltaTime;

            // Colisión con jugador
            if (player.state === 'alive') {
                const px = player.x + player.width / 2;
                const py = player.y + player.height / 2;
                const dx = px - p.x;
                const dy = py - p.y;
                if (Math.abs(dx) < this.projectileWidth && Math.abs(dy) < this.projectileHeight) {
                    player.takeDamage(p.damage);
                    p.timer = 0;
                }
            }
        });

        // Limpiar proyectiles vencidos
        this.projectiles = this.projectiles.filter(p => p.timer > 0);
    }

    handleBurstShooting(player, deltaTime) {
        if (this.shotCooldown > 0) {
            this.shotCooldown -= deltaTime;
            return;
        }

        if (this.burstShots > 0) {
            this.burstTimer -= deltaTime;
            if (this.burstTimer <= 0) {
                this.fireBlaster(player);
                this.burstShots--;
                this.burstTimer = this.burstCooldown;
            }
        } else {
            this.shotCooldown = 2000 + Math.random() * 1000;
            this.burstShots = 3;
        }
    }

    fireBlaster(player) {
        const originX = this.x + this.width / 2;
        const originY = this.y + this.height / 2;
        const angle = Math.atan2(player.y - this.y, player.x - this.x);

        this.projectiles.push({
            x: originX,
            y: originY,
            angle: angle,
            timer: this.projectileDuration,
            damage: this.projectileDamage
        });
    }

    draw(ctx) {
        super.draw(ctx);

        // Dibujar proyectiles rectangulares rojos, largos y finitos
        this.projectiles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = 'red';
            ctx.fillRect(-this.projectileWidth/2, -this.projectileHeight/2, this.projectileWidth, this.projectileHeight);
            ctx.restore();
        });
    }
}
