import { Enemy } from './Enemy.js';
import { TankAttack } from './TankAttack.js';

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

    // The shoot method is now handled by TankAttack
    shoot() {
        return null;
    }

    draw(ctx) {
        // dibujar la nave solo si está viva
        if (this.state === 'alive') super.draw(ctx);

        // dibujar todas las granadas aunque la nave esté muerta
        this.tankAttack.draw(ctx);
    }
}