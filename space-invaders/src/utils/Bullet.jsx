export default class Bullet {
  constructor(x, y, direction = -1, color = 'yellow') {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 10;
    this.color = color;
    this.speed = 7;
    this.active = true;
    this.direction = direction; // -1 jugador, 1 enemigo
  }

  update() {
    this.y += this.speed * this.direction;
    if (this.y < 0 || this.y > 480) this.active = false;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
