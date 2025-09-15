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
        if (config.type === 'single') {
            promises.push(new Promise((resolve, reject) => {
                const img = new Image();
                img.src = config.path;
                img.onload = () => {
                    loadedAssets[name] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Error cargando ${config.path}`);
                    reject(`Error cargando ${config.path}`);
                };
            }));
        } else {
            const framePromises = [];
            loadedAssets[name] = [];
            for (let i = 1; i <= config.frames; i++) {
                const path = `${config.path}${i}.png`;
                framePromises.push(
                    new Promise((resolve, reject) => {
                        const img = new Image();
                        img.src = path;
                        img.onload = () => {
                            loadedAssets[name][i - 1] = img;
                            resolve();
                        };
                        img.onerror = () => {
                            console.error(`Error cargando ${path}`);
                            reject(`Error cargando ${path}`);
                        };
                    })
                );
            }
            promises.push(...framePromises);
        }
    }

    await Promise.all(promises);
    
    
    return loadedAssets;
}

function Home({ playerName }) {
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [gameState, setGameState] = useState('loading'); // 'loading', 'playing', 'upgradeMenu', 'gameOver'
    const [playerStats, setPlayerStats] = useState({});
    const [upgradeOptions, setUpgradeOptions] = useState([]);
    const [selectedUpgradeIndex, setSelectedUpgradeIndex] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1);

    const gameLoopRef = useRef(null);

    const updateGameState = useCallback((newState) => {
        setGameState(newState);
    }, []);

    const updateUpgradeMenuData = useCallback((stats, options, selectedIndex, level) => {
        setPlayerStats(stats);
        setUpgradeOptions(options);
        setSelectedUpgradeIndex(selectedIndex);
        setCurrentLevel(level);
    }, []);

    const applyUpgradeAndResumeGame = useCallback((upgrade) => {
        if (gameLoopRef.current) {
            gameLoopRef.current.applyUpgrade(upgrade);
            setGameState('playing');
            gameLoopRef.current.resume(); // Resume the game loop
        }
    }, []);

    useEffect(() => {
        console.log(`useEffect: Current gameState is ${gameState}`);
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (gameState === 'loading') {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            async function initGame() {
                console.log('initGame: Loading assets...');
                try {
                    const assets = await loadAssets();
                    console.log('initGame: Assets loaded. Initializing GameLoop...');
                    const inputHandler = new InputHandler();
                    gameLoopRef.current = new GameLoop(canvas, inputHandler, assets, updateGameState, updateUpgradeMenuData, playerName);
                    gameLoopRef.current.start();
                    setLoading(false);
                    console.log('initGame: GameLoop initialized and started. Setting gameState to playing.');
                    setGameState('playing'); // Game starts after assets are loaded
                } catch (error) {
                    console.error("No se pudieron cargar los assets del juego:", error);
                    setLoading(false);
                    setGameState('gameOver'); // Or some error state
                }
            }
            initGame();
        } else if (gameState === 'upgradeMenu') {
            if (gameLoopRef.current) {
                gameLoopRef.current.pause(); // Pause the game loop when in upgrade menu
            }
        }

        const handleResize = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (gameLoopRef.current) {
                gameLoopRef.current.stop();
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [gameState, updateGameState, updateUpgradeMenuData, playerName]);

    return (
        <div className="game-container">
            {loading && gameState === 'loading' && <div className="loading-screen"><h1>Cargando...</h1></div>}
            {gameState === 'upgradeMenu' && (
                <UpgradeMenu 
                    playerStats={playerStats}
                    upgradeOptions={upgradeOptions}
                    currentLevel={currentLevel}
                    onSelectUpgrade={(index) => {
                        setSelectedUpgradeIndex(index);
                        // Optionally, update description based on selected index here if needed
                    }}
                    selectedUpgradeIndex={selectedUpgradeIndex}
                    onConfirmUpgrade={() => applyUpgradeAndResumeGame(upgradeOptions[selectedUpgradeIndex])}
                />
            )}
            <canvas ref={canvasRef} style={{ display: gameState === 'playing' ? 'block' : 'none' }} />
        </div>
    );
}

export default Home;
