import { Spaceship } from '../core/Spaceship.js';

export class Enemy extends Spaceship {
    constructor(x, y, hp, speed, animationFrames, scale, assets, game, level = 1) {
        super(x, y, hp, speed, animationFrames, scale, 'up', assets, level); // Enemies generally move up
        this.game = game; // Store game reference for targeting player, etc.
        this.scoreValue = 0; // Default score value, overridden by subclasses
        this.maxHp = hp;
        this.level = level; // Store the level

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
            this.angle = angleToPlayer - Math.PI / 2;
        }

        // Out of bounds check (common for all enemies)
        if (this.y > game.canvas.height || this.y < -this.height * 2) {
            this.state = 'dead';
        }
    }

    draw(context) {
        super.draw(context);

        if (this.state === 'alive') {
            // Health bar
            const healthBarWidth = this.width;
            const healthBarHeight = 5;
            const healthBarX = this.x;
            const healthBarY = this.y - 15;

            const healthPercentage = this.hp / this.maxHp;

            context.fillStyle = 'red';
            context.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

            context.fillStyle = 'green';
            context.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);

            // Enemy type name and level
            context.fillStyle = 'white';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.fillText(`${this.constructor.name} Lvl:${this.level}`, this.x + this.width / 2, this.y - 25);
        }
    }
}

