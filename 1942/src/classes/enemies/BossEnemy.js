import { Enemy } from './Enemy.js';

export class BossEnemy extends Enemy {
    constructor(x, y, assets, game) {
        const hp = 1200;
        const speed = 1.2;
        const animationFrames = assets['enemyBoss'];
        const scale = 4.0;
        super(x, y, hp, speed, animationFrames, scale, assets, game);
        this.scoreValue = 5000;

        // Movimiento
        this.movementPhase = 'entering'; // entering, attacking
        this.minHorizontalSpeed = 1;
        this.maxHorizontalSpeed = 3;
        this.horizontalDirection = Math.random() < 0.5 ? -1 : 1;
        this.horizontalSpeed = Math.random() * (this.maxHorizontalSpeed - this.minHorizontalSpeed) + this.minHorizontalSpeed;
        this.verticalSpeed = 0.5;
        this.targetY = 50; // Y position to stop at when entering

        // Ataques
        this.attackTimer = 0;
        this.attackCooldown = 2500;
        this.attackCount = 3;

        // Orbes triangulares
        this.orbCount = 16;
        this.orbSpeed = 3;
        this.orbDamage = 20;
        this.orbProjectiles = [];

        // Agujero negro
        this.blackholeDamage = 40;
        this.blackholeProjectiles = [];

        // Metralleta
        this.gunDuration = 3000;
        this.gunTimer = 0;
        this.gunFiring = false;
        this.gunProjectiles = [];

        // Escudo
        this.isShieldActive = false;
        this.shieldDuration = 3000;
        this.shieldTimer = 0;
        this.recentDamage = 0;
        this.damageThreshold = 80;
    }

    update(game, deltaTime) {
        super.update(game, deltaTime);
        if (this.state !== 'alive') return;

        // --- Movimiento ---
        if (this.movementPhase === 'entering') {
            this.y += this.verticalSpeed;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.movementPhase = 'attacking';
            }
        } else if (this.movementPhase === 'attacking') {
            // Movimiento horizontal errático
            this.x += this.horizontalDirection * this.horizontalSpeed;

            // Cambiar de dirección y velocidad aleatoriamente
            if (Math.random() < 0.02) {
                this.horizontalDirection *= -1;
                this.horizontalSpeed = Math.random() * (this.maxHorizontalSpeed - this.minHorizontalSpeed) + this.minHorizontalSpeed;
            }

            // Mantenerse dentro de los límites de la pantalla
            if (this.x < 0) {
                this.x = 0;
                this.horizontalDirection = 1;
            } else if (this.x + this.width > game.canvas.width) {
                this.x = game.canvas.width - this.width;
                this.horizontalDirection = -1;
            }
        }

