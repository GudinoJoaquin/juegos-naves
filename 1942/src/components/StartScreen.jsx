import React, { useState, useEffect } from 'react';
import './StartScreen.css';

const StartScreen = ({ onStartGame }) => {
    const [playerName, setPlayerName] = useState('');

    const handleStartGame = () => {
        if (playerName.trim() === '') {
            alert('Por favor, ingresa tu nombre.');
            return;
        }
        onStartGame(playerName.trim());
    };

    return (
        <div className="start-screen-container">
            <h1 className="game-title">1942: Sky Combat</h1>

            <div className="name-input-form">
                <div className="name-input-group">
                    <label htmlFor="playerName">Ingresa tu nombre:</label>
                    <input 
                        type="text" 
                        id="playerName" 
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Tu nombre"
                    />
                </div>
                <button className="start-game-button" onClick={handleStartGame}>Iniciar Juego</button>
            </div>
        </div>
    );
};

export default StartScreen;
