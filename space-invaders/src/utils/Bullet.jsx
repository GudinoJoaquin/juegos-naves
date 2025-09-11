export default class Bullet {
  constructor(x, y, direction, color, speed) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 10;
    this.direction = direction; // -1 jugador, 1 enemigo
    this.color = color;
    this.speed = speed;
    this.active = true;
  }

  update(dt) {
    this.y += this.direction * this.speed * dt;
    if (this.y < 0 || this.y > 480) this.active = false;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
