import React, { useEffect, useState } from 'react';
import styles from './MissionCelebration.module.css';
import confetti from 'canvas-confetti';

const MissionCelebration = ({ onClose, missionTitle }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Play success sound
    const audio = new Audio('/assets/sounds/success.mp3');
    audio.play().catch(error => {
      console.error('Error playing success sound:', error);
    });

    // Start confetti animation
    setShowConfetti(true);
    
    // Trigger confetti burst
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiInterval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount: Math.floor(particleCount),
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
      });

      confetti({
        particleCount: Math.floor(particleCount),
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
      });
    }, 250);

    return () => {
      clearInterval(confettiInterval);
    };
  }, []);

  return (
    <div className={styles.celebrationOverlay}>
      <div className={styles.celebrationContent}>
        <div className={styles.successIcon}>🎉</div>
        <h2 className={styles.celebrationTitle}>Mission Complete!</h2>
        <p className={styles.celebrationMessage}>
          Great job completing {missionTitle}! You've successfully finished all the tasks.
        </p>
        <button 
          className={styles.continueButton}
          onClick={onClose}
        >
          Continue to Next Mission
        </button>
      </div>
    </div>
  );
};

export default MissionCelebration; 