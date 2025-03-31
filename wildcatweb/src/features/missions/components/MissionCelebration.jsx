import React, { useEffect, useState, useRef } from 'react';
import styles from './MissionCelebration.module.css';
import confetti from 'canvas-confetti';
import { useCustomization } from '../../../context/CustomizationContext';
import successSound from '../../../assets/sounds/success.mp3';
import clickSound from '../../../assets/sounds/click.mp3';

const MissionCelebration = ({ onClose, missionTitle }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef(null);
  const successAudioRef = useRef(null);
  const clickAudioRef = useRef(null);
  const { volume, reduceSound } = useCustomization();

  useEffect(() => {
    // Initialize success sound
    successAudioRef.current = new Audio(successSound);
    successAudioRef.current.volume = volume / 100;

    // Initialize click sound
    clickAudioRef.current = new Audio(clickSound);
    clickAudioRef.current.volume = volume / 100;

    // Play success sound if not reduced
    if (!reduceSound) {
      successAudioRef.current.play().catch(error => {
        console.warn("Error playing success sound:", error);
      });
    }

    // Start confetti animation
    setShowConfetti(true);
    
    // Configure confetti to use our canvas
    const confettiInstance = confetti.create(confettiRef.current, {
      resize: true,
      useWorker: true
    });

    // Start confetti animation
    const duration = 3000; // 3 seconds
    const end = Date.now() + duration;
    const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00FF00', '#4169E1'];

    const frame = () => {
      confettiInstance({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors
      });
      confettiInstance({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Cleanup
    return () => {
      setShowConfetti(false);
      if (successAudioRef.current) {
        successAudioRef.current.pause();
        successAudioRef.current.currentTime = 0;
      }
      if (clickAudioRef.current) {
        clickAudioRef.current.pause();
        clickAudioRef.current.currentTime = 0;
      }
    };
  }, [volume, reduceSound]);

  const handleClose = () => {
    // Play click sound if not reduced
    if (!reduceSound && clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(error => {
        console.warn("Error playing click sound:", error);
      });
    }
    onClose();
  };

  return (
    <>
      <canvas
        ref={confettiRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10000 // Higher than the overlay's z-index of 9999
        }}
      />
      <div className={styles.celebrationOverlay}>
        <div className={styles.celebrationContent}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.celebrationTitle}>Mission Complete!</h2>
          <p className={styles.celebrationMessage}>
            Great job completing the mission: {missionTitle}
          </p>
          <button 
            className={styles.continueButton} 
            onClick={handleClose}
            aria-label="Continue to next mission"
          >
            Continue to Next Mission
          </button>
        </div>
      </div>
    </>
  );
};

export default MissionCelebration; 