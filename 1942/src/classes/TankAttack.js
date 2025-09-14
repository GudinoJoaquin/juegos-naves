import { Grenade } from './Grenade.js';

export class TankAttack {
    constructor(enemy) {
        this.enemy = enemy;
        // Initialize attack-specific properties
        this.shotCooldown = 2000;
        this.burstShots = 4; // Changed to 4
        this.burstCooldown = 200;
        this.grenades = []; // Each attack instance manages its own projectiles
    }

    update(game, deltaTime) {
        // Update grenades here
        this.grenades.forEach(g => g.update(game, deltaTime));
        this.grenades = this.grenades.filter(g => !g.exploded || g.explosionTimer > 0);
    }

    shoot(game, player, deltaTime) {
        if (this.shotCooldown > 0) {
            this.shotCooldown -= deltaTime;
            return;
        }

        if (this.burstShots > 0 && this.burstCooldown <= 0) {
            this.burstShots--;
            this.burstCooldown = 200;

            const originX = this.enemy.x + this.enemy.width / 2;
            const originY = this.enemy.y + this.enemy.height / 2;

            // Pass player's current position as target
            const targetPlayerX = player.x + player.width / 2;
            const targetPlayerY = player.y + player.height / 2;

            // disparar 4 granadas hacia el jugador (2 y 2)
            const spreadDistance = 50; // Distance to spread the grenades
            const baseAngle = Math.atan2(targetPlayerY - originY, targetPlayerX - originX); // Angle to player

            // First pair (straight towards player)
            this.grenades.push(new Grenade(originX, originY, targetPlayerX, targetPlayerY, 3, 30, 50));
            this.grenades.push(new Grenade(originX, originY, targetPlayerX, targetPlayerY, 3, 30, 50));

            // Second pair (offset from player's position)
            const offsetAngle1 = baseAngle + Math.PI / 8; // +22.5 degrees
            const offsetAngle2 = baseAngle - Math.PI / 8; // -22.5 degrees

            this.grenades.push(new Grenade(originX, originY, targetPlayerX + Math.cos(offsetAngle1) * spreadDistance, targetPlayerY + Math.sin(offsetAngle1) * spreadDistance, 3, 30, 50));
            this.grenades.push(new Grenade(originX, originY, targetPlayerX + Math.cos(offsetAngle2) * spreadDistance, targetPlayerY + Math.sin(offsetAngle2) * spreadDistance, 3, 30, 50));


        } else if (this.burstShots <= 0) {
            this.shotCooldown = 3000 + Math.random() * 2000;
            this.burstShots = 4; // Reset to 4
        }

        if (this.burstCooldown > 0) this.burstCooldown -= deltaTime;
    }

    draw(ctx) {
        this.grenades.forEach(g => g.draw(ctx));
    }
}
