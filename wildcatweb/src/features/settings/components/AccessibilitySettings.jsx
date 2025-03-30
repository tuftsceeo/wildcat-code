/**
 * @file AccessibilitySettings.jsx
 * @description Settings panel for accessibility controls including animation and sound preferences.
 * @author Jennifer Cross with support from Claude
 */

import React, { useRef } from "react";
import { Volume2, VolumeX, Zap, ZapOff, Play, StopCircle } from "lucide-react";
import { useCustomization } from "../../../context/CustomizationContext";
import styles from "../styles/AccessibilitySettings.module.css";

// Import sound effects
import bubbleSound from "../../../assets/sounds/click.mp3";
import dialSound from "../../../assets/sounds/dial.mp3";
import popSound from "../../../assets/sounds/close.mp3";
import bloopSound from "../../../assets/sounds/success.mp3";
import voopSound from "../../../assets/sounds/error.mp3";

const AccessibilitySettings = () => {
    const {
        volume,
        setVolume,
        reduceSound,
        setReduceSound,
    } = useCustomization();

    // State for animation and sound preferences
    const [reduceMotion, setReduceMotion] = React.useState(false);
    const [playingSound, setPlayingSound] = React.useState(null);

    // Audio refs for sound effects
    const bubbleAudio = useRef(new Audio(bubbleSound));
    const dialAudio = useRef(new Audio(dialSound));
    const popAudio = useRef(new Audio(popSound));
    const bloopAudio = useRef(new Audio(bloopSound));
    const voopAudio = useRef(new Audio(voopSound));

    // Effect to apply motion reduction
    React.useEffect(() => {
        document.body.dataset.reduceMotion = reduceMotion;
    }, [reduceMotion]);

    // Effect to update volume on all sound effects
    React.useEffect(() => {
        const sounds = [bubbleAudio, dialAudio, popAudio, bloopAudio, voopAudio];
        sounds.forEach(sound => {
            sound.current.volume = volume / 100;
        });
    }, [volume]);

    // Function to play sound effect
    const playSound = (soundRef, isLongSound = false) => {
        if (reduceSound) return;
        
        // If a sound is already playing, stop it
        if (playingSound) {
            playingSound.current.pause();
            playingSound.current.currentTime = 0;
        }
        
        // Reset the new sound to start
        soundRef.current.currentTime = 0;
        soundRef.current.play().catch(error => {
            console.warn("Error playing sound:", error);
        });
        
        setPlayingSound(isLongSound ? soundRef : null);
    };

    // Function to stop long sounds
    const stopSound = () => {
        if (playingSound) {
            playingSound.current.pause();
            playingSound.current.currentTime = 0;
            setPlayingSound(null);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Accessibility Settings</h2>
            
            {/* Animation Controls */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Animation Controls</h3>
                
                <div className={styles.setting}>
                    <label className={styles.label}>
                        <input
                            type="checkbox"
                            checked={reduceMotion}
                            onChange={(e) => setReduceMotion(e.target.checked)}
                            className={styles.checkbox}
                        />
                        Reduce Motion
                    </label>
                    <p className={styles.description}>
                        Disables or reduces animations and transitions
                    </p>
                </div>
            </section>

            {/* Sound Controls */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Sound Controls</h3>
                
                <div className={styles.setting}>
                    <label className={styles.label}>
                        <input
                            type="checkbox"
                            checked={reduceSound}
                            onChange={(e) => setReduceSound(e.target.checked)}
                            className={styles.checkbox}
                        />
                        Reduce Sound Effects
                    </label>
                    <p className={styles.description}>
                        Disables or reduces sound effects
                    </p>
                </div>

                <div className={styles.setting}>
                    <label className={styles.label}>
                        Sound Effects Volume
                        <div className={styles.volumeControl}>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className={styles.range}
                                disabled={reduceSound}
                            />
                            <span className={styles.volumeValue}>{volume}%</span>
                        </div>
                    </label>
                </div>

                {/* Sound Effect Preview */}
                <div className={styles.soundPreview}>
                    <h4 className={styles.previewTitle}>Preview Sound Effects</h4>
                    
                    {/* Interactive Elements */}
                    <div className={styles.soundCategory}>
                        <h5 className={styles.categoryTitle}>Interactive Elements</h5>
                        <div className={styles.previewButtons}>
                            <button
                                className={styles.previewButton}
                                onClick={() => playSound(bubbleAudio)}
                                disabled={reduceSound}
                            >
                                <Play size={16} />
                                Click (High)
                            </button>
                            <button
                                className={styles.previewButton}
                                onClick={() => playSound(popAudio)}
                                disabled={reduceSound}
                            >
                                <Play size={16} />
                                Click (Low)
                            </button>
                        </div>
                    </div>

                    {/* Adjustments */}
                    <div className={styles.soundCategory}>
                        <h5 className={styles.categoryTitle}>Adjustments</h5>
                        <div className={styles.previewButtons}>
                            <button
                                className={styles.previewButton}
                                onClick={() => playSound(dialAudio, true)}
                                disabled={reduceSound}
                            >
                                <Play size={16} />
                                Dial/Slider
                            </button>
                            {playingSound === dialAudio && (
                                <button
                                    className={`${styles.previewButton} ${styles.stopButton}`}
                                    onClick={stopSound}
                                    disabled={reduceSound}
                                >
                                    <StopCircle size={16} />
                                    Stop
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className={styles.soundCategory}>
                        <h5 className={styles.categoryTitle}>Feedback</h5>
                        <div className={styles.previewButtons}>
                            <button
                                className={styles.previewButton}
                                onClick={() => playSound(bloopAudio)}
                                disabled={reduceSound}
                            >
                                <Play size={16} />
                                Success
                            </button>
                            <button
                                className={styles.previewButton}
                                onClick={() => playSound(voopAudio, true)}
                                disabled={reduceSound}
                            >
                                <Play size={16} />
                                Error
                            </button>
                            {playingSound === voopAudio && (
                                <button
                                    className={`${styles.previewButton} ${styles.stopButton}`}
                                    onClick={stopSound}
                                    disabled={reduceSound}
                                >
                                    <StopCircle size={16} />
                                    Stop
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AccessibilitySettings; 