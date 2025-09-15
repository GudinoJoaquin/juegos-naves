import React from 'react';
import './CockpitHUD.css';

const CockpitHUD = ({ hp, maxHp, score, level, wave, totalWaves, enemiesLeft, activePowerUpType, powerUpTimer, bossActive }) => {
  const formatTime = (ms) => {
    if (!ms || ms < 0) return "";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <>
      {activePowerUpType && (
        <div className="active-powerup-hud">
          <span className="powerup-text">{activePowerUpType} ACTIVE!</span> <span className="powerup-timer">({formatTime(powerUpTimer)})</span>
        </div>
      )}
      <div className="cockpit-hud">
        <div className="hud-section">
          <span className="hud-label">HP:</span>
          <span className="hud-value">{hp}/{maxHp}</span>
        </div>
        <div className="hud-section">
          <span className="hud-label">Score:</span>
          <span className="hud-value">{score}</span>
        </div>
        <div className="hud-section">
          <span className="hud-label">Level:</span>
          <span className="hud-value">{level}</span>
        </div>
        <div className="hud-section">
          <span className="hud-label">Wave:</span>
          <span className="hud-value">{wave}/{totalWaves}</span>
        </div>
        <div className="hud-section">
          <span className="hud-label">Enemies Left:</span>
          <span className="hud-value">{enemiesLeft}</span>
        </div>
        {bossActive && (
          <div className="hud-section boss-active">
            <span className="hud-label">BOSS:</span>
            <span className="hud-value">ACTIVE!</span>
          </div>
        )}
      </div>
    </>
  );
};

export default CockpitHUD;
