import Player from "../Player.js";

export default class Tank extends Player {
  constructor(name, x, y, level, keys) {
    const sprites = {
      1: {
        img: document.getElementById("tank_lvl1"),
        frameWidth: 30,
        frameHeight: 30,
        totalFrames: 6,
        stats: { hp: 200, damage: 20, speed: 2 }
      },
      2: {
        img: document.getElementById("tank_lvl2"),
        frameWidth: 36,
        frameHeight: 36,
        totalFrames: 6,
        stats: { hp: 300, damage: 35, speed: 3 }
      }
    };

    const data = sprites[level] || sprites[1];
    super(name, x, y, data.img, data.frameWidth, data.frameHeight, data.totalFrames, keys, data.stats);

    this.shootDelay = level === 1 ? 25 : 15;
  }

  shoot() {
    if (this.activeKeys[this.keys.shoot] && this.shootCooldown <= 0) {
      // Tank dispara más lento pero balas fuertes
      this.bullets.push({
        x: this.x + this.frameWidth / 2,
        y: this.y,
        speed: -6,
        damage: this.damage * 2
      });
      this.shootCooldown = this.shootDelay;
    }
  }
}
