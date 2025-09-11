export default class Player {
  constructor(x, y, frames, frameWidth, frameHeight, totalFrames, stats, keys) {
    this.x = x;
    this.y = y;
    this.frames = frames;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.totalFrames = totalFrames;
    this.currentFrame = 0;
    this.frameCounter = 0;

    this.keys = keys;
    this.activeKeys = {};
    window.addEventListener("keydown", (e) => this.activeKeys[e.code] = true);
    window.addEventListener("keyup", (e) => this.activeKeys[e.code] = false);

    // Stats
    this.hp = stats.hp;
    this.damage = stats.damage;
    this.speed = stats.speed;
    this.bulletSpeed = stats.bulletSpeed;
    this.scale = stats.scale;

    // Disparos y partículas
    this.bullets = [];
    this.shootCooldown = 0;

    // Cargar imágenes
    this.loadedFrames = [];
    frames.forEach(src => {
      const img = new Image();
      img.src = src;
      this.loadedFrames.push(img);
    });

    // Animación de tilt
    this.tilt = 0;
  }

  move(canvas) {
    if (this.activeKeys[this.keys.left]) this.x -= this.speed;
    if (this.activeKeys[this.keys.right]) this.x += this.speed;
    if (this.activeKeys[this.keys.up]) this.y -= this.speed;
    if (this.activeKeys[this.keys.down]) this.y += this.speed;

    // Limites
    this.x = Math.max(0, Math.min(canvas.width - this.frameWidth * this.scale, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.frameHeight * this.scale, this.y));

    // Tilt visual
    if (this.activeKeys[this.keys.left]) this.tilt = -0.1;
    else if (this.activeKeys[this.keys.right]) this.tilt = 0.1;
    else this.tilt = 0;
  }

  shoot() {
    if (this.shootCooldown > 0) return;
    this.shootCooldown = 15;
    // Implementado en Assault
  }

  update(canvas) {
    this.move(canvas);
    if (this.shootCooldown > 0) this.shootCooldown--;

    this.frameCounter++;
    if (this.frameCounter % 10 === 0) this.currentFrame = (this.currentFrame + 1) % this.totalFrames;

    // Actualizar balas
    this.bullets.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;

      // Actualizar partículas
      b.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
      });
      b.particles = b.particles.filter(p => p.life > 0);
    });

    // Filtrar balas fuera del canvas
    this.bullets = this.bullets.filter(b => b.y > -20 && b.y < canvas.height + 20 && b.x > -20 && b.x < canvas.width + 20);
  }

  draw(ctx) {
    const img = this.loadedFrames[this.currentFrame];
    if (!img) return;

    // Dibujar nave
    ctx.save();
    ctx.translate(this.x + this.frameWidth * this.scale / 2, this.y + this.frameHeight * this.scale / 2);
    ctx.rotate(this.tilt);
    ctx.drawImage(
      img,
      -this.frameWidth * this.scale / 2,
      -this.frameHeight * this.scale / 2,
      this.frameWidth * this.scale,
      this.frameHeight * this.scale
    );
    ctx.restore();

    // Dibujar balas
    this.bullets.forEach(b => {
      // Bala principal
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();

      // Partículas
      b.particles.forEach(p => {
        ctx.fillStyle = `rgba(0, 200, 255, ${p.life / p.maxLife})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
    });
  }
}
