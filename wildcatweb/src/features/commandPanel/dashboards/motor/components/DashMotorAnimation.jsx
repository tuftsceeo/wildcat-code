/**
 * @file DashMotorAnimation.jsx
 * @description Specialized motor animation component for motor dashboard display.
 * Duplicated from MotorAnimation.jsx to maintain compatibility with existing code.
 * Only changes scaling and masking for dashboard context.
 * @author Jennifer Cross with support from Claude
 */

import React from "react";
import styles from "../styles/DashMotorAnimation.module.css";
import {
    validateSpeed,
    getSpeedDescription,
    getAnimationDuration,
    isClockwise
} from "../utils/motorSpeedUtils";

/**
 * Specialized motor animation for dashboard display
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.speed - Speed value (-1000 to 1000)
 * @param {boolean} props.active - Whether the animation is active
 * @param {string} props.port - Motor port identifier
 * @returns {JSX.Element} Motor animation visualization
 */
const DashMotorAnimation = ({ speed = 0, active = true, port = "A" }) => {
    // Validate the speed value
    const validatedSpeed = validateSpeed(speed);

    // Get speed description
    const { level, direction } = getSpeedDescription(validatedSpeed);

    // Calculate animation duration based on speed
    const animationDuration = getAnimationDuration(validatedSpeed);
    
    // Determine direction
    const clockwise = isClockwise(validatedSpeed);

    // CSS classes for animation
    const shouldAnimate = active && validatedSpeed !== 0;
    
    const rotorClasses = [
        styles.motorRotor,
        shouldAnimate
            ? clockwise
                ? styles.clockwise
                : styles.counterclockwise
            : "",
    ]
        .filter(Boolean)
        .join(" ");

    // Status overlay classes (showing speed with glow effect)
    const glowClasses = [
        styles.glowEffect,
        level === "fast"
            ? styles.fastGlow
            : level === "medium"
            ? styles.mediumGlow
            : level === "slow"
            ? styles.slowGlow
            : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={styles.motorAnimation}>
            {/* Static border */}
            <div className={styles.motorBorder}>
                {/* Rotating motor center */}
                <div 
                    className={rotorClasses}
                    style={{ animationDuration }}
                >
                    {/* Motor pattern circles */}
                    <div className={styles.motorPattern}>
                        <div className={`${styles.patternDot} ${styles.top}`}></div>
                        <div className={`${styles.patternDot} ${styles.right}`}></div>
                        <div className={`${styles.patternDot} ${styles.bottom}`}></div>
                        <div className={`${styles.patternDot} ${styles.left}`}></div>
                        <div className={`${styles.patternDot} ${styles.center}`}></div>
                    </div>
                </div>
            </div>

            {/* Status overlay - shows speed with glow effect */}
            <div className={styles.statusOverlay}>
                <div className={glowClasses}></div>
            </div>
        </div>
    );
};

export default DashMotorAnimation;