import Player from "../Player.js";
import spriteLvl1_1 from "../../src/assets/Player/Assault/1/1.png";
import spriteLvl1_2 from "../../src/assets/Player/Assault/1/2.png";
import spriteLvl1_3 from "../../src/assets/Player/Assault/1/3.png";
import spriteLvl1_4 from "../../src/assets/Player/Assault/1/4.png";
import spriteLvl1_5 from "../../src/assets/Player/Assault/1/5.png";

import spriteLvl2_1 from "../../src/assets/Player/Assault/2/1.png";
import spriteLvl2_2 from "../../src/assets/Player/Assault/2/2.png";
import spriteLvl2_3 from "../../src/assets/Player/Assault/2/3.png";
import spriteLvl2_4 from "../../src/assets/Player/Assault/2/4.png";
import spriteLvl2_5 from "../../src/assets/Player/Assault/2/5.png";

export default class Assault extends Player {
  constructor(x, y, level = 1, keys) {
    const statsByLevel = {
      1: { hp: 100, damage: 10, speed: 4, bulletSpeed: 6, scale: 1.5 },
      2: { hp: 150, damage: 20, speed: 6, bulletSpeed: 9, scale: 2 },
    };

    const framesByLevel = {
      1: [spriteLvl1_1, spriteLvl1_2, spriteLvl1_3, spriteLvl1_4, spriteLvl1_5],
      2: [spriteLvl2_1, spriteLvl2_2, spriteLvl2_3, spriteLvl2_4, spriteLvl2_5],
    };

    super(
      x,
      y,
      framesByLevel[level],
      32,
      32,
      5,
      statsByLevel[level],
      keys
    );

    this.level = level;
  }

  shoot() {
    if (this.shootCooldown > 0) return;
    this.shootCooldown = 15;

    const shots = this.level === 1 ? 1 : 2;
    for (let i = 0; i < shots; i++) {
      const offset = shots === 2 ? (i === 0 ? -10 : 10) : 0;
      const bullet = {
        x: this.x + this.frameWidth * this.scale / 2 + offset,
        y: this.y,
        vx: 0,
        vy: -this.bulletSpeed,
        size: this.level === 1 ? 5 : 8,
        color: "cyan",
        particles: []
      };

      // Crear partículas iniciales
      for (let p = 0; p < (this.level === 1 ? 5 : 12); p++) {
        bullet.particles.push({
          x: bullet.x,
          y: bullet.y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 1,
          size: Math.random() * (this.level === 1 ? 2 : 4),
          life: 20 + Math.random() * 10,
          maxLife: 20 + Math.random() * 10
        });
      }

      this.bullets.push(bullet);
    }
  }
}
