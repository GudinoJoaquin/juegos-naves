export class Spaceship {
    constructor(x, y, hp, speed, animationFrames, scale = 1, thrusterDirection = 'down', assets = {}) {
        this.x = x;
        this.y = y;
        this.hp = hp;
        this.speed = speed;
        this.animationFrames = animationFrames;
        this.scale = scale;
        this.thrusterDirection = thrusterDirection;
        
        this.width = (animationFrames[0] ? animationFrames[0].width : 50) * this.scale;
        this.height = (animationFrames[0] ? animationFrames[0].height : 50) * this.scale;
        
        this.state = 'alive'; // alive, dying, dead
        this.isMoving = false;
        this.angle = 0;

        // Animación de la nave
        this.currentFrame = 0;
        this.frameCount = animationFrames.length;
        this.frameTimer = 0;
        this.frameInterval = 100; // ms

        // Animación de destrucción
        this.destructionFrames = assets.destruction || [];
        this.destructionFrame = 0;
        this.destructionFrameCount = this.destructionFrames.length;
        this.destructionFrameInterval = 75; // ms
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    shoot() {
        return null;
    }

    takeDamage(damage) {
        if (this.state !== 'alive') return;
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.state = 'dying';
            this.frameTimer = 0; // Reiniciar timer para la animación de muerte
        }
    }

    update(game, deltaTime) {
        if (this.state === 'alive') {
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;
                this.frameTimer = 0;
            }
        } else if (this.state === 'dying') {
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.destructionFrameInterval) {
                this.destructionFrame++;
                this.frameTimer = 0;
                if (this.destructionFrame >= this.destructionFrameCount) {
                    this.state = 'dead';
                }
            }
        }
    }

    drawThruster(context) {
        const thrusterHeight = Math.random() * 20 + 15;
        const thrusterWidth = this.width / 2;
        
        // Coordenadas relativas al centro de la nave (que ahora es el origen 0,0)
        const thrusterX = -thrusterWidth / 2;
        let thrusterY, y2;

        if (this.thrusterDirection === 'down') {
            thrusterY = (this.height / 2) - 10;
            y2 = thrusterY + thrusterHeight;
        } else { // 'up'
            thrusterY = (-this.height / 2) + 10;
            y2 = thrusterY - thrusterHeight;
        }

        context.beginPath();
        context.moveTo(thrusterX, thrusterY);
        context.lineTo(thrusterX + thrusterWidth / 2, y2);
        context.lineTo(thrusterX + thrusterWidth, thrusterY);
        context.closePath();

        const gradient = context.createLinearGradient(thrusterX, thrusterY, thrusterX, y2);
        gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.3)');

        context.fillStyle = gradient;
        context.fill();
    }

    draw(context) {
        // Guardar el estado del canvas antes de transformar
        context.save();
        // Mover el origen del canvas al centro de la nave
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        // Rotar el canvas
        context.rotate(this.angle);

        const drawX = -this.width / 2;
        const drawY = -this.height / 2;

        if (this.state === 'alive') {
            if (this.isMoving) {
                this.drawThruster(context);
            }
            if (this.animationFrames[this.currentFrame]) {
                context.drawImage(
                    this.animationFrames[this.currentFrame],
                    drawX, drawY, // Dibujar relativo al nuevo origen
                    this.width, this.height
                );
            }
        } else if (this.state === 'dying') {
            const frame = this.destructionFrames[this.destructionFrame];
            if (frame) {
                context.drawImage(
                    frame,
                    drawX, drawY, // Dibujar relativo al nuevo origen
                    this.width, this.height
                );
            }
        }
        
        // Restaurar el estado del canvas para no afectar a otros dibujos
        context.restore();
    }
}