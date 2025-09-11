import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PlayerSelect() {
  const [numPlayers, setNumPlayers] = useState(1);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (!player1Name || (numPlayers === 2 && !player2Name)) {
      alert("Ingrese los nombres de los jugadores");
      return;
    }
    // Navegar al juego y pasar datos por state
    navigate("/home", {
      state: {
        numPlayers,
        player1Name,
        player2Name: numPlayers === 2 ? player2Name : null,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl mb-4">Seleccione número de jugadores</h1>

      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            numPlayers === 1 ? "bg-green-500" : "bg-gray-700"
          }`}
          onClick={() => setNumPlayers(1)}
        >
          1 Jugador
        </button>
        <button
          className={`px-4 py-2 rounded ${
            numPlayers === 2 ? "bg-green-500" : "bg-gray-700"
          }`}
          onClick={() => setNumPlayers(2)}
        >
          2 Jugadores
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-4 ">
        <input
          type="text"
          placeholder="Nombre jugador 1"
          value={player1Name}
          onChange={(e) => setPlayer1Name(e.target.value)}
          className="px-2 py-1 rounded text-white border-2 border-white"
        />
        {numPlayers === 2 && (
          <input
            type="text"
            placeholder="Nombre jugador 2"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            className="px-2 py-1 rounded text-white border-2 border-white"
          />
        )}
      </div>

      <button
        onClick={handleStart}
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
      >
        Jugar
      </button>
    </div>
  );
}
