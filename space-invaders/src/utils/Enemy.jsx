// Enemy.js
export default class Enemy {
  constructor(name) {
    this.name = name;
    this.directionX = 1; // 1 → derecha, -1 → izquierda
  }

  autoMoveSimple(enemy) {
    let newX = enemy.x + this.directionX;
    let newY = enemy.y;

    if (newX <= 10) {
      this.directionX = 1;
      newX = enemy.x;
      newY = enemy.y + 1;
    }
    if (newX >= 125) {
      this.directionX = -1;
      newX = enemy.x;
      newY = enemy.y + 1;
    }

    return { ...enemy, x: newX, y: newY };
  }
}
