import Player from "../Player.js";

export default class Laser extends Player {
  constructor(name, x, y, level, keys) {
    const sprites = {
      1: {
        img: document.getElementById("laser_lvl1"),
        frameWidth: 20,
        frameHeight: 20,
        totalFrames: 4,
        stats: { hp: 80, damage: 15, speed: 5 }
      },
      2: {
        img: document.getElementById("laser_lvl2"),
        frameWidth: 24,
        frameHeight: 24,
        totalFrames: 4,
        stats: { hp: 120, damage: 25, speed: 7 }
      }
    };

    const data = sprites[level] || sprites[1];
    super(name, x, y, data.img, data.frameWidth, data.frameHeight, data.totalFrames, keys, data.stats);

    this.shootDelay = level === 1 ? 12 : 6;
  }

  shoot() {
    if (this.activeKeys[this.keys.shoot] && this.shootCooldown <= 0) {
      // Laser dispara más rápido y recto
      this.bullets.push({
        x: this.x + this.frameWidth / 2,
        y: this.y,
        speed: -12,
        damage: this.damage
      });
      this.shootCooldown = this.shootDelay;
    }
  }
}
