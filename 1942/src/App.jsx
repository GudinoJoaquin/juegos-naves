import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StartScreen from "./components/StartScreen";

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerNames, setPlayerNames] = useState([]); // Changed from playerName

  const handleStartGame = (names) => {
    setPlayerNames(names);
    setGameStarted(true);
  };

  return (
    <>
      {!gameStarted ? (
        <StartScreen onStartGame={handleStartGame} />
      ) : (
        <Routes>
          <Route path="/" element={<Home playerNames={playerNames} />} /> // Pass playerNames
        </Routes>
      )}
    </>
  );
}
