import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameLoop } from '../classes/core/GameLoop.js';
import { InputHandler } from '../classes/player/InputHandler.js';
import UpgradeMenu from '../components/UpgradeMenu.jsx';

const assetConfig = {
    playerAssault: { path: '/assets/Player/Assault/1/', frames: 5 },
    playerLaser: { path: '/assets/Player/Laser/1/', frames: 5 },
    playerTank: { path: '/assets/Player/Tank/1/', frames: 5 },
    enemyKamikaze: { path: '/assets/Enemy/kamikaze/', frames: 5 },
    enemyAssault: { path: '/assets/Enemy/assault/', frames: 5 },
    enemyBoss: { path: '/assets/Enemy/boss/', frames: 5 },
    enemyTank: { path: '/assets/Enemy/tank/', frames: 5 },
    enemyLaser: { path: '/assets/Enemy/laser/', frames: 5 },
    destruction: { path: '/assets/general/destroy/', frames: 9 },
    playerShot: { path: '/assets/Player/Assault/shot/', frames: 2 },
};

async function loadAssets() {
    const loadedAssets = {};
    const promises = [];
    for (const [name, config] of Object.entries(assetConfig)) {
        if (config.frames > 1) {
            loadedAssets[name] = [];
            for (let i = 1; i <= config.frames; i++) {
                const path = `${config.path}${i}.png`;
                promises.push(
                    new Promise((resolve, reject) => {
                        const img = new Image();
                        img.src = path;
                        img.onload = () => {
                            loadedAssets[name][i - 1] = img;
                            resolve();
                        };
                        img.onerror = () => reject(`Error cargando ${path}`);
                    })
                );
            }
        }
    }
    await Promise.all(promises);
    return loadedAssets;
}

function generateUpgradeOptions(level = 1) {
    const options = [];
    const availableUpgrades = [
        { type: 'hp', description: 'Aumentar HP Máximo', apply: (player, value) => player.maxHp += value },
        { type: 'speed', description: 'Aumentar Velocidad de Nave', apply: (player, value) => player.speed += value },
        { type: 'bulletDamage', description: 'Aumentar Daño de Bala', apply: (player, value) => player.bulletDamage += value },
        { type: 'fireRate', description: 'Reducir Enfriamiento de Disparo', apply: (player, value) => player.shotCooldown = Math.max(50, player.shotCooldown - value) },
        { type: 'projectileSpeed', description: 'Aumentar Velocidad de Proyectil', apply: (player, value) => player.projectileSpeed += value },
    ];
    const levelMultiplier = 1 + (level - 1) * 0.1;
    const chosenUpgradeTypes = [];
    while (chosenUpgradeTypes.length < 3 && chosenUpgradeTypes.length < availableUpgrades.length) {
        const randomIndex = Math.floor(Math.random() * availableUpgrades.length);
        const chosen = availableUpgrades[randomIndex];
        if (!chosenUpgradeTypes.some(u => u.type === chosen.type)) {
            chosenUpgradeTypes.push(chosen);
        }
    }
    chosenUpgradeTypes.forEach(upgradeType => {
        let value;
        let description;
        switch (upgradeType.type) {
            case 'hp':
                value = Math.floor(20 * levelMultiplier);
                description = `Aumentar HP Máximo en ${value}`;
                break;
            case 'speed':
                value = 0.5 * levelMultiplier;
                description = `Aumentar Velocidad de Nave en ${value.toFixed(1)}`;
                break;
            case 'bulletDamage':
                value = Math.floor(5 * levelMultiplier);
                description = `Aumentar Daño de Bala en ${value}`;
                break;
            case 'fireRate':
                value = Math.floor(20 * levelMultiplier);
                description = `Reducir Enfriamiento de Disparo en ${value}ms`;
                break;
            case 'projectileSpeed':
                value = Math.floor(2 * levelMultiplier);
                description = `Aumentar Velocidad de Proyectil en ${value}`;
                break;
            default:
                value = 0;
                description = 'Mejora Desconocida';
        }
        options.push({ ...upgradeType, value, description });
    });
    return options;
}

