export class Projectile {
    constructor(x, y, vx, vy, damage, owner, animationFrames = [], color = '#f00') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.owner = owner;
        this.animationFrames = animationFrames;
        this.color = color;

        const scale = 2.0;
        this.width = (animationFrames && animationFrames.length > 0 ? animationFrames[0].width : 5) * scale;
        this.height = (animationFrames && animationFrames.length > 0 ? animationFrames[0].height : 15) * scale;
        this.isDestroyed = false;
        this.angle = Math.atan2(vy, vx) + Math.PI / 2; // Apuntar en la dirección del movimiento

        // Animación
        this.currentFrame = 0;
        this.frameCount = this.animationFrames.length;
        this.frameTimer = 0;
        this.frameInterval = 100; // ms
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -this.height || this.y > 800 || this.x < -this.width || this.x > 1200) { // Tamaños de canvas asumidos
            this.isDestroyed = true;
        }

        if (this.frameCount > 1) {
            this.frameTimer += deltaTime;
            if (this.frameTimer > this.frameInterval) {
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;
                this.frameTimer = 0;
            }
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.angle);
        
        const drawX = -this.width / 2;
        const drawY = -this.height / 2;

        if (this.animationFrames && this.animationFrames.length > 0) {
            context.drawImage(
                this.animationFrames[this.currentFrame],
                drawX, drawY, 
                this.width, this.height
            );
        } else {
            context.fillStyle = this.color;
            context.shadowColor = this.color;
            context.shadowBlur = 5;
            context.fillRect(drawX, drawY, this.width, this.height);
            context.shadowBlur = 0;
        }
        context.restore();
    }
}

