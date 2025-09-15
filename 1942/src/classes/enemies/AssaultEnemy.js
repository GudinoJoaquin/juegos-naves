import { Enemy } from './Enemy.js';

export class AssaultEnemy extends Enemy {
    constructor(x, y, assets, game, options = {}) {
        const {
            hp = 30,
            speed = 2.5,
            scale = 2.0,
            scoreValue = 40,
            burstShots = 3,
            burstCooldown = 150,
            shotCooldown = 2000,
            projectileSpeed = 6,
            projectileWidth = 30,
            projectileHeight = 5,
            projectileDamage = 5,
            projectileDuration = 2000,
            minDistance = 150,
            level = 1
        } = options;

        const animationFrames = assets['enemyAssault'];
        super(x, y, hp, speed, animationFrames, scale, assets, game, level);

        this.scoreValue = scoreValue;
        this.level = level;

        // Configuración de ráfaga
        this.burstShots = burstShots;
        this.burstCooldown = burstCooldown;
        this.burstTimer = 0;
        this.shotCooldown = shotCooldown;

        this.projectiles = [];
        this.projectileSpeed = projectileSpeed;
        this.projectileWidth = projectileWidth;
        this.projectileHeight = projectileHeight;
        this.projectileDamage = projectileDamage;
        this.projectileDuration = projectileDuration;

        // Distancia mínima a mantener del jugador
        this.minDistance = minDistance;
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive' && this.projectiles.length === 0) return;

        const player = game.player;
        if (!player) return;

        // Movimiento suave hacia el jugador, manteniendo distancia
        if (this.state === 'alive' && player.state === 'alive') {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.hypot(dx, dy);

            if (distance > this.minDistance) {
                // Solo moverse si está más lejos de la distancia mínima
                const moveX = (dx / distance) * this.speed;
                const moveY = (dy / distance) * this.speed;
                this.move(moveX, moveY);
            }
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
        // Dibujar proyectiles rectangulares rojos, largos y finitos
        this.projectiles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = 'red';
            ctx.fillRect(-this.projectileWidth/2, -this.projectileHeight/2, this.projectileWidth, this.projectileHeight);
            ctx.restore();
        });

        super.draw(ctx);
    }
}
