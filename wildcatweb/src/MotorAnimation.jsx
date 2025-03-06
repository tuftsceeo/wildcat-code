/**
 * @file MotorAnimation.jsx
 * @description Animated visualization of a motor with configurable direction, speed, and port.
 * @author Jennifer Cross with support from Claude
 */

import React from "react";
import styles from "./MotorAnimation.module.css";
import { validateSpeed, getSpeedDescription } from "./motorSpeedUtils";

/**
 * Animated visualization of a motor
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.speed - Speed value (-1000 to 1000)
 * @param {boolean} props.active - Whether the animation is active
 * @param {string} props.port - Motor port identifier
 * @returns {JSX.Element} Animated motor visualization
 */
const MotorAnimation = ({ speed = 0, active = true, port = "A" }) => {
    // Validate the speed value
    const validatedSpeed = validateSpeed(speed);

    // Get speed description to determine animation properties
    const { level, direction } = getSpeedDescription(validatedSpeed);

    // Calculate animation duration based on speed level
    const getAnimationDuration = () => {
        if (validatedSpeed === 0) return "0s"; // No animation when stopped

        switch (level) {
            case "slow":
                return "3s";
            case "medium":
                return "2s";
            case "fast":
                return "1s";
            default:
                return "0s";
        }
    };

    // Set direction and animation properties
    const animationDuration = getAnimationDuration();
    const isClockwise = direction === "forward";

    // Don't animate if speed is 0 or component is inactive
    const shouldAnimate = active && validatedSpeed !== 0;

    // CSS classes for animation
    const rotorClasses = [
        styles.motorRotor,
        shouldAnimate
            ? isClockwise
                ? styles.clockwise
                : styles.counterclockwise
            : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={styles.motorAnimation}>
            {/* Static border */}
            <svg
                className={styles.motorBorder}
                viewBox="0 0 100 100"
            >
                <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="var(--color-neon-green)"
                    strokeWidth="2"
                />
            </svg>

            {/* Rotating motor center */}
            <svg
                className={rotorClasses}
                style={{ animationDuration }}
                viewBox="0 0 100 100"
            >
                {/* Motor pattern circles */}
                <circle
                    cx="50"
                    cy="25"
                    r="8"
                    fill="var(--color-neon-green)"
                />
                <circle
                    cx="75"
                    cy="50"
                    r="8"
                    fill="var(--color-neon-green)"
                />
                <circle
                    cx="50"
                    cy="75"
                    r="8"
                    fill="var(--color-neon-green)"
                />
                <circle
                    cx="25"
                    cy="50"
                    r="8"
                    fill="var(--color-neon-green)"
                />

                {/* Center hub */}
                <circle
                    cx="50"
                    cy="50"
                    r="10"
                    fill="var(--color-neon-green)"
                />
            </svg>

            {/* Status overlay - shows speed with glow effect */}
            <div className={styles.statusOverlay}>
                <div
                    className={`${styles.glowEffect} ${
                        level === "fast"
                            ? styles.fastGlow
                            : level === "medium"
                            ? styles.mediumGlow
                            : level === "slow"
                            ? styles.slowGlow
                            : ""
                    }`}
                />
            </div>
        </div>
    );
};

export default MotorAnimation;
