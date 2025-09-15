import React from 'react';
import './ScoreScreen.css';

const ScoreScreen = ({ playersData, gameData, onExit }) => {
    const getShipImage = (shipType) => {
        // Asumimos una ruta estándar para la imagen de la nave.
        // Esto podría necesitar ajustarse si tus recursos están en otro lugar.
        return `/assets/Player/${shipType}/1/1.png`;
    };

    return (
        <div className="score-screen-container">
            <div className="score-screen-content">
                <h1 className="score-screen-title">Resultados de la Partida</h1>

                <div className="score-screen-body">
                    {/* Paneles de Jugadores */}
                    <div className="players-panels-container">
                        {playersData.map((player, index) => (
                            <div key={index} className="player-panel">
                                <h2 className="player-name">{player.name}</h2>
                                <div className="player-card-content">
                                    <div className="player-ship-display">
                                        <img src={getShipImage(player.shipType)} alt={`${player.shipType} ship`} />
                                        <p className="ship-type">{player.shipType}</p>
                                    </div>
                                    <div className="player-stats-list">
                                        <p><strong>Puntuación:</strong> {player.score.toLocaleString()}</p>
                                        <p><strong>HP Máx:</strong> {player.stats.maxHp}</p>
                                        <p><strong>Velocidad:</strong> {player.stats.speed.toFixed(1)}</p>
                                        <p><strong>Daño Bala:</strong> {player.stats.bulletDamage}</p>
                                        <p><strong>Cadencia:</strong> {player.stats.shotCooldown}ms</p>
                                        <p><strong>Vel. Proyectil:</strong> {player.stats.projectileSpeed}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Panel de Resumen Global */}
                    <div className="game-summary-panel">
                        <h3>Resumen Global</h3>
                        <p><strong>Nivel Alcanzado:</strong> {gameData.level}</p>
                        <p><strong>Enemigos Destruidos:</strong> {gameData.enemiesDestroyed}</p>
                        <p><strong>Power-ups Recogidos:</strong> {gameData.powerUpsCollected}</p>
                        <p><strong>Tiempo de Juego:</strong> {Math.floor(gameData.totalGameTime / 1000)}s</p>
                    </div>
                </div>

                <button className="score-screen-button animate-bounce-slow" onClick={onExit}>
                    Volver
                </button>
            </div>
        </div>
    );
};

export default ScoreScreen;