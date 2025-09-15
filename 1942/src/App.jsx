import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StartScreen from "./components/StartScreen";

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");

  const handleStartGame = (name) => {
    setPlayerName(name);
    setGameStarted(true);
  };

  return (
    <>
      {!gameStarted ? (
        <StartScreen onStartGame={handleStartGame} />
      ) : (
        <Routes>
          <Route path="/" element={<Home playerName={playerName} />} />
        </Routes>
      )}
    </>
  );
}
