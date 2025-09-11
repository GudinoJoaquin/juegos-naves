export default class Barrier {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.blockSize = 10;
    this.width = 4; // bloques por fila
    this.height = 3; // bloques por columna

    // Crear matriz de bloques vivos
    this.blocks = [];
    for (let row = 0; row < this.height; row++) {
      this.blocks[row] = [];
      for (let col = 0; col < this.width; col++) {
        this.blocks[row][col] = true; // true = bloque intacto
      }
    }
  }

  draw(ctx) {
    ctx.fillStyle = "green";
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.blocks[row][col]) {
          ctx.fillRect(
            this.x + col * this.blockSize,
            this.y + row * this.blockSize,
            this.blockSize,
            this.blockSize
          );
        }
      }
    }
  }

  // Colisión con una bala
  hit(bullet) {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.blocks[row][col]) {
          const bx = this.x + col * this.blockSize;
          const by = this.y + row * this.blockSize;
          const bw = this.blockSize;
          const bh = this.blockSize;

          if (
            bullet.x < bx + bw &&
            bullet.x + bullet.width > bx &&
            bullet.y < by + bh &&
            bullet.y + bullet.height > by
          ) {
            this.blocks[row][col] = false;
            bullet.active = false;
            return true;
          }
        }
      }
    }
    return false;
  }
}
