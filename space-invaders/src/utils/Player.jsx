import playerImg from "../assets/img/player.png";

//crea la clase jugador con sus respectivas carateristicas
export default class Player {
  constructor(canvasWidth, canvasHeight, name, invert = false) {
    this.width = 40;
    this.height = 30;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - this.height - 40;
    this.name = name;
    this.lives = 3;
    this.image = new Image();
    this.image.src = playerImg;
    this.invert = invert; // <- si es true, invertimos colores
  }

  //renderiza en pantalla al jugador
  draw(ctx) {
    if (this.invert) {
      ctx.save();
      ctx.filter = "invert(1)";
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
}
