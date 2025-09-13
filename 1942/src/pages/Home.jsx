import React, { useRef, useEffect, useState } from 'react';
import { GameLoop } from '../classes/GameLoop.js';
import { InputHandler } from '../classes/InputHandler.js';

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

function Home() {
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let gameLoop;

        async function startGame() {
            try {
                const assets = await loadAssets();
                const inputHandler = new InputHandler();
                gameLoop = new GameLoop(canvas, inputHandler, assets);
                gameLoop.start();
                setLoading(false);
            } catch (error) {
                console.error("No se pudieron cargar los assets del juego:", error);
                setLoading(false);
            }
        }

        startGame();

        const handleResize = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (gameLoop) {
                gameLoop.stop();
            }
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="game-container">
            {loading && <div className="loading-screen"><h1>Cargando...</h1></div>}
            <canvas ref={canvasRef} />
        </div>
    );
}

export default Home;