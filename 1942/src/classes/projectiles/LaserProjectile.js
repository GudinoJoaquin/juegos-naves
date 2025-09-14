import { Projectile } from './Projectile.js';

export class LaserProjectile extends Projectile {
    constructor(x, y, vx, vy, damage, owner) {
        super(x, y, vx, vy, damage, owner, [], '#00ffff'); // Cyan color
        this.width = 10;
        this.height = 30;
    }
}
