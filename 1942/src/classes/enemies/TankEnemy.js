import { Enemy } from './Enemy.js';

export class TankEnemy extends Enemy {
    constructor(x, y, assets, game, options = {}) {
        const {
            hp = 300,
            speed = 1.2,
            scale = 2.5,
            scoreValue = 300,
            minDistance = 80,
            explosionRadius = 150,
            explosionDamage = 50,
            shotCooldown = 2000,
            burstShots = 4,
            burstCooldown = 200,
            level = 1,
            grenadeSpeed = 3,
            grenadeDamage = 30,
            grenadeRadius = 50,
            grenadeChargeTime = 1500,
            grenadeExplosionDuration = 500
        } = options;

        const animationFrames = assets['enemyTank'];
        super(x, y, hp, speed, animationFrames, scale, assets, game, level);

        this.scoreValue = scoreValue;
        this.level = level;

        this.minDistance = minDistance;
        this.explosionRadius = explosionRadius;
        this.explosionDamage = explosionDamage;
        this.hasExploded = false;

        // Attack-specific properties
        this.shotCooldown = shotCooldown;
        this.burstShots = burstShots;
        this.burstCooldown = burstCooldown;
        this.grenades = [];

        // Grenade properties
        this.grenadeSpeed = grenadeSpeed;
        this.grenadeDamage = grenadeDamage;
        this.grenadeRadius = grenadeRadius;
        this.grenadeChargeTime = grenadeChargeTime;
        this.grenadeExplosionDuration = grenadeExplosionDuration;
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);

        // Update grenades here
        this.grenades.forEach(g => g.update(game, deltaTime));
        this.grenades = this.grenades.filter(g => !g.exploded || g.explosionTimer > 0);

        // Solo el movimiento y disparo dependen de estar vivo
        if (this.state === 'alive') {
            const player = game.player;
            if (player && player.state === 'alive') {
                // Movimiento pegajoso
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const dist = Math.hypot(dx, dy);
                if (dist > this.minDistance) {
                    this.x += (dx / dist) * this.speed;
                    this.y += (dy / dist) * this.speed;
                }

                // Disparo
                this.shoot(game, player, deltaTime);
            }
        }
    }

    shoot(game, player, deltaTime) {
        if (this.shotCooldown > 0) {
            this.shotCooldown -= deltaTime;
            return;
        }

        if (this.burstShots > 0 && this.burstCooldown <= 0) {
            this.burstShots--;
            this.burstCooldown = 200;

            const originX = this.x + this.width / 2;
            const originY = this.y + this.height / 2;

            // Pass player's current position as target
            const targetPlayerX = player.x + player.width / 2;
            const targetPlayerY = player.y + player.height / 2;

            // disparar 4 granadas hacia el jugador (2 y 2)
            const spreadDistance = 50; // Distance to spread the grenades
            const baseAngle = Math.atan2(targetPlayerY - originY, targetPlayerX - originX); // Angle to player

            // First pair (straight towards player)
            this.grenades.push(new Grenade(originX, originY, targetPlayerX, targetPlayerY, this.grenadeSpeed, this.grenadeDamage, this.grenadeRadius, this.grenadeChargeTime, this.grenadeExplosionDuration));
            this.grenades.push(new Grenade(originX, originY, targetPlayerX, targetPlayerY, this.grenadeSpeed, this.grenadeDamage, this.grenadeRadius, this.grenadeChargeTime, this.grenadeExplosionDuration));

            // Second pair (offset from player's position)
            const offsetAngle1 = baseAngle + Math.PI / 8; // +22.5 degrees
            const offsetAngle2 = baseAngle - Math.PI / 8; // -22.5 degrees

            this.grenades.push(new Grenade(originX, originY, targetPlayerX + Math.cos(offsetAngle1) * spreadDistance, targetPlayerY + Math.sin(offsetAngle1) * spreadDistance, this.grenadeSpeed, this.grenadeDamage, this.grenadeRadius, this.grenadeChargeTime, this.grenadeExplosionDuration));
            this.grenades.push(new Grenade(originX, originY, targetPlayerX + Math.cos(offsetAngle2) * spreadDistance, targetPlayerY + Math.sin(offsetAngle2) * spreadDistance, this.grenadeSpeed, this.grenadeDamage, this.grenadeRadius, this.grenadeChargeTime, this.grenadeExplosionDuration));


        } else if (this.burstShots <= 0) {
            this.shotCooldown = 3000 + Math.random() * 2000;
            this.burstShots = 4; // Reset to 4
        }

        if (this.burstCooldown > 0) this.burstCooldown -= deltaTime;
    }

    onDeath() {
        if (!this.hasExploded) {
            this.hasExploded = true;
            // Check for player collision within explosion radius
            const player = this.game.player; // Access game from this.game
            const distance = Math.sqrt(
                Math.pow(this.x - player.x, 2) +
                Math.pow(this.y - player.y, 2)
            );

            if (distance < this.explosionRadius + Math.max(player.width, player.height) / 2) {
                player.takeDamage(this.explosionDamage);
            }
        }
    }

    draw(ctx) {
        // dibujar todas las granadas aunque la nave esté muerta
        this.grenades.forEach(g => g.draw(ctx));

        super.draw(ctx);
    }
}

class Grenade {
    constructor(x, y, targetX, targetY, speed, damage, radius, chargeTime, explosionDuration) { // Added targetX, targetY
        this.x = x;
        this.y = y;
        this.targetX = targetX; // Store target position
        this.targetY = targetY; // Store target position
        this.speed = speed;
        this.damage = damage;
        this.radius = radius;

        // Calculate initial velocity to reach target
        const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.charging = true;
        this.chargeTime = chargeTime;
        this.chargeTimer = this.chargeTime;

        this.exploded = false;
        this.explosionTimer = explosionDuration;
    }

    update(game, deltaTime) {
        if (this.exploded) {
            this.explosionTimer -= deltaTime;
            return;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Check if reached target
        const distToTarget = Math.hypot(this.targetX - this.x, this.targetY - this.y);
        if (distToTarget < this.speed) { // If close enough, explode
            this.x = this.targetX; // Snap to target for explosion
            this.y = this.targetY;
            this.explode(game);
        }

        this.chargeTimer -= deltaTime;
        // The chargeTimer is now only for visual effect, explosion is by distance
    }

    explode(game) {
        this.exploded = true;
        this.explosionTimer = 500;

        const player = game.player;
        if (player && player.state === 'alive') {
            const dx = this.x - (player.x + player.width/2);
            const dy = this.y - (player.y + player.height/2);
            if (Math.hypot(dx, dy) <= this.radius) {
                player.takeDamage(this.damage);
            }
        }
    }

    draw(ctx) {
        if (!this.exploded) {
            let color = 'red'; // Changed to always red

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 10, 0, Math.PI*2);
            ctx.fill();
        } else {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,0,0,0.5)'; // Changed to red
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            ctx.stroke();
            ctx.restore();
        }
    }
}