export class RayoLaserJugador {
    constructor(x, y, dano, owner, assets, width, height) {
        this.x = x;
        this.y = y;
        this.dano = dano;
        this.owner = owner;
        this.assets = assets;
        this.isDestroyed = false;

        this.anchoLaser = width;
        this.altoLaser = height;

        this.laserActivo = false; // Controlled by Player
        this.anguloLaser = -Math.PI / 2; // Oriented upwards

        // Properties for continuous damage
        this.danoPorSegundo = dano; // Base damage per second
        this.enemigosImpactados = new Map(); // Map<enemy, {lastDamageTime: number, totalTimeHit: number}>
        this.intervaloDano = 100; // Apply damage every 100ms
    }

    update(deltaTime, game) {
        if (this.laserActivo) {
            this.aplicarDanoContinuo(game, deltaTime);
        }
    }

    // These methods are now controlled by Player.js
    activate() {
        this.laserActivo = true;
        this.enemigosImpactados.clear(); // Clear impacted enemies when activated
    }

    deactivate() {
        this.laserActivo = false;
        this.isDestroyed = true; // Mark for removal
        this.enemigosImpactados.clear(); // Clear impacted enemies when deactivated
    }

    aplicarDanoContinuo(game, deltaTime) {
        if (!this.laserActivo) return;

        const laserRect = {
            x: this.x - this.anchoLaser / 2,
            y: 0, // From the top of the screen
            width: this.anchoLaser,
            height: this.y // Up to the player's Y position
        };

        const enemigosActualesImpactados = new Set();

        game.enemies.forEach(enemy => {
            if (enemy.state === 'alive') {
                if (laserRect.x < enemy.x + enemy.width &&
                    laserRect.x + laserRect.width > enemy.x &&
                    laserRect.y < enemy.y + enemy.height &&
                    laserRect.y + laserRect.height > enemy.y) {

                    enemigosActualesImpactados.add(enemy);

                    if (!this.enemigosImpactados.has(enemy)) {
                        // New impact, register time and apply initial damage
                        this.enemigosImpactados.set(enemy, { lastDamageTime: Date.now(), totalTimeHit: 0 });
                        enemy.takeDamage(this.dano); // Initial damage on first contact
                    } else {
                        // Already impacted, apply continuous damage
                        const data = this.enemigosImpactados.get(enemy);
                        const now = Date.now();
                        const elapsedTime = now - data.lastDamageTime;

                        if (elapsedTime >= this.intervaloDano) {
                            const damageToApply = (this.danoPorSegundo / 1000) * elapsedTime; // Damage per ms
                            enemy.takeDamage(damageToApply);
                            data.lastDamageTime = now;
                        }
                        data.totalTimeHit += deltaTime;
                    }
                }
            }
        });

        // Remove enemies that are no longer being impacted
        for (let [enemy, data] of this.enemigosImpactados.entries()) {
            if (!enemigosActualesImpactados.has(enemy)) {
                this.enemigosImpactados.delete(enemy);
            }
        }
    }

    draw(ctx) {
        if (this.laserActivo) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.anguloLaser);

            const gradient = ctx.createLinearGradient(0, 0, 0, -this.altoLaser);
            gradient.addColorStop(0, 'rgba(0, 255, 255, 1)');
            gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.7)');
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(-this.anchoLaser / 2, -this.altoLaser, this.anchoLaser, this.altoLaser);
            ctx.restore();
        }
    }
}