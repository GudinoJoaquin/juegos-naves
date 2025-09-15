export class LaserBeamProjectile {
    constructor(x, y, damage, owner, assets) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.owner = owner;
        this.assets = assets;
        this.isDestroyed = false;
        this.width = 40; // Laser beam width (thickness)
        this.laserAngle = -Math.PI / 2; // Always straight up
        this.lastDamageTime = 0; // For damage over time
        this.damageInterval = 200; // Damage every 200ms
    }

    update(deltaTime, game) {
        // Laser position is updated by the player, so no movement here.

        // Apply damage over time to enemies
        game.enemies.forEach(enemy => {
            if (enemy.state === 'alive' && this.collidesWith(enemy, game)) { // Pass game for canvas dimensions
                if (game.gameTime - this.lastDamageTime > this.damageInterval) {
                    enemy.takeDamage(this.damage);
                    this.lastDamageTime = game.gameTime;
                }
            }
        });

        // Laser is destroyed when power-up expires, not by going off-screen
        // This.isDestroyed will be set by Player.js when power-up timer runs out.
    }

    draw(ctx) {
        const originX = this.x; // Player's x is already centered for the laser
        const originY = this.y; // Player's y is the base of the laser

        const laserLength = ctx.canvas.height; // Laser extends to top of screen

        ctx.save();
        ctx.translate(originX, originY);
        ctx.rotate(this.laserAngle); // Rotate to point upwards

        // Blue gradient for the laser beam
        const gradient = ctx.createLinearGradient(0, 0, 0, -laserLength); // Vertical gradient
        gradient.addColorStop(0, 'rgba(0, 191, 255, 0.9)'); // Bright blue at origin
        gradient.addColorStop(0.5, 'rgba(0, 150, 255, 0.7)'); // Mid blue
        gradient.addColorStop(1, 'rgba(0, 100, 255, 0.3)'); // Fading blue at top

        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width / 2, -laserLength, this.width, laserLength); // Draw from origin upwards

        // Add a strong glow effect
        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(0, 191, 255, 1)'; // Intense blue glow
        ctx.fillStyle = 'rgba(0, 191, 255, 0.6)'; // Semi-transparent blue for glow
        ctx.fillRect(-this.width / 2, -laserLength, this.width, laserLength);

        ctx.restore();
    }

    collidesWith(enemy, game) {
        // Simplified collision for a vertical laser beam
        // Check if enemy's x range overlaps with laser's x range
        const laserLeft = this.x - this.width / 2;
        const laserRight = this.x + this.width / 2;

        const enemyLeft = enemy.x;
        const enemyRight = enemy.x + enemy.width;

        // Check if enemy's y range overlaps with laser's y range (from player up to top of screen)
        const laserBottom = this.y;
        const laserTop = 0; // Top of the canvas

        const enemyBottom = enemy.y + enemy.height;
        const enemyTop = enemy.y;

        return laserRight > enemyLeft &&
               laserLeft < enemyRight &&
               laserBottom > enemyTop && // Laser starts at player's y and goes up
               laserTop < enemyBottom; // Laser goes to top of screen
    }
}