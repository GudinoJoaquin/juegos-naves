export class Grenade {
    constructor(x, y, targetX, targetY, speed, damage, radius) { // Added targetX, targetY
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
        this.chargeTime = 1500;
        this.chargeTimer = this.chargeTime;

        this.exploded = false;
        this.explosionTimer = 500;
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
            const progress = 1 - this.chargeTimer / this.chargeTime;
            let color = 'green';
            if (progress > 0.66) color = 'red';
            else if (progress > 0.33) color = 'yellow';

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 10, 0, Math.PI*2);
            ctx.fill();
        } else {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,100,0,0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            ctx.stroke();
            ctx.restore();
        }
    }
}