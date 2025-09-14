import { Enemy } from './Enemy.js';
import { LaserAttack } from '../attacks/LaserAttack.js';

export class LaserEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 200;
        const speed = 1.5;
        const animationFrames = assets['enemyLaser'];
        const scale = 2.5;
        super(x, y, hp, speed, animationFrames, scale, assets, game);

        this.scoreValue = 250;
        this.laserAttack = new LaserAttack(this);
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        this.laserAttack.update(game, deltaTime);
    }

    draw(ctx) {
        super.draw(ctx);
        this.laserAttack.draw(ctx);
    }
}