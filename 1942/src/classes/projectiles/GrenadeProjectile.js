export class GrenadeProjectile {
    constructor(x, y, vx, vy, damage, owner, assets) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.owner = owner;
        this.assets = assets;
        this.isDestroyed = false;
        this.radius = 4; // Smaller sphere size
    }

    update(deltaTime, game) {
        this.x += this.vx * (deltaTime / 16.67);
        this.y += this.vy * (deltaTime / 16.67);

        // Collision detection with enemies
        game.enemies.forEach(enemy => {
            if (enemy.state === 'alive') {
                const distance = Math.hypot(this.x - (enemy.x + enemy.width / 2), this.y - (enemy.y + enemy.height / 2));
                if (distance < this.radius + enemy.width / 2) { // Simple circle-rectangle collision approximation
                    enemy.takeDamage(this.damage);
                    this.isDestroyed = true; // Destroy projectile on impact
                }
            }
        });

        // Check if out of bounds
        if (this.x < 0 || this.x > game.canvas.width || this.y < 0 || this.y > game.canvas.height) {
            this.isDestroyed = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
