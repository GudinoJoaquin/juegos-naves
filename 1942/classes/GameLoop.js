import { Player } from './Player.js';
import { Enemy } from './Enemy.js';

export class GameLoop {
    constructor(canvas, inputHandler, assets) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.inputHandler = inputHandler;
        this.assets = assets;

        this.player = new Player(this.canvas.width / 2 - 25, this.canvas.height - 100, 'Assault', this.assets);
        this.enemies = [];
        this.projectiles = [];
        this.stars = [];
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 2000; // ms
        
        this.isGameOver = false;
        this.initializeStars();
    }

    initializeStars() {
        const starCount = 200;
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.2,
            });
        }
    }

    start() {
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    }

    stop() {
        cancelAnimationFrame(this.animationFrameId);
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        if (!this.isGameOver) {
            this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
        } else {
            this.drawGameOver();
        }
    }

    update(deltaTime) {
        if (this.isGameOver) return;

        this.stars.forEach(star => {
            star.y += star.speed * (deltaTime / 16.67);
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });

        this.player.update(this, deltaTime);

        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer > this.enemySpawnInterval && this.player.state === 'alive') {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        this.enemies.forEach(enemy => enemy.update(this, deltaTime));

        this.projectiles.forEach(p => p.update(deltaTime, this)); // Pasar el juego a los proyectiles

        this.checkCollisions();

        this.enemies = this.enemies.filter(e => e.state !== 'dead');
        this.projectiles = this.projectiles.filter(p => !p.isDestroyed);
        
        if (this.player.state === 'dead') {
            this.isGameOver = true;
        }
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = 'white';
        this.stars.forEach(star => {
            this.context.fillRect(star.x, star.y, star.size, star.size);
        });

        this.player.draw(this.context);
        this.enemies.forEach(enemy => enemy.draw(this.context));
        this.projectiles.forEach(p => p.draw(this.context));
        
        this.context.fillStyle = 'white';
        this.context.font = '20px Arial';
        this.context.fillText(`HP: ${this.player.hp}`, 10, 30);
        this.context.fillText(`Score: ${this.player.score}`, this.canvas.width - 120, 30);
    }
    
    drawGameOver() {
        this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = 'white';
        this.context.font = '50px Arial';
        this.context.textAlign = 'center';
        this.context.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
    }

    spawnEnemy() {
        const x = Math.random() * (this.canvas.width - 50);
        const y = -100;
        const types = ['default', 'laser', 'tank', 'boost'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.enemies.push(new Enemy(x, y, type, this.assets, this)); // Pasar 'this' (el juego) al constructor
    }

    addProjectile(projectile) {
        if (projectile) {
            this.projectiles.push(projectile);
        }
    }

    checkCollisions() {
        // Proyectiles del jugador vs enemigos
        this.projectiles.forEach(p => {
            if (p.owner === 'player') {
                this.enemies.forEach(e => {
                    if (e.state === 'alive' && this.isColliding(p, e)) {
                        e.takeDamage(p.damage);
                        p.isDestroyed = true;
                        if (e.state === 'dying') {
                            this.player.score += e.scoreValue;
                        }
                    }
                });
            }
        });

        // Proyectiles enemigos vs jugador
        this.projectiles.forEach(p => {
            if (p.owner === 'enemy' && this.player.state === 'alive') {
                if (this.isColliding(p, this.player)) {
                    this.player.takeDamage(p.damage);
                    p.isDestroyed = true;
                }
            }
        });

        // Enemigos vs jugador
        this.enemies.forEach(e => {
            if (e.state === 'alive' && this.player.state === 'alive') {
                if (this.isColliding(e, this.player)) {
                    // Los kamikazes se destruyen al chocar
                    if (e.enemyType === 'default' || e.enemyType === 'tank') {
                        e.takeDamage(e.hp);
                    } 
                    this.player.takeDamage(20); // Daño por colisión
                }
            }
        });
    }

    isColliding(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
}
