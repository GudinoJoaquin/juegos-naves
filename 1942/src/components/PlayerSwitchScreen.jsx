import React from 'react';
import './PlayerSwitchScreen.css';

const PlayerSwitchScreen = ({ nextPlayerName, countdown }) => {
    return (
        <div className="player-switch-container">
            <div className="player-switch-content">
                <h1>Turno de: <span className="player-name">{nextPlayerName}</span></h1>
                <p className="countdown-text">Desplegando en...</p>
                <p className="countdown-timer">{countdown}</p>
            </div>
        </div>
    );
};

export default PlayerSwitchScreen;