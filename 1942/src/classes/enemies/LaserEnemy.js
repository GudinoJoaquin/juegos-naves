import { Enemy } from './Enemy.js';

export class LaserEnemy extends Enemy {
    constructor(x, y, assets, game, options = {}) {
        const {
            hp = 200,
            speed = 1.5,
            scale = 2.5,
            scoreValue = 250,
            targetY = 120,
            laserDuration = 1500,
            laserCooldown = 2000,
            laserWidth = 20,
            chargeTime = 800,
            retreatDistance = 120,
            retreatSpeed = 1.5,
            level = 1
        } = options;

        const animationFrames = assets['enemyLaser'];
        super(x, y, hp, speed, animationFrames, scale, assets, game, level);

        this.scoreValue = scoreValue;
        this.level = level;

        this.statePhase = "entering";
        this.targetY = targetY;

        // Láser
        this.laserActive = false;
        this.laserDuration = laserDuration;
        this.laserCooldown = laserCooldown;
        this.laserTimer = 0;
        this.laserWidth = laserWidth;

        // Carga
        this.charging = false;
        this.chargeTime = chargeTime;
        this.chargeTimer = 0;

        this.laserAngle = 0;

        // Movimiento de alejamiento
        this.retreatDistance = retreatDistance;
        this.retreatSpeed = retreatSpeed;
        this.retreatTarget = null;

        // Pulso triángulo
        this.trianglePulse = 0;
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive') return;

        const player = game.player;
        if (!player) return;

        switch (this.statePhase) {
            case "entering":
                if (this.y < this.targetY) this.y += this.speed;
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
                if (this.retreatTarget && Math.hypot(this.x - this.retreatTarget.x, this.y - this.retreatTarget.y) < 2) {
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
        this.laserAngle = Math.atan2(player.y - this.y, player.x - this.x);
    }

    activateLaser() {
        this.laserActive = true;
        this.laserTimer = this.laserDuration;
        this.statePhase = "firing";
    }

    calculateRetreat(player, game) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const length = Math.hypot(dx, dy);
        const ux = -dy / length;
        const uy = dx / length;

        this.retreatTarget = {
            x: this.clamp(this.x + ux * this.retreatDistance, 0, game.canvas.width - this.width),
            y: this.clamp(this.y + uy * this.retreatDistance, 0, game.canvas.height - this.height)
        };
    }

    moveAwayFromPlayer(player, game) {
        if (this.statePhase === "firing") return;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < this.retreatDistance) {
            this.x += (dx / dist) * this.retreatSpeed;
            this.y += (dy / dist) * this.retreatSpeed;
        }
        this.clampPosition(game);
    }

    moveTowards(target, deltaTime, game) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1) {
            this.x += (dx / dist) * this.retreatSpeed * (deltaTime / 16);
            this.y += (dy / dist) * this.retreatSpeed * (deltaTime / 16);
        }
        this.clampPosition(game);
    }

    clampPosition(game) {
        this.x = this.clamp(this.x, 0, game.canvas.width - this.width);
        this.y = this.clamp(this.y, 0, game.canvas.height - this.height);
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    checkLaserCollision(game) {
        const player = game.player;
        if (!player || player.state !== 'alive') return;

        const originX = this.x + this.width / 2;
        const originY = this.y + this.height / 2;
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
            const pulseSize = 6 + Math.sin(this.trianglePulse) * 2;

            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.laserAngle);
            ctx.fillStyle = 'rgba(255,0,0,1)'; // Changed to solid red
            ctx.beginPath();
            ctx.moveTo(this.width/2 + pulseSize, 0);
            ctx.lineTo(this.width/2 - pulseSize/2, -pulseSize);
            ctx.lineTo(this.width/2 - pulseSize/2, pulseSize);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        if (this.laserActive) {
            const originX = this.x + this.width / 2;
            const originY = this.y + this.height / 2;
            const laserLength = ctx.canvas.width + ctx.canvas.height;
            const dx = Math.cos(this.laserAngle);
            const dy = Math.sin(this.laserAngle);

            ctx.save();
            ctx.translate(originX, originY);
            ctx.rotate(this.laserAngle);

            const gradient = ctx.createLinearGradient(0, 0, laserLength, 0);
            gradient.addColorStop(0, 'rgba(255,0,0,0.9)');
            gradient.addColorStop(1, 'rgba(255,0,0,0.3)'); // Changed to red with lower opacity

            ctx.fillStyle = gradient;
            ctx.fillRect(0, -this.laserWidth / 2, laserLength, this.laserWidth);
            ctx.restore();
        }

        super.draw(ctx); // Moved after the effects
    }
}