import { LaserProjectile } from './LaserProjectile.js';

export class LaserAttack {
    constructor(enemy) {
        this.enemy = enemy;

        this.statePhase = "entering"; // entering -> idle -> charging -> firing -> retreating
        this.targetY = 120;

        // Láser
        this.laserActive = false;
        this.laserDuration = 1500;
        this.laserCooldown = 2000;
        this.laserTimer = 0;
        this.laserWidth = 20;

        // Carga
        this.charging = false;
        this.chargeTime = 800;
        this.chargeTimer = 0;

        this.laserAngle = 0;

        // Movimiento de alejamiento
        this.retreatDistance = 120; 
        this.retreatSpeed = 1.5;
        this.retreatTarget = null;

        // Pulso triángulo
        this.trianglePulse = 0;
    }

    update(game, deltaTime) {
        if (this.enemy.state !== 'alive') return;

        const player = game.player;
        if (!player) return;

        switch (this.statePhase) {
            case "entering":
                if (this.enemy.y < this.targetY) this.enemy.y += this.enemy.speed;
                else this.statePhase = "idle";
                break;

            case "idle":
                this.laserTimer -= deltaTime;
                this.moveAwayFromPlayer(player, game);
                if (this.laserTimer <= 0) this.startCharging(player);
                break;

            case "charging":
                this.chargeTimer -= deltaTime;
                this.trianglePulse += deltaTime * 0.01;
                if (this.chargeTimer <= 0) {
                    this.charging = false;
                    this.activateLaser();
                }
                break;

            case "firing":
                this.laserTimer -= deltaTime;
                this.checkLaserCollision(game);
                if (this.laserTimer <= 0) {
                    this.laserActive = false;
                    this.statePhase = "retreating";
                    this.calculateRetreat(player, game);
                }
                break;

            case "retreating":
                if (this.retreatTarget) this.moveTowards(this.retreatTarget, deltaTime, game);
                if (this.retreatTarget && Math.hypot(this.enemy.x - this.retreatTarget.x, this.enemy.y - this.retreatTarget.y) < 2) {
                    this.statePhase = "idle";
                    this.laserTimer = this.laserCooldown;
                    this.retreatTarget = null;
                }
                break;
        }
    }

    startCharging(player) {
        this.charging = true;
        this.chargeTimer = this.chargeTime;
        this.statePhase = "charging";
        this.laserAngle = Math.atan2(player.y - this.enemy.y, player.x - this.enemy.x);
    }

    activateLaser() {
        this.laserActive = true;
        this.laserTimer = this.laserDuration;
        this.statePhase = "firing";
    }

    calculateRetreat(player, game) {
        const dx = player.x - this.enemy.x;
        const dy = player.y - this.enemy.y;
        const length = Math.hypot(dx, dy);
        const ux = -dy / length;
        const uy = dx / length;

        this.retreatTarget = {
            x: this.clamp(this.enemy.x + ux * this.retreatDistance, 0, game.canvas.width - this.enemy.width),
            y: this.clamp(this.enemy.y + uy * this.retreatDistance, 0, game.canvas.height - this.enemy.height)
        };
    }

    moveAwayFromPlayer(player, game) {
        if (this.statePhase === "firing") return;
        const dx = this.enemy.x - player.x;
        const dy = this.enemy.y - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < this.retreatDistance) {
            this.enemy.x += (dx / dist) * this.retreatSpeed;
            this.enemy.y += (dy / dist) * this.retreatSpeed;
        }
        this.clampPosition(game);
    }

    moveTowards(target, deltaTime, game) {
        const dx = target.x - this.enemy.x;
        const dy = target.y - this.enemy.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1) {
            this.enemy.x += (dx / dist) * this.retreatSpeed * (deltaTime / 16);
            this.enemy.y += (dy / dist) * this.retreatSpeed * (deltaTime / 16);
        }
        this.clampPosition(game);
    }

    clampPosition(game) {
        this.enemy.x = this.clamp(this.enemy.x, 0, game.canvas.width - this.enemy.width);
        this.enemy.y = this.clamp(this.enemy.y, 0, game.canvas.height - this.enemy.height);
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    checkLaserCollision(game) {
        const player = game.player;
        if (!player || player.state !== 'alive') return;

        const originX = this.enemy.x + this.enemy.width / 2;
        const originY = this.enemy.y + this.enemy.height / 2;
        const dx = Math.cos(this.laserAngle);
        const dy = Math.sin(this.laserAngle);
        const laserLength = game.canvas.width + game.canvas.height;

        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;

        const t = ((px - originX) * dx + (py - originY) * dy);
        if (t >= 0 && t <= laserLength) {
            const closestX = originX + t * dx;
            const closestY = originY + t * dy;
            const distSq = (px - closestX) ** 2 + (py - closestY) ** 2;
            if (distSq < (this.laserWidth * this.laserWidth)) player.takeDamage(1);
        }
    }

    draw(ctx) {
        if (this.charging) {
            const progress = 1 - this.chargeTimer / this.chargeTime;
            const r = Math.min(255, 255*progress);
            const g = Math.min(255, 255*(1-progress));
            const color = `rgba(${r},${g},0,1)`;

            const pulseSize = 6 + Math.sin(this.trianglePulse) * 2;

            ctx.save();
            ctx.translate(this.enemy.x + this.enemy.width / 2, this.enemy.y + this.enemy.height / 2);
            ctx.rotate(this.laserAngle);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(this.enemy.width/2 + pulseSize, 0);
            ctx.lineTo(this.enemy.width/2 - pulseSize/2, -pulseSize);
            ctx.lineTo(this.enemy.width/2 - pulseSize/2, pulseSize);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        if (this.laserActive) {
            const originX = this.enemy.x + this.enemy.width / 2;
            const originY = this.enemy.y + this.enemy.height / 2;
            const laserLength = ctx.canvas.width + ctx.canvas.height;
            const dx = Math.cos(this.laserAngle);
            const dy = Math.sin(this.laserAngle);

            ctx.save();
            ctx.translate(originX, originY);
            ctx.rotate(this.laserAngle);

            const gradient = ctx.createLinearGradient(0, 0, laserLength, 0);
            gradient.addColorStop(0, 'rgba(255,0,0,0.9)');
            gradient.addColorStop(1, 'rgba(255,100,0,0.3)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, -this.laserWidth / 2, laserLength, this.laserWidth);
            ctx.restore();
        }
    }
}
