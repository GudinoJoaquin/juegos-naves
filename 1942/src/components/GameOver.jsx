import React from 'react';
import './GameOver.css';

const GameOver = ({ score, onRestart }) => {
    return (
        <div className="game-over-container">
            <div className="game-over-content">
                <h1 className="game-over-title">GAME OVER</h1>
                <div className="game-over-buttons">
                    <button className="game-over-button" onClick={onRestart}>
                        Salir
                    </button>
                    <button className="game-over-button" onClick={() => console.log("Ver Score")}>
                        Ver Score
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameOver;