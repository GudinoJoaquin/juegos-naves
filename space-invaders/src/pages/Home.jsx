import { useState, useEffect, useRef } from "react";
import Player from "../utils/Player";

export default function Home() {
  const [pos, setPos] = useState({ x: 62, y: 60 });
  const playerOne = useRef(new Player("Gudi")); // instancia única

  useEffect(() => {
    const handleKey = (e) => {
      playerOne.current.move(e, setPos);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []); // vacío → solo se monta una vez

  return (
    <main className="overflow-x-hidden h-screen">
      <h1 style={{ transform: `translate(${pos.x * 10}px, ${pos.y * 10}px)` }}>
        Jugador Gudi
      </h1>
    </main>
  );
}
