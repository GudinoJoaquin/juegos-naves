// Enemy.js
export default class Enemy {
  constructor(x, y, image) {
    this.width = 35;
    this.height = 35;
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = image;
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}
