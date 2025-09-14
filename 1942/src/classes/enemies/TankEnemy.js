import { Enemy } from './Enemy.js';
import { TankAttack } from '../attacks/TankAttack.js';

export class TankEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 300;
        const speed = 1.2;
        const animationFrames = assets['enemyTank'];
        const scale = 2.5;
        super(x, y, hp, speed, animationFrames, scale, assets, game);

        this.scoreValue = 300;

        this.minDistance = 80; 
        this.tankAttack = new TankAttack(this); // Instantiate the attack class
        this.explosionRadius = 150; // Pixels
        this.explosionDamage = 50; // HP
        this.hasExploded = false;
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);

        // Update the attack logic
        this.tankAttack.update(game, deltaTime);

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
                this.tankAttack.shoot(game, player, deltaTime);
            }
        }
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

    // The shoot method is now handled by TankAttack
    shoot() {
        return null;
    }

    draw(ctx) {
        super.draw(ctx);

        // dibujar todas las granadas aunque la nave esté muerta
        this.tankAttack.draw(ctx);
    }
}