import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Player from "../utils/Player";
import Enemy from "../utils/Enemy";
import Bullet from "../utils/Bullet";
import Barrier from "../utils/Barrier";

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 480;

const PLAYER_COOLDOWN = 300;
const HORIZONTAL_MARGIN = 30;
const PLAYER_SPEED = 200;
const ENEMY_BULLET_SPEED = 150;

// Niveles de enemigos con puntos
const ENEMY_LEVELS = [
  { color: "red", speed: 50, image: "/src/assets/img/red.png", points: 5 },
  { color: "green", speed: 70, image: "/src/assets/img/green.png", points: 10 },
  {
    color: "yellow",
    speed: 90,
    image: "/src/assets/img/yellow.png",
    points: 15,
  },
];

export default function Home() {
  const location = useLocation();
  const { numPlayers, player1Name, player2Name } = location.state || {};

  const canvasRef = useRef(null);
  const playersRef = useRef([]);
  const currentPlayerRef = useRef(0);
  const keysRef = useRef({});
  const playerBulletsRef = useRef([]);
  const enemyBulletsRef = useRef([]);
  const enemiesRef = useRef([]);
  const barriersRef = useRef([]);
  const lastShotRef = useRef(0);
  const lastTimeRef = useRef(0);
  const gameOverRef = useRef(false);

  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Crear jugadores
    const p1 = new Player(CANVAS_WIDTH, CANVAS_HEIGHT, player1Name, false);
    const p2 =
      numPlayers === 2
        ? new Player(CANVAS_WIDTH, CANVAS_HEIGHT, player2Name, true)
        : null;
    playersRef.current = p2 ? [p1, p2] : [p1];

    // Crear barreras
    const barriers = [];
    const barrierY = CANVAS_HEIGHT - 120;
    const barrierSpacing = (CANVAS_WIDTH - 4 * 50) / 5;
    for (let i = 0; i < 4; i++) {
      const barrierX = barrierSpacing + i * (50 + barrierSpacing);
      barriers.push(new Barrier(barrierX, barrierY));
    }
    barriersRef.current = barriers;

    let enemyDirection = 1;
    let enemyShotChance = 0.001;

    // Crear enemigos según nivel, pasando puntos en el constructor
    const createEnemies = (levelIndex) => {
      const rows = 4;
      const cols = 10;
      const { speed, image, points } = ENEMY_LEVELS[levelIndex];
      const enemies = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const enemy = new Enemy(
            HORIZONTAL_MARGIN + col * 55,
            30 + row * 35,
            image
          );
          enemy.points = points; // Asignamos puntos
          enemies.push(enemy);
        }
      }
      enemiesRef.current = enemies;
      return speed;
    };

    let enemySpeed = createEnemies(level);

    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const gameLoop = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (gameOverRef.current) return;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const player = playersRef.current[currentPlayerRef.current];

      // Mostrar HUD
      ctx.fillStyle = "white";
      ctx.font = "18px Arial";
      ctx.fillText(`Jugador: ${player.name}`, 20, 25);
      ctx.fillText(`Vidas: ${player.lives}`, 20, 50);
      ctx.fillText(`Nivel: ${level + 1}`, CANVAS_WIDTH - 100, 25);

      // Movimiento jugador
      if (keysRef.current["ArrowLeft"]) player.x -= PLAYER_SPEED * dt;
      if (keysRef.current["ArrowRight"]) player.x += PLAYER_SPEED * dt;
      if (player.x < HORIZONTAL_MARGIN) player.x = HORIZONTAL_MARGIN;
      if (player.x + player.width > CANVAS_WIDTH - HORIZONTAL_MARGIN)
        player.x = CANVAS_WIDTH - HORIZONTAL_MARGIN - player.width;

      // Disparo jugador
      const now = Date.now();
      if (
        keysRef.current[" "] &&
        now - lastShotRef.current >= PLAYER_COOLDOWN
      ) {
        playerBulletsRef.current.push(
          new Bullet(
            player.x + player.width / 2 - 2.5,
            player.y,
            -1,
            "yellow",
            300
          )
        );
        lastShotRef.current = now;
      }

      // Mover enemigos
      let hitEdge = false;
      enemiesRef.current.forEach((enemy) => {
        enemy.x += enemyDirection * enemySpeed * dt;
        if (
          enemy.x + enemy.width > CANVAS_WIDTH - HORIZONTAL_MARGIN ||
          enemy.x < HORIZONTAL_MARGIN
        )
          hitEdge = true;
      });
      if (hitEdge) {
        enemiesRef.current.forEach((enemy) => (enemy.y += 10));
        enemyDirection = -enemyDirection;
      }

      // Enemigos disparan
      const columns = {};
      enemiesRef.current.forEach((enemy) => {
        const col = Math.round((enemy.x - HORIZONTAL_MARGIN) / 55);
        if (!columns[col] || enemy.y > columns[col].y) columns[col] = enemy;
      });
      Object.values(columns).forEach((enemy) => {
        if (Math.random() < enemyShotChance) {
          enemyBulletsRef.current.push(
            new Bullet(
              enemy.x + enemy.width / 2 - 2.5,
              enemy.y + enemy.height,
              1,
              "red",
              ENEMY_BULLET_SPEED
            )
          );
        }
      });

      // Actualizar balas
      playerBulletsRef.current.forEach((b) => b.update(dt));
      playerBulletsRef.current = playerBulletsRef.current.filter(
        (b) => b.active
      );
      enemyBulletsRef.current.forEach((b) => b.update(dt));
      enemyBulletsRef.current = enemyBulletsRef.current.filter((b) => b.active);

      // Colisiones balas vs enemigos
      enemiesRef.current = enemiesRef.current.filter((enemy) => {
        let alive = true;
        playerBulletsRef.current.forEach((b) => {
          if (
            b.x < enemy.x + enemy.width &&
            b.x + b.width > enemy.x &&
            b.y < enemy.y + enemy.height &&
            b.y + b.height > enemy.y
          ) {
            b.active = false;
            alive = false;
            setScore((prev) => prev + (enemy.points || 0)); // ✅ sumar puntos
          }
        });
        return alive;
      });

      // Colisiones balas vs jugador
      enemyBulletsRef.current.forEach((b) => {
        if (
          b.x < player.x + player.width &&
          b.x + b.width > player.x &&
          b.y < player.y + player.height &&
          b.y + b.height > player.y
        ) {
          b.active = false;
          player.lives -= 1;
          if (numPlayers === 2 && player.lives > 0) {
            currentPlayerRef.current = currentPlayerRef.current === 0 ? 1 : 0;
            playersRef.current[currentPlayerRef.current].x =
              CANVAS_WIDTH / 2 -
              playersRef.current[currentPlayerRef.current].width / 2;
          }
        }
      });

      // Colisiones balas vs barreras
      playerBulletsRef.current.forEach((b) => {
        barriersRef.current.forEach((barrier) => barrier.hit(b));
      });
      enemyBulletsRef.current.forEach((b) => {
        barriersRef.current.forEach((barrier) => barrier.hit(b));
      });

      // Dibujar todo
      player.draw(ctx);
      enemiesRef.current.forEach((enemy) => enemy.draw(ctx));
      playerBulletsRef.current.forEach((b) => b.draw(ctx));
      enemyBulletsRef.current.forEach((b) => b.draw(ctx));
      barriersRef.current.forEach((barrier) => barrier.draw(ctx));

      // Fin de juego
      if (enemiesRef.current.some((e) => e.y + e.height >= player.y)) {
        gameOverRef.current = true;
        alert("¡Los enemigos llegaron a la nave! Game Over!");
        return;
      }
      if (playersRef.current.every((p) => p.lives <= 0)) {
        gameOverRef.current = true;
        alert("¡Game Over!");
        return;
      }

      // Siguiente nivel
      if (enemiesRef.current.length === 0) {
        if (level < ENEMY_LEVELS.length - 1) {
          const nextLevel = level + 1;
          setLevel(nextLevel);
          enemySpeed = createEnemies(nextLevel);
        } else {
          gameOverRef.current = true;
          alert("¡Ganaste todos los niveles!");
          return;
        }
      }

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [numPlayers, player1Name, player2Name, level]);

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
    </div>
  );
}
