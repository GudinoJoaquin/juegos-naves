// Enemy.js
//Crea la clase enemigo con sus respectivas propiedades
export default class Enemy {
  constructor(x, y, image) {
    this.width = 35;
    this.height = 35;
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = image;
  }

//"dibuja" al enemigo, es decir, lo renderiza
  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}
