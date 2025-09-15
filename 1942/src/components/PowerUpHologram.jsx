import React, { useEffect, useState } from 'react';
import './PowerUpHologram.css';

const PowerUpHologram = ({ message, x, y, type }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationClass, setAnimationClass] = useState('enter');

  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setAnimationClass('exit');
    }, 1500); // Start exit animation after 1.5 seconds

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // Remove from DOM after 2 seconds (0.5s exit animation + 1.5s display)

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`powerup-hologram ${type} ${animationClass}`}
      style={{ left: x, top: y }}
    >
      {message}
    </div>
  );
};

export default PowerUpHologram;
