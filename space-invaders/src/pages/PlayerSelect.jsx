import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PlayerSelect() {
  const [users, setUsers] = useState([]);
  const [numPlayers, setNumPlayers] = useState(1);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/spaceInvaders/users"
        );
        if (!response.ok) throw new Error("Error al traer los usuarios");
        const data = await response.json();
        setUsers(data.data || data || []);
      } catch (error) {
        console.error(error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const handleStart = () => {
    if (!player1Name || (numPlayers === 2 && !player2Name)) {
      alert("Ingrese los nombres de los jugadores");
      return;
    }
    navigate("/home", {
      state: {
        numPlayers,
        player1Name,
        player2Name: numPlayers === 2 ? player2Name : null,
      },
    });
  };

  // Ordenar usuarios por score/points
  const sortedUsers = [...users].sort(
    (a, b) => (b.score || b.points || 0) - (a.score || a.points || 0)
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white overflow-auto p-4">
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

      <div className="flex flex-col gap-2 mb-4 w-full max-w-sm">
        <input
          type="text"
          placeholder="Nombre jugador 1"
          value={player1Name}
          onChange={(e) => setPlayer1Name(e.target.value)}
          className="px-2 py-1 rounded text-white border-2 border-white w-full"
        />
        {numPlayers === 2 && (
          <input
            type="text"
            placeholder="Nombre jugador 2"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            className="px-2 py-1 rounded text-white border-2 border-white w-full"
          />
        )}
      </div>

      <button
        onClick={handleStart}
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 mb-6"
      >
        Jugar
      </button>

      {/* Tabla de usuarios */}
      <table className="table-auto border-collapse border border-white text-center w-full max-w-lg">
        <thead>
          <tr className="bg-gray-800">
            <th className="border border-white px-4 py-2">#</th>
            <th className="border border-white px-4 py-2">Nombre</th>
            <th className="border border-white px-4 py-2">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.length === 0 ? (
            <tr>
              <td colSpan={3} className="border border-white px-4 py-2">
                No hay usuarios
              </td>
            </tr>
          ) : (
            sortedUsers.map((user, index) => (
              <tr key={index} className="hover:bg-gray-700">
                <td className="border border-white px-4 py-2">{index + 1}</td>
                <td className="border border-white px-4 py-2">
                  {user.username || user.name || "Desconocido"}
                </td>
                <td className="border border-white px-4 py-2">
                  {user.points ?? user.score ?? 0}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
