import ufoImg from "../assets/img/ufo.png";

//crea la clase UFO con sus propiedades
export default class Ufo {
  constructor(x, y, speed, canvasWidth) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.canvasWidth = canvasWidth;

    this.width = 60;
    this.height = 30;

    this.image = new Image();
    this.image.src = ufoImg;

    this.active = true;
  }

  update(deltaTime) {
    if (!this.active) return;
    this.x += this.speed * deltaTime;
    if (this.x > this.canvasWidth) this.active = false;
  }

  //renderiza el UFO
  draw(ctx) {
    if (!this.active) return;
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      // fallback: rectángulo violeta
      ctx.fillStyle = "violet";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  //colicion con las balas del jugador
  collidesWith(bullet) {
    return (
      this.active &&
      bullet.x < this.x + this.width &&
      bullet.x + bullet.width > this.x &&
      bullet.y < this.y + this.height &&
      bullet.y + bullet.height > this.y
    );
  }
}
