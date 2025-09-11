export default class Enemy {
  constructor(x, y, type = "normal") {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.speed = 2;
    this.type = type;
    this.health = type === "duro" ? 3 : 1;
  }

  move() {
    this.y += this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = this.type === "duro" ? "red" : "green";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
