import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import './UpgradeMenu.css'; // Import the new CSS file

const UpgradeMenu = ({ playerStats, upgradeOptions, onSelectUpgrade, selectedUpgradeIndex, onConfirmUpgrade, gameStats }) => {
    // Ship sprite animation state
    const [shipFrame, setShipFrame] = useState(1);
    const totalShipFrames = 5; // Assuming 1.png to 5.png

    useEffect(() => {
        const interval = setInterval(() => {
            setShipFrame(prevFrame => (prevFrame % totalShipFrames) + 1);
        }, 150); // Change frame every 150ms for animation speed
        return () => clearInterval(interval);
    }, []);

    const getUpgradeEffectDescription = (option) => {
        // This is a placeholder. In a real scenario, you'd have a more sophisticated way
        // to describe the effect, possibly based on the 'type' and 'value' of the upgrade.
        switch (option.type) {
            case 'hp': return `Aumenta tu salud máxima en ${option.value} puntos.`;
            case 'speed': return `Incrementa la velocidad de tu nave en ${option.value.toFixed(1)} unidades.`;
            case 'bulletDamage': return `Aumenta el daño de tus balas en ${option.value} puntos.`;
            case 'fireRate': return `Reduce el tiempo de enfriamiento de disparo en ${option.value}ms.`;
            case 'projectileSpeed': return `Aumenta la velocidad de tus proyectiles en ${option.value} unidades.`;
            default: return 'Mejora el rendimiento de tu nave.';
        }
    };

    const getProjectedStats = () => {
        if (selectedUpgradeIndex === null || !upgradeOptions[selectedUpgradeIndex]) {
            return playerStats;
        }

        const selectedOption = upgradeOptions[selectedUpgradeIndex];
        const newStats = { ...playerStats };

        switch (selectedOption.type) {
            case 'hp':
                newStats.maxHp = (newStats.maxHp || 0) + selectedOption.value;
                newStats.hp = (newStats.hp || 0) + selectedOption.value; // Assuming current HP also increases
                break;
            case 'speed':
                newStats.speed = (newStats.speed || 0) + selectedOption.value;
                break;
            case 'bulletDamage':
                newStats.bulletDamage = (newStats.bulletDamage || 0) + selectedOption.value;
                break;
            case 'fireRate':
                newStats.shotCooldown = Math.max(0, (newStats.shotCooldown || 0) - selectedOption.value); // Reduce cooldown
                break;
            case 'projectileSpeed':
                newStats.projectileSpeed = (newStats.projectileSpeed || 0) + selectedOption.value;
                break;
            default:
                break;
        }
        return newStats;
    };

    const projectedStats = getProjectedStats();

    const renderStat = (label, currentVal, projectedVal, type) => {
        const isUpgraded = selectedUpgradeIndex !== null && upgradeOptions[selectedUpgradeIndex]?.type === type;
        const displayCurrent = type === 'speed' ? currentVal?.toFixed(1) : currentVal;
        const displayProjected = type === 'speed' ? projectedVal?.toFixed(1) : projectedVal;

        return (
            <p className="stat-item">
                {label}: <span className={`stat-current ${isUpgraded ? 'stat-line-through' : ''}`}>{displayCurrent || 'N/A'}</span>
                {isUpgraded && (
                    <span className="stat-projected">{'->'} {displayProjected || 'N/A'}</span>
                )}
            </p>
        );
    };

    return (
        <div className="upgrade-menu-container">
            <h1 className="upgrade-menu-title">¡Elige tu Mejora!</h1>

            <div className="upgrade-content-area">
                {/* Player Stats (Left) */}
                <div className="player-stats-panel">
                    <h2>Tus Estadísticas:</h2>
                    {renderStat('HP', `${playerStats.hp}/${playerStats.maxHp}`, `${projectedStats.hp}/${projectedStats.maxHp}`, 'hp')}
                    {renderStat('Velocidad', playerStats.speed, projectedStats.speed, 'speed')}
                    {renderStat('Daño Bala', playerStats.bulletDamage, projectedStats.bulletDamage, 'bulletDamage')}
                    {renderStat('Cadencia', `${playerStats.shotCooldown}ms`, `${projectedStats.shotCooldown}ms`, 'fireRate')}
                    {renderStat('Vel. Proyectil', playerStats.projectileSpeed, projectedStats.projectileSpeed, 'projectileSpeed')}
                </div>

                {/* Player Ship Animation (Center) */}
                <div className="player-ship-hologram">
                    <img src={`/assets/Player/Assault/1/${shipFrame}.png`} alt="Player Ship" />
                    <div className="player-ship-hologram-border"></div>
                </div>

                {/* Player Stats (Right) - Placeholder or duplicate for visual balance */}
                <div className="player-stats-panel">
                    <h2>Estadísticas Adicionales:</h2>
                    <p className="stat-item">Puntuación: <span className="stat-current">{gameStats.score}</span></p>
                    <p className="stat-item">Nivel: <span className="stat-current">{gameStats.level}</span></p>
                    <p className="stat-item">Enemigos Destruidos: <span className="stat-current">{gameStats.enemiesDestroyed}</span></p>
                    <p className="stat-item">Tiempo de Juego: <span className="stat-current">{Math.floor(gameStats.totalGameTime / 1000)}s</span></p>
                    <p className="stat-item">Power-ups Recogidos: <span className="stat-current">{gameStats.powerUpsCollected}</span></p>
                </div>
            </div>

            {/* Upgrade Cards (Bottom) */}
            <div className="upgrade-cards-container">
                {upgradeOptions.map((option, index) => (
                    <div 
                        key={option.type}
                        className={`upgrade-card ${index === selectedUpgradeIndex ? 'selected' : ''}`}
                        onClick={() => onSelectUpgrade(index)}
                    >
                        <h3>{option.description}</h3>
                        {/* Removed description paragraph as per user request */}
                        {index === selectedUpgradeIndex && (
                            <div className="upgrade-card-border-animation"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Confirm Button */}
            <button 
                onClick={onConfirmUpgrade}
                className="confirm-button animate-bounce-slow"
            >
                Aceptar Mejora y Continuar
            </button>
        </div>
    );
};

export default UpgradeMenu;
