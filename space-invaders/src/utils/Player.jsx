export default class Player {
  constructor(canvasWidth, canvasHeight) {
    this.width = 50;
    this.height = 20;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - this.height - 10;
    this.speed = 5;
    this.color = "lime";
    this.lives = 3; // vidas
  }

  move(direction, canvasWidth) {
    this.x += direction * this.speed;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Mostrar vidas
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Vidas: " + this.lives, 10, 20);
  }
}
