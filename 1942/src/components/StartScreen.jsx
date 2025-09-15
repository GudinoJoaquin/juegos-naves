import React, { useState } from 'react';
import './StartScreen.css';

const StartScreen = ({ onStartGame }) => {
    const [numPlayers, setNumPlayers] = useState(1);
    const [player1Name, setPlayer1Name] = useState('');
    const [player2Name, setPlayer2Name] = useState('');

    const handleStartGame = () => {
        if (numPlayers === 1) {
            if (player1Name.trim() === '') {
                alert('Por favor, ingresa el nombre del Jugador 1.');
                return;
            }
            onStartGame([player1Name.trim()]);
        } else {
            if (player1Name.trim() === '' || player2Name.trim() === '') {
                alert('Por favor, ingresa los nombres de ambos jugadores.');
                return;
            }
            onStartGame([player1Name.trim(), player2Name.trim()]);
        }
    };

    return (
        <div className="start-screen-container">
            <div className="start-screen-content">
                <h1 className="game-title">1942: Sky Combat</h1>
                
                <div className="player-selection">
                    <h2>Modo de Juego</h2>
                    <div className="player-count-buttons">
                        <button
                            className={`player-count-button ${numPlayers === 1 ? 'selected' : ''}`}
                            onClick={() => setNumPlayers(1)}
                        >1 Jugador</button>
                        <button
                            className={`player-count-button ${numPlayers === 2 ? 'selected' : ''}`}
                            onClick={() => setNumPlayers(2)}
                        >2 Jugadores</button>
                    </div>
                </div>

                <div className="name-input-form">
                    <div className="name-input-group">
                        <label htmlFor="player1Name">Jugador 1:</label>
                        <input 
                            type="text" 
                            id="player1Name" 
                            value={player1Name}
                            onChange={(e) => setPlayer1Name(e.target.value)}
                            placeholder="Nombre Jugador 1"
                        />
                    </div>
                    {numPlayers === 2 && (
                        <div className="name-input-group">
                            <label htmlFor="player2Name">Jugador 2:</label>
                            <input 
                                type="text" 
                                id="player2Name" 
                                value={player2Name}
                                onChange={(e) => setPlayer2Name(e.target.value)}
                                placeholder="Nombre Jugador 2"
                            />
                        </div>
                    )}
                    <button className="start-game-button" onClick={handleStartGame}>Iniciar Juego</button>
                </div>
            </div>
        </div>
    );
};

export default StartScreen;
