import React, { useRef, useEffect, useState } from 'react';
import { GameLoop } from '../classes/core/GameLoop.js';
import { InputHandler } from '../classes/player/InputHandler.js';
import UpgradeMenu from '../components/UpgradeMenu.jsx';
import GameOver from '../components/GameOver.jsx';

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

function Home({ playerName }) {
    const canvasRef = useRef(null);
    const gameLoopRef = useRef(null);
    const assetsRef = useRef(null);

    const [gameState, setGameState] = useState('loading');
    const [playerStats, setPlayerStats] = useState({});
    const [upgradeOptions, setUpgradeOptions] = useState([]);
    const [selectedUpgradeIndex, setSelectedUpgradeIndex] = useState(0);
    const [gameStats, setGameStats] = useState({});
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    const updateUpgradeMenuData = (stats, options, selectedIndex, newGameStats) => {
        setPlayerStats(stats);
        setUpgradeOptions(options);
        setSelectedUpgradeIndex(selectedIndex);
        setGameStats(newGameStats);
    };

    const handleUpgrade = (upgrade) => {
        if (gameLoopRef.current) {
            if (gameState === 'initialUpgrade') {
                gameLoopRef.current.startGame(upgrade);
            } else {
                gameLoopRef.current.applyUpgrade(upgrade);
            }
        }
    };

    const handleRestart = () => {
        window.location.reload();
    };

    useEffect(() => {
        loadAssets().then(assets => {
            assetsRef.current = assets;
            setAssetsLoaded(true);
        }).catch(error => {
            console.error("No se pudieron cargar los assets del juego:", error);
            setGameState('gameOver');
        });
    }, []);

    useEffect(() => {
        if (!assetsLoaded) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        const inputHandler = new InputHandler();
        const gameLoop = new GameLoop(
            canvas,
            inputHandler,
            assetsRef.current,
            setGameState,
            updateUpgradeMenuData,
            playerName
        );
        gameLoopRef.current = gameLoop;
        gameLoop.start();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (gameLoopRef.current) {
                gameLoopRef.current.stop();
                gameLoopRef.current = null;
            }
        };
    }, [assetsLoaded, playerName]);

    useEffect(() => {
        if (!gameLoopRef.current) return;

        if (gameState === 'playing') {
            gameLoopRef.current.resume();
        } else if (gameState === 'upgradeMenu' || gameState === 'initialUpgrade' || gameState === 'loading') {
            gameLoopRef.current.pause();
        } else if (gameState === 'gameOver') {
            gameLoopRef.current.stop();
        }

    }, [gameState]);

    return (
        <div className="game-container">
            <canvas ref={canvasRef} style={{ display: 'block' }} />
            {gameState === 'loading' && <div className="loading-screen"><h1>Cargando...</h1></div>}
            {(gameState === 'initialUpgrade' || gameState === 'upgradeMenu') && 
                <UpgradeMenu 
                    playerStats={playerStats}
                    upgradeOptions={upgradeOptions}
                    currentLevel={gameStats.level || 1}
                    gameStats={gameStats}
                    onSelectUpgrade={setSelectedUpgradeIndex}
                    selectedUpgradeIndex={selectedUpgradeIndex}
                    onConfirmUpgrade={() => handleUpgrade(upgradeOptions[selectedUpgradeIndex])}
                />}
            {gameState === 'gameOver' && <GameOver score={gameStats.score} onRestart={handleRestart} />}
        </div>
    );
}

export default Home;