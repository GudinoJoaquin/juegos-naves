// importamos los componentes, hooks, y el router
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Player from "../utils/Player";
import Enemy from "../utils/Enemy";
import Bullet from "../utils/Bullet";
import Barrier from "../utils/Barrier";
import Ufo from "../utils/Ufo";

//creamos y inicializamos las constantes del jugador y enemigo
const PLAYER_COOLDOWN = 300;
const HORIZONTAL_MARGIN = 30;
const PLAYER_SPEED = 200;
const ENEMY_BULLET_SPEED = 80;

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

//creamos y inicializamos del UFO que te da vida
const UFO_INTERVAL = 15000;
const UFO_INITIAL_DELAY = 10000;
const UFO_SPEED = 120;

//componente principal del juego a partir de esto se muestra todo el juego
export default function Home() {
  //creamos constantes y las inicializamos para que alguna no se re renderizen
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
  const animationRef = useRef(null);
  const isPlayingRef = useRef(false);
  const scoreRef = useRef(0);
  const enemyDirectionRef = useRef(1);
  const baseEnemySpeedRef = useRef(0);
  const currentEnemySpeedRef = useRef(0);
  const enemyInitialCountRef = useRef(0);
  const currentLevelRef = useRef(0);
  const waveIndexRef = useRef(0);
  const ufoRef = useRef(null);
  const lastUfoSpawn = useRef(Date.now() + UFO_INITIAL_DELAY - UFO_INTERVAL);
  const touchRef = useRef(false); //ref global para el touch

  //creamos y inicializamos las constantes para que esta si provoquen re renderizado
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 700, height: 480 });
  const [scale, setScale] = useState(1);

  // Ajuste responsive
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = window.innerWidth;
      const maxHeight = window.innerHeight - 80;
      const ratio = 720 / 480;
      let width = maxWidth;
      let height = width / ratio;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * ratio;
      }
      setCanvasSize({ width, height });
      setScale(width / 700);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e) => (keysRef.current[e.key] = true);
    const handleKeyUp = (e) => (keysRef.current[e.key] = false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  //Evento Touch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let touchX = null;

    const handleTouchStart = (e) => {
      touchX = e.touches[0].clientX;
      touchRef.current = true; // activar disparo
    };

    const handleTouchMove = (e) => {
      if (touchX === null) return;
      const dx = e.touches[0].clientX - touchX;
      touchX = e.touches[0].clientX;
      const player = playersRef.current[currentPlayerRef.current];
      player.x += dx / scale;
      if (player.x < HORIZONTAL_MARGIN) player.x = HORIZONTAL_MARGIN;
      if (player.x + player.width > 700 - HORIZONTAL_MARGIN)
        player.x = 700 - HORIZONTAL_MARGIN - player.width;
    };

    const handleTouchEnd = () => {
      touchX = null;
      touchRef.current = false; // detener disparo
    };

    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [scale]);

  //funcion para crear las oleadas de enemigo tanto para celu como para compu
  const createWave = (levelIndex, waveIndex) => {
    const rows = window.innerWidth < 600 ? 3 : 4;
    const cols = window.innerWidth < 600 ? 6 : 10;
    const { speed, image, points } = ENEMY_LEVELS[levelIndex];
    const enemies = [];
    const yStart = 60;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const enemy = new Enemy(
          HORIZONTAL_MARGIN + col * 55,
          yStart + row * 35,
          image
        );
        enemy.points = points;
        enemies.push(enemy);
      }
    }
    enemiesRef.current = enemies;
    baseEnemySpeedRef.current = speed;
    currentEnemySpeedRef.current = speed;
    enemyDirectionRef.current = 1;
    enemyInitialCountRef.current = enemies.length;
  };

  //funcion para resetear el juego
  const resetGame = () => {
    setLevel(0);
    currentLevelRef.current = 0;
    waveIndexRef.current = 0;

    const p1 = new Player(720, 480, player1Name, false);
    const p2 =
      numPlayers === 2 ? new Player(700, 480, player2Name, true) : null;
    playersRef.current = p2 ? [p1, p2] : [p1];

    const barriers = [];
    const barrierY = 480 - 120;
    const barrierSpacing = (700 - 4 * 50) / 5;
    for (let i = 0; i < 4; i++) {
      const barrierX = barrierSpacing + i * (50 + barrierSpacing);
      barriers.push(new Barrier(barrierX, barrierY));
    }
    barriersRef.current = barriers;

    playerBulletsRef.current = [];
    enemyBulletsRef.current = [];
    keysRef.current = {};
    lastShotRef.current = 0;
    lastTimeRef.current = 0;
    currentPlayerRef.current = 0;
    gameOverRef.current = false;
    scoreRef.current = 0;
    setScore(0);

    ufoRef.current = null;
    lastUfoSpawn.current = Date.now() + UFO_INITIAL_DELAY - UFO_INTERVAL;

    createWave(0, 0);
  };

  //funcion para guardar el puntaje
  const saveScore = () => {
    const username =
      numPlayers === 2 ? `${player1Name} y ${player2Name}` : player1Name;
    fetch("http://localhost:3000/spaceInvaders/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, points: scoreRef.current }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Usuario guardado:", data))
      .catch((err) => console.error(err));
  };

  //bucle principal del juego aca se produce la magia
  const startGameLoop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const enemyShotChance = 0.002;

    const gameLoop = (time) => {
      if (!isPlayingRef.current) return;
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (gameOverRef.current) return;

      ctx.save();
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.scale(scale, scale);

      const player = playersRef.current[currentPlayerRef.current];

      // HUD
      ctx.fillStyle = "#00FF00";
      ctx.font = "bold 12px 'Press Start 2P', monospace";
      ctx.fillText(`Jugador: ${player.name}`, 20, 18);
      ctx.fillText(`Vidas: ${player.lives}`, 20, 34);
      ctx.fillText(`Nivel: ${currentLevelRef.current + 1}`, 700 - 100, 18);
      ctx.fillText(`Puntos: ${scoreRef.current}`, 350 - 40, 18);

      // Movimiento teclado
      if (keysRef.current["ArrowLeft"]) player.x -= PLAYER_SPEED * dt;
      if (keysRef.current["ArrowRight"]) player.x += PLAYER_SPEED * dt;
      if (player.x < HORIZONTAL_MARGIN) player.x = HORIZONTAL_MARGIN;
      if (player.x + player.width > 700 - HORIZONTAL_MARGIN)
        player.x = 700 - HORIZONTAL_MARGIN - player.width;

      // Disparo teclado + touch
      const now = Date.now();
      if (
        (keysRef.current[" "] || touchRef.current) &&
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

      // Movimiento enemigos
      let hitEdge = false;
      enemiesRef.current.forEach((enemy) => {
        enemy.x +=
          enemyDirectionRef.current * currentEnemySpeedRef.current * dt;
        if (
          enemy.x + enemy.width > 700 - HORIZONTAL_MARGIN ||
          enemy.x < HORIZONTAL_MARGIN
        )
          hitEdge = true;
      });
      if (hitEdge) {
        enemiesRef.current.forEach((enemy) => (enemy.y += 10));
        enemyDirectionRef.current *= -1;
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

      // Mover balas
      playerBulletsRef.current.forEach((b) => b.update(dt));
      enemyBulletsRef.current.forEach((b) => b.update(dt));

      // Colisiones balas vs enemigos
      const totalEnemies = enemyInitialCountRef.current;
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
            scoreRef.current += enemy.points || 0;
            setScore(scoreRef.current);
          }
        });
        return alive;
      });

      // Acelerar enemigos
      const killedEnemies = totalEnemies - enemiesRef.current.length;
      currentEnemySpeedRef.current =
        baseEnemySpeedRef.current * (1 + (killedEnemies / totalEnemies) * 2);
      if (enemiesRef.current.length === 1)
        currentEnemySpeedRef.current = baseEnemySpeedRef.current * 8;

      // Filtrar balas
      playerBulletsRef.current = playerBulletsRef.current.filter(
        (b) => b.active
      );
      enemyBulletsRef.current = enemyBulletsRef.current.filter((b) => b.active);

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
          if (player.lives < 0) player.lives = 0;

          if (numPlayers === 2) {
            const nextPlayer =
              (currentPlayerRef.current + 1) % playersRef.current.length;
            if (playersRef.current[nextPlayer].lives > 0)
              currentPlayerRef.current = nextPlayer;
            else if (playersRef.current[currentPlayerRef.current].lives <= 0)
              gameOverRef.current = true;
          }
        }
      });

      // Colisiones balas vs barreras
      playerBulletsRef.current.forEach((b) =>
        barriersRef.current.forEach((barrier) => barrier.hit(b))
      );
      enemyBulletsRef.current.forEach((b) =>
        barriersRef.current.forEach((barrier) => barrier.hit(b))
      );

      // --- Manejo del UFO ---
      if (!ufoRef.current && now - lastUfoSpawn.current > UFO_INTERVAL) {
        ufoRef.current = new Ufo(-60, 40, UFO_SPEED, 700);
        lastUfoSpawn.current = now;
      }

      if (ufoRef.current) {
        ufoRef.current.update(dt);
        ufoRef.current.draw(ctx);

        playerBulletsRef.current.forEach((b) => {
          if (ufoRef.current.collidesWith(b)) {
            b.active = false;
            ufoRef.current.active = false;
            const player = playersRef.current[currentPlayerRef.current];
            player.lives += player.lives < 3 ? 1 : 0;
            setScore(scoreRef.current);
          }
        });

        if (!ufoRef.current.active) ufoRef.current = null;
      }

      // Dibujar todo
      player.draw(ctx);
      enemiesRef.current.forEach((enemy) => enemy.draw(ctx));
      playerBulletsRef.current.forEach((b) => b.draw(ctx));
      enemyBulletsRef.current.forEach((b) => b.draw(ctx));
      barriersRef.current.forEach((barrier) => barrier.draw(ctx));

      // Scanlines retro
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = "black";
      for (let y = 0; y < canvasSize.height / scale; y += 2)
        ctx.fillRect(0, y, canvasSize.width / scale, 1);
      ctx.globalAlpha = 1;

      ctx.restore();

      // Game Over
      if (
        enemiesRef.current.some((e) => e.y + e.height >= player.y) ||
        playersRef.current.every((p) => p.lives <= 0)
      ) {
        gameOverRef.current = true;
        alert("¡Game Over!");
        isPlayingRef.current = false;
        setIsPlaying(false);
        saveScore();
        return;
      }

      // Siguiente oleada / nivel
      if (enemiesRef.current.length === 0) {
        const levelNum = currentLevelRef.current;
        const totalWaves = levelNum === 0 ? 1 : levelNum + 1;
        if (waveIndexRef.current + 1 < totalWaves) {
          waveIndexRef.current++;
          createWave(levelNum, waveIndexRef.current);
        } else if (levelNum < ENEMY_LEVELS.length - 1) {
          currentLevelRef.current++;
          setLevel(currentLevelRef.current);
          waveIndexRef.current = 0;
          createWave(currentLevelRef.current, waveIndexRef.current);
        } else {
          gameOverRef.current = true;
          alert("¡Ganaste todos los niveles!");
          isPlayingRef.current = false;
          setIsPlaying(false);
          saveScore();
          return;
        }
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  //funcion para iniciar y reiniciar el juego
  const handlePlayClick = (e) => {
    e.currentTarget.blur();
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      resetGame();
      startGameLoop();
    } else {
      cancelAnimationFrame(animationRef.current);
      resetGame();
      startGameLoop();
    }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ touchAction: "none" }}
      />
      <button
        tabIndex={-1}
        onClick={handlePlayClick}
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 select-none"
      >
        {isPlaying ? "Reiniciar Juego" : "Jugar"}
      </button>
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
