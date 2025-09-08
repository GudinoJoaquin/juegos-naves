// Enemy.js
export default class Enemy {
  constructor(name) {
    this.name = name;
    this.directionX = 1; // 1 → derecha, -1 → izquierda
  }

  autoMove(setPos) {
    setPos((prev) => {
      let newX = prev.x + this.directionX;
      let newY = prev.y;

      // Si toca borde izquierdo
      if (newX < 2) {
        this.directionX = 1; // cambia a derecha
        newY = prev.y + 1; // baja una fila
      }

      // Si toca borde derecho
      if (newX > 125) {
        this.directionX = -1; // cambia a izquierda
        newY = prev.y + 1; // baja una fila
      }

      return { ...prev, x: newX, y: newY };
    });
  }
}
