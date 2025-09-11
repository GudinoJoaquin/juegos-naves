import { useEffect, useRef, useState } from "react";
import Player from "../utils/Player";
import Enemy from "../utils/Enemy";
import PowerUp from "../utils/PowerUp";
import { isColliding } from "../utils/collision";

const Game = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const keys = useRef({});
  const player = useRef(
    new Player(window.innerWidth / 2 - 20, window.innerHeight - 60)
  );
  const enemies = useRef([]);
  const powerUps = useRef([]);
  const frameCount = useRef(0);
  const gameOver = useRef(false);

  // Velocidad más lenta del jugador
  player.current.speed = 3;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleKeyDown = (e) => (keys.current[e.key] = true);
    const handleKeyUp = (e) => (keys.current[e.key] = false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const spawnEnemy = () => {
      const x = Math.random() * (canvas.width - 40);
      const type = Math.random() < 0.7 ? "normal" : "duro";
      const direction = Math.random() < 0.5 ? 1 : -1; // zigzag inicial
      enemies.current.push({
        x,
        y: -50,
        type,
        health: type === "duro" ? 3 : 1,
        width: 40,
        height: 40,
        speed: 1,
        dx: direction,
        shootCooldown: Math.floor(Math.random() * 120),
      });
    };

    const spawnPowerUp = () => {
      const x = Math.random() * (canvas.width - 30);
      const types = ["doble", "abanico", "velocidad"];
      const type = types[Math.floor(Math.random() * types.length)];
      powerUps.current.push(new PowerUp(x, -50, type));
    };

    const gameLoop = () => {
      if (gameOver.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Movimiento del jugador
      player.current.move(keys.current, canvas);
      if (keys.current[" "] || keys.current["Space"]) player.current.shoot();
      player.current.updateBullets();

      // Dibujar jugador TRIÁNGULO
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.moveTo(player.current.x + player.current.width / 2, player.current.y);
      ctx.lineTo(player.current.x, player.current.y + player.current.height);
      ctx.lineTo(
        player.current.x + player.current.width,
        player.current.y + player.current.height
      );
      ctx.closePath();
      ctx.fill();

      // Generar enemigos
      if (frameCount.current % 120 === 0) spawnEnemy();
      enemies.current.forEach((enemy, i) => {
        // Movimiento zigzag
        enemy.x += enemy.dx * 1; // velocidad horizontal
        enemy.y += enemy.speed; // velocidad vertical lenta

        // Cambiar dirección si toca bordes
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width)
          enemy.dx *= -1;

        // Dibujar enemigo
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Disparo enemigo
        if (enemy.shootCooldown <= 0) {
          if (!enemy.bullets) enemy.bullets = [];
          enemy.bullets.push({
            x: enemy.x + enemy.width / 2 - 5,
            y: enemy.y + enemy.height,
            width: 5,
            height: 10,
            speed: 4,
          });
          enemy.shootCooldown = 150; // frames entre disparos
        } else {
          enemy.shootCooldown--;
        }

        // Dibujar balas de enemigo y colisiones con jugador
        if (enemy.bullets) {
          for (let b = enemy.bullets.length - 1; b >= 0; b--) {
            const bullet = enemy.bullets[b];
            bullet.y += bullet.speed;
            ctx.fillStyle = "orange";
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            if (isColliding(bullet, player.current)) {
              gameOver.current = true;
              alert("Game Over! Puntaje: " + score);
              window.location.reload();
            }

            if (bullet.y > canvas.height) enemy.bullets.splice(b, 1);
          }
        }

        // Colisiones con balas del jugador
        for (let j = player.current.bullets.length - 1; j >= 0; j--) {
          const bullet = player.current.bullets[j];
          if (isColliding(bullet, enemy)) {
            enemy.health--;
            player.current.bullets.splice(j, 1);
            if (enemy.health <= 0) {
              enemies.current.splice(i, 1);
              setScore((prev) => prev + (enemy.type === "duro" ? 15 : 5));
              break;
            }
          }
        }

        // Colisión jugador-enemigo
        if (isColliding(player.current, enemy)) {
          gameOver.current = true;
          alert("Game Over! Puntaje: " + score);
          window.location.reload();
        }
      });

      // Power-ups
      if (frameCount.current % 600 === 0) spawnPowerUp();
      powerUps.current.forEach((p, i) => {
        p.y += p.speed;
        ctx.fillStyle = "cyan";
        ctx.fillRect(p.x, p.y, p.width, p.height);

        if (isColliding(player.current, p)) {
          player.current.powerUp = p.type;
          if (p.type === "velocidad") player.current.shootRate = 7;
          powerUps.current.splice(i, 1);
        }
      });

      // Dibujar balas del jugador
      player.current.bullets.forEach((b) => {
        ctx.fillStyle = "yellow";
        ctx.fillRect(b.x, b.y, 5, 10);
      });

      // Score
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText("Puntaje: " + score, 10, 30);

      frameCount.current++;
      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [score]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        background: "#000",
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default Game;
