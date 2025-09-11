export default class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.type = type; // 'doble', 'abanico', 'velocidad'
    this.speed = 2;
  }

  move() {
    this.y += this.speed;
  }

  draw(ctx) {
    ctx.fillStyle =
      this.type === "doble"
        ? "orange"
        : this.type === "abanico"
        ? "purple"
        : "pink";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
