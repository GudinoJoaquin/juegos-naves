import { Enemy } from './Enemy.js';
import { TankAttack } from './TankAttack.js';
import { LaserAttack } from './LaserAttack.js';
import { AssaultAttack } from './AssaultAttack.js';

export class BossEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 500;
        const speed = 1;
        const animationFrames = assets['enemyBoss'];
        const scale = 3.0;
        super(x, y, hp, speed, animationFrames, scale, assets, game);
        this.scoreValue = 1000;

        this.tankAttack = new TankAttack(this);
        this.laserAttack = new LaserAttack(this);
        this.assaultAttack = new AssaultAttack(this);

        this.attackCooldown = 3000; // Cooldown for switching attacks
        this.attackTimer = 0;
        this.currentAttack = 'assault'; // Initial attack type
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive') return;

        // Update all attack types
        this.tankAttack.update(game, deltaTime);
        this.laserAttack.update(game, deltaTime);

        // Slow, deliberate movement
        const player = game.player;
        if (player.state === 'alive') {
            const targetX = player.x;
            const targetY = 100; // Stays at a certain height
            const dx = (targetX - this.x) * 0.01 * this.speed;
            const dy = (targetY - this.y) * 0.01 * this.speed;
            this.move(dx, dy);
        }

        this.attackTimer += deltaTime;
        if (this.attackTimer > this.attackCooldown) {
            this.attackTimer = 0;
            // Cycle through attack types
            const attackTypes = ['assault', 'tank', 'laser'];
            const currentIndex = attackTypes.indexOf(this.currentAttack);
            this.currentAttack = attackTypes[(currentIndex + 1) % attackTypes.length];
        }

        // Execute the current attack
        let projectiles = [];
        switch (this.currentAttack) {
            case 'assault':
                const assaultProjectile = this.assaultAttack.shoot(game);
                if (assaultProjectile) projectiles.push(assaultProjectile);
                break;
            case 'tank':
                this.tankAttack.shoot(game, game.player, deltaTime);
                break;
            case 'laser':
                // Laser attack is handled by its own update/draw cycle
                break;
        }

        projectiles.forEach(p => game.addProjectile(p));
    }

    draw(ctx) {
        super.draw(ctx);
        this.tankAttack.draw(ctx);
        this.laserAttack.draw(ctx);
    }
}