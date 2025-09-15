import { Enemy } from './Enemy.js';

export class BossEnemy extends Enemy {
    constructor(x, y, assets, game, options = {}) {
        const {
            hp = 1200,
            speed = 1.2,
            scale = 4.0,
            scoreValue = 5000,
            minHorizontalSpeed = 1,
            maxHorizontalSpeed = 3,
            verticalSpeed = 0.5,
            targetY = 50,
            attackCooldown = 2500,
            orbCount = 20,
            orbSpeed = 3,
            orbDamage = 20,
            orbChargeTime = 1500,
            blackholeDamage = 40,
            blackholeChargeTime = 1500,
            blackholeMaxRadius = 50,
            gunDuration = 3000,
            gunChargeTime = 1500,
            shieldDuration = 4000,
            shieldCooldown = 5000,
            damageThreshold = 100,
            initialShieldHealth = 100,
            level = 1
        } = options;

        const animationFrames = assets['enemyBoss'];
        super(x, y, hp, speed, animationFrames, scale, assets, game, level);
        this.scoreValue = scoreValue;
        this.level = level;

        // Movimiento
        this.movementPhase = 'entering';
        this.minHorizontalSpeed = minHorizontalSpeed;
        this.maxHorizontalSpeed = maxHorizontalSpeed;
        this.horizontalDirection = Math.random() < 0.5 ? -1 : 1;
        this.horizontalSpeed = Math.random() * (this.maxHorizontalSpeed - this.minHorizontalSpeed) + this.minHorizontalSpeed;
        this.verticalSpeed = verticalSpeed;
        this.targetY = targetY;

        // Ataques
        this.attackTimer = 0;
        this.attackCooldown = attackCooldown;
        this.attackCount = 3;
        this.currentAttack = null;

        // Orbes
        this.orbCount = orbCount;
        this.orbSpeed = orbSpeed;
        this.orbDamage = orbDamage;
        this.orbProjectiles = [];
        this.orbChargeTime = orbChargeTime;
        this.orbChargeTimer = 0;

        // Agujero negro
        this.blackholeDamage = blackholeDamage;
        this.blackholeProjectiles = [];
        this.blackholeChargeTime = blackholeChargeTime;
        this.blackholeChargeTimer = 0;
        this.blackholeMaxRadius = blackholeMaxRadius;

        // Metralleta
        this.gunDuration = gunDuration;
        this.gunTimer = 0;
        this.gunFiring = false;
        this.gunProjectiles = [];
        this.gunChargeTime = gunChargeTime;
        this.gunChargeTimer = 0;

        // Escudo
        this.isShieldActive = false;
        this.shieldDuration = shieldDuration;
        this.shieldCooldown = shieldCooldown;
        this.shieldTimer = 0;
        this.recentDamage = 0;
        this.damageThreshold = damageThreshold;
        this.lastShieldTime = 0;
        this.shieldHealth = initialShieldHealth;
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive') return;

        const isBlackHoleGrowing = this.blackholeProjectiles.some(p => p.radius < p.maxRadius);
        const isCharging = this.currentAttack !== null || isBlackHoleGrowing;

        // --- Movimiento ---
        if (!isCharging) {
            if (this.movementPhase === 'entering') {
                this.y += this.verticalSpeed;
                if (this.y >= this.targetY) {
                    this.y = this.targetY;
                    this.movementPhase = 'attacking';
                }
            } else if (this.movementPhase === 'attacking') {
                this.x += this.horizontalDirection * this.horizontalSpeed;
                if (Math.random() < 0.02) {
                    this.horizontalDirection *= -1;
                    this.horizontalSpeed = Math.random() * (this.maxHorizontalSpeed - this.minHorizontalSpeed) + this.minHorizontalSpeed;
                }
                if (this.x < 0) this.x = 0, this.horizontalDirection = 1;
                else if (this.x + this.width > game.canvas.width) this.x = game.canvas.width - this.width, this.horizontalDirection = -1;
            }
        }

        // --- Escudo ---
        if (this.isShieldActive) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.isShieldActive = false;
                this.lastShieldTime = Date.now();
                this.shieldHealth = 100;
            }
        }

        // --- Ataques ---
        if (this.movementPhase === 'attacking' && !isCharging) {
            this.attackTimer += deltaTime;
            if (this.attackTimer >= this.attackCooldown) {
                this.attackTimer = 0;
                const choice = Math.floor(Math.random() * this.attackCount);
                this.startAttack(choice);
            }
        }

        // --- Actualizar carga de ataques ---
        if (this.currentAttack === 'orb') {
            this.orbChargeTimer += deltaTime;
            if (this.orbChargeTimer >= this.orbChargeTime) {
                this.fireOrbChain(game);
                this.currentAttack = null;
            }
        }

        if (this.currentAttack === 'blackhole') {
            this.blackholeChargeTimer += deltaTime;
            if (this.blackholeChargeTimer >= this.blackholeChargeTime) {
                this.fireBlackhole(game);
                this.currentAttack = null;
            }
        }

        if (this.currentAttack === 'gun') {
            this.gunChargeTimer += deltaTime;
            if (this.gunChargeTimer >= this.gunChargeTime) {
                this.startGun();
                this.currentAttack = null;
            }
        }

        // --- Actualizar proyectiles ---
        this.orbProjectiles.forEach(p => p.update(game, deltaTime));
        this.orbProjectiles = this.orbProjectiles.filter(p => p.state === 'alive');

        this.blackholeProjectiles.forEach(p => p.update(game, deltaTime));
        this.blackholeProjectiles = this.blackholeProjectiles.filter(p => p.state === 'alive');

        this.gunProjectiles.forEach(p => p.update(game, deltaTime));
        this.gunProjectiles = this.gunProjectiles.filter(p => p.state === 'alive');

        // --- Metralleta ---
        if (this.gunFiring) {
            this.gunTimer -= deltaTime;
            if (this.gunTimer > 0 && Math.random() < 0.3) this.fireGunBullet(game);
            else if (this.gunTimer <= 0) this.gunFiring = false;
        }
    }

    takeDamage(damage) {
        if (this.state !== 'alive') return;

        if (this.isShieldActive) {
            this.shieldHealth -= damage;
            if (this.shieldHealth <= 0) {
                this.isShieldActive = false;
                this.lastShieldTime = Date.now();
                this.shieldHealth = 100;
            }
            return;
        }

        this.hp -= damage;
        this.isShielded = true;
        this.shieldTimer = this.shieldDuration;
        this.recentDamage += damage;

        if (this.recentDamage >= this.damageThreshold && Date.now() - this.lastShieldTime >= this.shieldCooldown) {
            this.activateShield();
            this.recentDamage = 0;
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.state = 'dying';
        }
    }

    activateShield() {
        this.isShieldActive = true;
        this.shieldTimer = this.shieldDuration;
        this.shieldHealth = 100;
    }

    startAttack(choice) {
        this.currentAttack = null;
        switch (choice) {
            case 0:
                this.currentAttack = 'orb';
                this.orbChargeTimer = 0;
                break;
            case 1:
                this.currentAttack = 'blackhole';
                this.blackholeChargeTimer = 0;
                break;
            case 2:
                this.currentAttack = 'gun';
                this.gunChargeTimer = 0;
                break;
        }
    }

    // --- Ataques ---
    fireOrbChain(game) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        for (let i = 0; i < this.orbCount; i++) {
            const angle = (i / this.orbCount) * Math.PI * 2;
            const dirX = Math.cos(angle);
            const dirY = Math.sin(angle);
            const speed = this.orbSpeed + Math.random() * 2;

            this.orbProjectiles.push({
                x: centerX,
                y: centerY,
                radius: 10,
                damage: this.orbDamage,
                dirX,
                dirY,
                speed,
                state: 'alive',
                update(game, dt) {
                    this.x += this.dirX * this.speed;
                    this.y += this.dirY * this.speed;

                    const player = game.player;
                    if (player && player.state === 'alive') {
                        const distX = this.x - player.x;
                        const distY = this.y - player.y;
                        if (Math.hypot(distX, distY) < player.width / 2 + this.radius) {
                            player.takeDamage(this.damage);
                            this.state = 'dead';
                        }
                    }

                    if (this.x < 0 || this.x > game.canvas.width || this.y < 0 || this.y > game.canvas.height) {
                        this.state = 'dead';
                    }
                },
                draw(ctx) {
                    ctx.save();
                    ctx.fillStyle = 'red'; // Changed to red
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });
        }
    }

    fireBlackhole(game) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    // Creamos un proyectil que "crece" y luego dispara hacia la posición del jugador
    this.blackholeProjectiles.push({
        x: centerX,
        y: centerY,
        radius: 0,
        maxRadius: this.blackholeMaxRadius,
        damage: this.blackholeDamage,
        speed: 10,
        state: 'alive',
        targetCalculated: false, // indicador para calcular ángulo al disparar
        angle: 0,
        update(game, dt) {
            if (this.radius < this.maxRadius) {
                // fase de carga
                this.radius += dt / 50;
            } else {
                // calcular ángulo al momento de disparar
                if (!this.targetCalculated) {
                    const player = game.player;
                    const targetX = player ? player.x + player.width / 2 : this.x;
                    const targetY = player ? player.y + player.height / 2 : this.y;
                    this.angle = Math.atan2(targetY - this.y, targetX - this.x);
                    this.targetCalculated = true;
                }

                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;

                const player = game.player;
                if (player && player.state === 'alive') {
                    const dist = Math.hypot(this.x - (player.x + player.width / 2), this.y - (player.y + player.height / 2));
                    if (dist < this.radius + player.width / 2) {
                        player.takeDamage(this.damage);
                        this.state = 'dead';
                    }
                }
            }

            if (this.x < 0 || this.x > game.canvas.width || this.y < 0 || this.y > game.canvas.height) {
                this.state = 'dead';
            }
        },
        draw(ctx) {
            ctx.save();
            ctx.fillStyle = 'red'; // Changed to red
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'darkred'; // Changed to darkred
            ctx.stroke();
            ctx.restore();
        }
    });
}


    startGun() {
        this.gunFiring = true;
        this.gunTimer = this.gunDuration;
    }

    fireGunBullet(game) {
        const leftX = this.x + this.width * 0.3;
        const rightX = this.x + this.width * 0.7;
        const y = this.y + this.height;
        const player = game.player;
        if (!player) return;

        [leftX, rightX].forEach(cannonX => {
            const angle = Math.atan2(player.y - y, player.x - cannonX);
            const speed = 6;

            this.gunProjectiles.push({
                x: cannonX,
                y,
                radius: 8, // Changed from width/height to radius
                damage: 8,
                angle,
                speed,
                state: 'alive',
                update(game, dt) {
                    this.x += Math.cos(this.angle) * this.speed;
                    this.y += Math.sin(this.angle) * this.speed;

                    const player = game.player;
                    if (player && player.state === 'alive') { // Changed collision detection to circle-based
                        const distX = this.x - (player.x + player.width / 2);
                        const distY = this.y - (player.y + player.height / 2);
                        if (Math.hypot(distX, distY) < player.width / 2 + this.radius) {
                            player.takeDamage(this.damage);
                            this.state = 'dead';
                        }
                    }
                },
                draw(ctx) {
                    ctx.save();
                    ctx.fillStyle = 'red';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // Changed to draw a circle
                    ctx.fill();
                    ctx.restore();
                }
            });
        });
    }

    draw(ctx) {
        this.orbProjectiles.forEach(p => p.draw(ctx)); // Moved before super.draw
        this.blackholeProjectiles.forEach(p => p.draw(ctx)); // Moved before super.draw
        this.gunProjectiles.forEach(p => p.draw(ctx)); // Moved before super.draw

        // Filtros de carga
        ctx.save();
        if (this.currentAttack === 'orb') ctx.filter = 'brightness(1.5) saturate(1.5)';
        if (this.currentAttack === 'gun') ctx.filter = 'hue-rotate(250deg) saturate(2)';
        if (this.currentAttack === 'blackhole') ctx.filter = 'contrast(2)';
        super.draw(ctx);
        ctx.restore();

        // Escudo
        if (this.isShieldActive) {
            ctx.save();
            const green = Math.floor((this.shieldHealth / 100) * 255);
            ctx.strokeStyle = `rgba(0,${green},255,0.7)`;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
}