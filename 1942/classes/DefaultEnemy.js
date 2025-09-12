import { Enemy } from './Enemy.js';

export class DefaultEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 20;
        const speed = 4;
        const animationFrames = assets['enemyDefault'];
        const scale = 2.0;
        super(x, y, hp, speed, animationFrames, scale, assets, game);
        this.scoreValue = 10;
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive') return;

        // Kamikaze movement: move directly towards the player
        const player = game.player;
        if (player.state === 'alive') {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            const dx = Math.cos(angle) * this.speed;
            const dy = Math.sin(angle) * this.speed;
            this.move(dx, dy);
        }
    }

    // DefaultEnemy does not shoot
    shoot() {
        return null;
    }
}
