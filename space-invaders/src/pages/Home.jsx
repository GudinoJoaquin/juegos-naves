import { useEffect, useRef, useState } from "react";
import Player from "../utils/Player";
import Enemy from "../utils/Enemy";
import Bullet from "../utils/Bullet";

const CANVAS_WIDTH = 700; // más ancho para más espacio horizontal
const CANVAS_HEIGHT = 480;
const PLAYER_COOLDOWN = 300; // ms entre disparos
const HORIZONTAL_MARGIN = 30; // margen para jugador y enemigos

export default function Home() {
  const canvasRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const lastShotRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const playerInstance = new Player(CANVAS_WIDTH, CANVAS_HEIGHT);
    setPlayer(playerInstance);

    // Crear enemigos
    const rows = 4;
    const cols = 10;
    let enemies = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        enemies.push(new Enemy(HORIZONTAL_MARGIN + col * 55, 40 + row * 40));
      }
    }

    let enemyDirection = 1;
    let enemySpeed = 0.5; // más lento al inicio
    let playerBullets = [];
    let enemyBullets = [];
    let gameOver = false;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft")
        playerInstance.move(-1, CANVAS_WIDTH, HORIZONTAL_MARGIN);
      if (e.key === "ArrowRight")
        playerInstance.move(1, CANVAS_WIDTH, HORIZONTAL_MARGIN);
      if (e.key === " ") {
        const now = Date.now();
        if (now - lastShotRef.current >= PLAYER_COOLDOWN) {
          playerBullets.push(
            new Bullet(
              playerInstance.x + playerInstance.width / 2 - 2.5,
              playerInstance.y,
              -1,
              "yellow"
            )
          );
          lastShotRef.current = now;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const gameLoop = () => {
      if (gameOver) return;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Mover enemigos
      let hitEdge = false;
      enemies.forEach((enemy) => {
        enemy.x += enemyDirection * enemySpeed;
        if (
          enemy.x + enemy.width > CANVAS_WIDTH - HORIZONTAL_MARGIN ||
          enemy.x < HORIZONTAL_MARGIN
        )
          hitEdge = true;
      });
      if (hitEdge) {
        enemies.forEach((enemy) => (enemy.y += 20));
        enemyDirection = -enemyDirection;
      }

      // Enemigos disparan solo los que no tienen otro delante
      const columns = {};
      enemies.forEach((enemy) => {
        const col = Math.round((enemy.x - HORIZONTAL_MARGIN) / 55);
        if (!columns[col] || enemy.y > columns[col].y) {
          columns[col] = enemy;
        }
      });
      Object.values(columns).forEach((enemy) => {
        if (Math.random() < 0.003) {
          enemyBullets.push(
            new Bullet(
              enemy.x + enemy.width / 2 - 2.5,
              enemy.y + enemy.height,
              0.8,
              "red"
            )
          );
        }
      });

      // Actualizar balas jugador
      playerBullets.forEach((b) => b.update());
      playerBullets = playerBullets.filter((b) => b.active);

      // Actualizar balas enemigo (más lentas)
      enemyBullets.forEach((b) => b.update());
      enemyBullets = enemyBullets.filter((b) => b.active);

      // Colisiones jugador balas vs enemigos
      let killed = 0;
      enemies = enemies.filter((enemy) => {
        let alive = true;
        playerBullets.forEach((b) => {
          if (
            b.x < enemy.x + enemy.width &&
            b.x + b.width > enemy.x &&
            b.y < enemy.y + enemy.height &&
            b.y + b.height > enemy.y
          ) {
            b.active = false;
            alive = false;
            killed++;
          }
        });
        return alive;
      });

      // Aumentar velocidad enemigos al matar
      if (killed > 0) {
        enemySpeed += 0.05 * killed;
      }

      // Colisiones enemigo balas vs jugador
      enemyBullets.forEach((b) => {
        if (
          b.x < playerInstance.x + playerInstance.width &&
          b.x + b.width > playerInstance.x &&
          b.y < playerInstance.y + playerInstance.height &&
          b.y + b.height > playerInstance.y
        ) {
          b.active = false;
          playerInstance.lives -= 1;
        }
      });

      // Dibujar todo
      playerInstance.draw(ctx);
      enemies.forEach((enemy) => enemy.draw(ctx));
      playerBullets.forEach((b) => b.draw(ctx));
      enemyBullets.forEach((b) => b.draw(ctx));

      // Game Over
      if (playerInstance.lives <= 0) {
        gameOver = true;
        alert("¡Game Over!");
        return;
      }

      // Ganar
      if (enemies.length === 0) {
        gameOver = true;
        alert("¡Ganaste!");
        return;
      }

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
    </div>
  );
}
