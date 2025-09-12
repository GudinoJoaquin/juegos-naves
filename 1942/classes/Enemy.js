import { Spaceship } from './Spaceship.js';
// Projectile imports will be moved to specific enemy classes or kept if needed for a generic enemy projectile
// import { Projectile } from './Projectile.js';
// import { LaserProjectile } from './LaserProjectile.js';
// import { HomingProjectile } from './HomingProjectile.js';

export class Enemy extends Spaceship {
    constructor(x, y, hp, speed, animationFrames, scale, assets, game) {
        super(x, y, hp, speed, animationFrames, scale, 'up', assets); // Enemies generally move up
        this.game = game; // Store game reference for targeting player, etc.
        this.scoreValue = 0; // Default score value, overridden by subclasses

        // --- IA ---
        this.aiState = 'entering'; // Common AI state
        this.shotCooldown = 0; // Initial cooldown, will be set by subclasses
        this.age = 0;
        this.attackY = Math.random() * (game.canvas.height * 0.3) + 50; // Common attack Y
        this.targetPoint = { x: Math.random() * game.canvas.width, y: this.attackY }; // Common target point
    }

    // Generic shoot method, to be overridden by specific enemy types
    shoot() {
        return null;
    }

    update(game, deltaTime) {
        super.update(game, deltaTime); // Call Spaceship's update for animation, shield, etc.

        if (this.state !== 'alive') return;

        this.isMoving = true;
        this.age += deltaTime;

        // Update shot cooldown
        if (this.shotCooldown > 0) {
            this.shotCooldown -= deltaTime;
        }

        // --- Rotation Logic (common for enemies that face the player) ---
        const player = game.player;
        if (player.state === 'alive') {
            const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
            // Adjust angle to make the spaceship point towards the player (assuming default sprite points up)
            this.angle = angleToPlayer + Math.PI / 2;
        }

        // Out of bounds check (common for all enemies)
        if (this.y > game.canvas.height || this.y < -this.height * 2) {
            this.state = 'dead';
        }
    }
}
