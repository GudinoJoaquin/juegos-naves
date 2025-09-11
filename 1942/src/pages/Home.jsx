import { useEffect, useRef } from "react";
import Assault from "../../classes/spaceship/Assault.js";

export default function Home() {
  const canvasRef = useRef(null);
  const assaultRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Definir controles
    const keys1 = {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
      shoot: "Space",
    };

    const keys2 = {
      up: "KeyW",
      down: "KeyS",
      left: "KeyA",
      right: "KeyD",
      shoot: "ShiftLeft",
    };

    // Crear naves Assault
    const players = [
      new Assault(100, 400, 1, keys1), // Nivel 1
      new Assault(300, 400, 2, keys2), // Nivel 2
    ];

    assaultRef.current = players;

    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      players.forEach((player) => {
        player.update(canvas);

        // Disparar si la tecla está presionada
        if (player.activeKeys[player.keys.shoot]) player.shoot();

        player.draw(ctx);
      });

      requestAnimationFrame(gameLoop);
    }

    gameLoop();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-white"
      />
    </div>
  );
}