        // --- Escudo ---
        if (this.isShieldActive) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) this.isShieldActive = false;
        }

        // --- Ataques ---
        if (this.movementPhase === 'attacking') {
            this.attackTimer += deltaTime;
            if (this.attackTimer >= this.attackCooldown && !this.isShieldActive) {
                this.attackTimer = 0;
                const choice = Math.floor(Math.random() * this.attackCount);
                switch (choice) {
                    case 0: this.fireOrbChain(game); break;
                    case 1: this.fireBlackhole(game); break;
                    case 2: this.startGun(game); break;
                }
            }
        }

        if (this.gunFiring) {
            this.gunTimer -= deltaTime;
            if (this.gunTimer > 0 && Math.random() < 0.3) {
                this.fireGunBullet(game);
            } else if (this.gunTimer <= 0) {
                this.gunFiring = false;
            }
        }

        // Actualizar proyectiles
        this.orbProjectiles.forEach(p => p.update(game, deltaTime));
        this.orbProjectiles = this.orbProjectiles.filter(p => p.state === 'alive');

        this.blackholeProjectiles.forEach(p => p.update(game, deltaTime));
        this.blackholeProjectiles = this.blackholeProjectiles.filter(p => p.state === 'alive');

        this.gunProjectiles.forEach(p => p.update(game, deltaTime));
        this.gunProjectiles = this.gunProjectiles.filter(p => p.state === 'alive');
    }

    takeDamage(damage) {
        if (this.state !== 'alive' || this.isShieldActive) return;

        this.hp -= damage;
        this.recentDamage += damage;

        if (this.recentDamage >= this.damageThreshold) {
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
    }

    // --- Ataques ---
    fireOrbChain(game) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const radius = 40;

    for (let i = 0; i < this.orbCount; i++) {
        const angle = (i / this.orbCount) * Math.PI * 2;
        const startX = centerX + radius * Math.cos(angle);
        const startY = centerY + radius * Math.sin(angle);

        // Movimiento aleatorio inicial
        const moveAngle = Math.random() * Math.PI * 2;
        const moveSpeed = this.orbSpeed;

        this.orbProjectiles.push({
            x: startX,
            y: startY,
            size: 18,
            damage: this.orbDamage,
            dirX: Math.cos(moveAngle),
            dirY: Math.sin(moveAngle),
            speed: moveSpeed,
            rotation: 0,          // ángulo de rotación del triángulo
            rotationSpeed: Math.random() * 0.4 + 0.3, // velocidad de giro aleatoria
            state: 'alive',
            update: function(game, dt) {
                // Movimiento
                this.x += this.dirX * this.speed;
                this.y += this.dirY * this.speed;

                // Giro del triángulo
                this.rotation += this.rotationSpeed;

                const player = game.player;
                if (player && player.state === 'alive' &&
                    this.x < player.x + player.width &&
                    this.x + this.size > player.x &&
                    this.y < player.y + player.height &&
                    this.y + this.size > player.y) {
                    player.takeDamage(this.damage);
                    this.state = 'dead';
                }
            },
            draw: function(ctx) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.fillStyle = 'lime';
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.lineTo(-this.size, this.size);
                ctx.lineTo(this.size, this.size);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        });
    }
}


    fireBlackhole(game) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height;

        const player = game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);

        this.blackholeProjectiles.push({
            x: centerX,
            y: centerY,
            radius: 20,
            damage: this.blackholeDamage,
            angle: angle,
            speed: 1.5,
            state: 'alive',
            update: function(game, dt) {
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;

                const player = game.player;
                if (player && player.state === 'alive') {
                    const dist = Math.hypot(this.x - player.x, this.y - player.y);
                    if (dist < this.radius + player.width / 2) {
                        player.takeDamage(this.damage);
                        this.state = 'dead';
                    }
                }
            },
            draw: function(ctx) {
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'purple';
                ctx.stroke();
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
            const dx = player.x - cannonX;
            const dy = player.y - y;
            const angle = Math.atan2(dy, dx);
            const speed = 6;

            this.gunProjectiles.push({
                x: cannonX,
                y: y,
                width: 6,
                height: 16,
                damage: 8,
                speed: speed,
                angle: angle,
                state: 'alive',
                update: function(game, dt) {
                    this.x += Math.cos(this.angle) * this.speed;
                    this.y += Math.sin(this.angle) * this.speed;
                    const player = game.player;
                    if (player && player.state === 'alive' &&
                        this.x < player.x + player.width &&
                        this.x + this.width > player.x &&
                        this.y < player.y + player.height &&
                        this.y + this.height > player.y) {
                        player.takeDamage(this.damage);
                        this.state = 'dead';
                    }
                },
                draw: function(ctx) {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            });
        });
    }

    // --- Dibujado ---
    draw(ctx) {
        super.draw(ctx);

        if (this.isShieldActive) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,255,255,0.7)';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        this.orbProjectiles.forEach(p => p.draw(ctx));
        this.blackholeProjectiles.forEach(p => p.draw(ctx));
        this.gunProjectiles.forEach(p => p.draw(ctx));
    }
}
