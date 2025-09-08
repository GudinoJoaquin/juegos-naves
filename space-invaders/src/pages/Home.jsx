// Home.jsx
import { useState, useEffect, useRef } from "react";
import Player from "../utils/Player";
import Enemy from "../utils/Enemy";
import playerShip from "../assets/img/player.png";
import enemyShip from "../assets/img/red.png";

export default function Home() {
  const [pos, setPos] = useState({ x: 62, y: 60 });
  const [enemyPos, setEnemyPos] = useState({ x: 62, y: 10 });
  const [enemyAlive, setEnemyAlive] = useState(true);

  const [bullets, setBullets] = useState([]);

  const playerOne = useRef(new Player("Gudi"));
  const enemyOne = useRef(new Enemy("Invader"));

  // movimiento jugador
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === " ") {
        // disparo
        setBullets((prev) => [
          ...prev,
          { x: pos.x + 2.6, y: pos.y - 1, id: Date.now() },
        ]);
      } else {
        playerOne.current.move(e, setPos);
      }
      playerOne.current.move(e, setPos);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pos]);

  // movimiento enemigo
  useEffect(() => {
    if (!enemyAlive) return;

    const interval = setInterval(() => {
      enemyOne.current.autoMove(setEnemyPos);
    }, 500);

    return () => clearInterval(interval);
  }, [enemyAlive]);

  // movimiento balas + colisión
  useEffect(() => {
    const interval = setInterval(() => {
      setBullets(
        (prevBullets) =>
          prevBullets
            .map((b) => ({ ...b, y: b.y - 1 })) // mover hacia arriba
            .filter((b) => b.y >= 0) // eliminar balas fuera de pantalla
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // detectar colisiones
  useEffect(() => {
    bullets.forEach((b) => {
      if (
        enemyAlive &&
        Math.abs(b.x - enemyPos.x) < 2 && // tolerancia horizontal
        Math.abs(b.y - enemyPos.y) < 2 // tolerancia vertical
      ) {
        setEnemyAlive(false); // enemigo muere
        setBullets((prev) => prev.filter((bullet) => bullet.id !== b.id));
      }
    });
  }, [bullets, enemyPos, enemyAlive]);

  return (
    <main className="overflow-x-hidden h-screen bg-black relative">
      {/* Player */}
      <img
        src={playerShip}
        alt="player"
        className="absolute"
        style={{ transform: `translate(${pos.x * 10}px, ${pos.y * 10}px)` }}
      />

      {/* Enemy */}
      {enemyAlive && (
        <img
          src={enemyShip}
          className="w-10 h-10 absolute transition"
          style={{
            transform: `translate(${enemyPos.x * 10}px, ${enemyPos.y * 10}px)`,
          }}
        />
      )}

      {/* Bullets */}
      {bullets.map((b) => (
        <div
          key={b.id}
          className="w-2 h-6 bg-sky-400 absolute"
          style={{ transform: `translate(${b.x * 10}px, ${b.y * 10}px)` }}
        />
      ))}
    </main>
  );
}