function Home({ playerName }) {
    const canvasRef = useRef(null);
    const gameLoopRef = useRef(null);
    const assetsRef = useRef(null);
    const initialUpgradeRef = useRef(null);

    const [gameState, setGameState] = useState('loading');
    const [playerStats, setPlayerStats] = useState({});
    const [upgradeOptions, setUpgradeOptions] = useState([]);
    const [selectedUpgradeIndex, setSelectedUpgradeIndex] = useState(0);
    const [gameStats, setGameStats] = useState({});

    const updateGameState = useCallback((newState) => setGameState(newState), []);

    const updateUpgradeMenuData = useCallback((stats, options, selectedIndex, newGameStats) => {
        setPlayerStats(stats);
        setUpgradeOptions(options);
        setSelectedUpgradeIndex(selectedIndex);
        setGameStats(newGameStats);
    }, []);

    const handleInitialUpgrade = useCallback((upgrade) => {
        initialUpgradeRef.current = upgrade;
        setGameState('playing');
    }, []);

    const handleInGameUpgrade = useCallback((upgrade) => {
        if (gameLoopRef.current) {
            gameLoopRef.current.applyUpgrade(upgrade);
        }
    }, []);

    useEffect(() => {
        loadAssets().then(assets => {
            assetsRef.current = assets;
            const initialPlayerStats = { hp: 100, maxHp: 100, speed: 7, bulletDamage: 10, shotCooldown: 200, projectileSpeed: 15 };
            setPlayerStats(initialPlayerStats);
            setUpgradeOptions(generateUpgradeOptions(1));
            setSelectedUpgradeIndex(0);
            setGameState('initialUpgrade');
        }).catch(error => {
            console.error("No se pudieron cargar los assets del juego:", error);
            setGameState('gameOver');
        });
    }, []);

    useEffect(() => {
        if (gameState === 'playing' && !gameLoopRef.current) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const handleResize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            };
            window.addEventListener('resize', handleResize);
            handleResize();

            const inputHandler = new InputHandler();
            gameLoopRef.current = new GameLoop(
                canvas,
                inputHandler,
                assetsRef.current,
                updateGameState,
                updateUpgradeMenuData,
                playerName,
                initialUpgradeRef.current
            );
            gameLoopRef.current.start();

            return () => {
                window.removeEventListener('resize', handleResize);
                gameLoopRef.current?.stop();
                gameLoopRef.current = null;
            };
        } else if (gameState === 'upgradeMenu') {
            gameLoopRef.current?.pause();
        }
    }, [gameState, playerName, updateGameState, updateUpgradeMenuData]);

    const renderContent = () => {
        switch (gameState) {
            case 'loading':
                return <div className="loading-screen"><h1>Cargando...</h1></div>;
            case 'initialUpgrade':
                return <UpgradeMenu 
                    playerStats={playerStats}
                    upgradeOptions={upgradeOptions}
                    currentLevel={1}
                    gameStats={{ score: 0, level: 1, enemiesDestroyed: 0, powerUpsCollected: 0, totalGameTime: 0 }}
                    onSelectUpgrade={setSelectedUpgradeIndex}
                    selectedUpgradeIndex={selectedUpgradeIndex}
                    onConfirmUpgrade={() => handleInitialUpgrade(upgradeOptions[selectedUpgradeIndex])}
                />;
            case 'upgradeMenu':
                return <UpgradeMenu 
                    playerStats={playerStats}
                    upgradeOptions={upgradeOptions}
                    currentLevel={gameStats.level}
                    gameStats={gameStats}
                    onSelectUpgrade={setSelectedUpgradeIndex}
                    selectedUpgradeIndex={selectedUpgradeIndex}
                    onConfirmUpgrade={() => handleInGameUpgrade(upgradeOptions[selectedUpgradeIndex])}
                />;
            case 'playing':
            case 'gameOver':
                return <canvas ref={canvasRef} style={{ display: 'block' }} />;
            default:
                return null;
        }
    };

    return (
        <div className="game-container">
            {renderContent()}
        </div>
    );
}

export default Home;
