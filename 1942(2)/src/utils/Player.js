export default class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.speed = 5;
    this.bullets = [];
    this.shootCooldown = 0;
    this.shootRate = 15; // frames entre disparos
    this.powerUp = "normal"; // normal, doble, abanico
  }

  move(keys, canvas) {
    if ((keys["ArrowUp"] || keys["w"]) && this.y > 0) this.y -= this.speed;
    if (
      (keys["ArrowDown"] || keys["s"]) &&
      this.y + this.height < canvas.height
    )
      this.y += this.speed;
    if ((keys["ArrowLeft"] || keys["a"]) && this.x > 0) this.x -= this.speed;
    if ((keys["ArrowRight"] || keys["d"]) && this.x + this.width < canvas.width)
      this.x += this.speed;
  }

  shoot() {
    if (this.shootCooldown <= 0) {
      switch (this.powerUp) {
        case "doble":
          this.bullets.push({ x: this.x + 5, y: this.y, dx: 0 });
          this.bullets.push({ x: this.x + this.width - 15, y: this.y, dx: 0 });
          break;
        case "abanico":
          this.bullets.push({ x: this.x + this.width / 2, y: this.y, dx: 0 });
          this.bullets.push({ x: this.x + this.width / 2, y: this.y, dx: -1 });
          this.bullets.push({ x: this.x + this.width / 2, y: this.y, dx: 1 });
          break;
        default:
          this.bullets.push({
            x: this.x + this.width / 2 - 5,
            y: this.y,
            dx: 0,
          });
      }
      this.shootCooldown = this.shootRate;
    }
  }

  updateBullets() {
    this.bullets.forEach((b) => {
      b.y -= 8;
      b.x += b.dx * 3;
    });
    this.bullets = this.bullets.filter((b) => b.y > 0);
    if (this.shootCooldown > 0) this.shootCooldown--;
  }

  draw(ctx) {
    ctx.fillStyle = "cyan";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    this.bullets.forEach((b) => {
      ctx.fillStyle = "yellow";
      ctx.fillRect(b.x, b.y, 5, 10);
    });
  }
}
