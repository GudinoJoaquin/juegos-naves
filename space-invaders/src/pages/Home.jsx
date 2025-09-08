// Home.jsx
import { useState, useEffect, useRef } from "react";
import Player from "../utils/Player";
import Enemy from "../utils/Enemy";
import playerShip from "../assets/img/player.png";
import enemyShip from "../assets/img/red.png";

export default function Home() {
  const [pos, setPos] = useState({ x: 62, y: 60 });

  // varios enemigos
  const [enemies, setEnemies] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 20 + i * 7,
      y: 10,
      alive: true,
    }))
  );

  const [bullets, setBullets] = useState([]);

  const playerOne = useRef(new Player("Gudi"));
  const enemyAI = useRef(new Enemy("Invader")); // todos usan la misma lógica

  // movimiento jugador
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === " ") {
        // disparo
        setBullets((prev) => [
          ...prev,
          { x: pos.x + 2.6, y: pos.y - 1, id: Date.now() },
        ]);
      }
      playerOne.current.move(e, setPos);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pos]);

  // movimiento enemigos
  useEffect(() => {
    const interval = setInterval(() => {
      setEnemies((prevEnemies) =>
        prevEnemies.map((enemy) =>
          enemy.alive
            ? enemyAI.current.autoMoveSimple(enemy) // mover solo si está vivo
            : enemy
        )
      );
    }, 700);

    return () => clearInterval(interval);
  }, []);

  // movimiento balas
  useEffect(() => {
    const interval = setInterval(() => {
      setBullets((prevBullets) =>
        prevBullets.map((b) => ({ ...b, y: b.y - 3 })).filter((b) => b.y >= 0)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // detectar colisiones
  useEffect(() => {
    setEnemies((prevEnemies) =>
      prevEnemies.map((enemy) => {
        if (!enemy.alive) return enemy;

        const hit = bullets.some(
          (b) => Math.abs(b.x - enemy.x) < 2 && Math.abs(b.y - enemy.y) < 2
        );

        if (hit) {
          setBullets((prev) =>
            prev.filter(
              (b) =>
                !(Math.abs(b.x - enemy.x) < 2 && Math.abs(b.y - enemy.y) < 2)
            )
          );
          return { ...enemy, alive: false };
        }
        return enemy;
      })
    );
  }, [bullets]);

  return (
    <main className="overflow-x-hidden h-screen bg-black relative">
      {/* Player */}
      <img
        src={playerShip}
        alt="player"
        className="absolute transition"
        style={{ transform: `translate(${pos.x * 10}px, ${pos.y * 10}px)` }}
      />

      {/* Enemies */}
      {enemies.map(
        (enemy) =>
          enemy.alive && (
            <img
              key={enemy.id}
              src={enemyShip}
              className="w-10 h-10 absolute transition"
              style={{
                transform: `translate(${enemy.x * 10}px, ${enemy.y * 10}px)`,
              }}
            />
          )
      )}

      {/* Bullets */}
      {bullets.map((b) => (
        <div
          key={b.id}
          className="w-2 h-6 bg-sky-400 absolute transition"
          style={{ transform: `translate(${b.x * 10}px, ${b.y * 10}px)` }}
        />
      ))}
    </main>
  );
}
