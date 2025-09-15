export class PlayerProjectile {
    constructor(x, y, vx, vy, damage, owner) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.owner = owner;
        this.isDestroyed = false;
        this.width = 4; // Thin rectangle
        this.height = 16; // Height of the rectangle
    }

    update(deltaTime, game) {
        this.x += this.vx;
        this.y += this.vy;

        // Check if out of bounds
        if (this.x < 0 || this.x > game.canvas.width || this.y < 0 || this.y > game.canvas.height) {
            this.isDestroyed = true;
        }
    }

    draw(ctx) {
        if (this.isDestroyed) return;
        ctx.fillStyle = 'blue'; // Default player projectile color
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}
