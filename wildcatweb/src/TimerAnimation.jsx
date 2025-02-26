// TimerAnimation.jsx
import React from "react";
import styles from "./CodingTrack.module.css"; // Still using the original CSS

/**
 * Visualization for a timer instruction
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.seconds - Duration in seconds
 * @param {boolean} props.active - Whether the animation is active
 * @returns {JSX.Element} Timer visualization
 */
const TimerAnimation = ({ seconds = 3, active = true }) => {
    return (
        <div className={styles.timerVisualization}>
            <div className={styles.timerIcon}>⏱️</div>
            <div className={styles.timerValue}>{seconds}</div>
            <div className={styles.timerUnit}>SECONDS</div>
        </div>
    );
};

export default TimerAnimation;
