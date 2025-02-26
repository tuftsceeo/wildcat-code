// MotorAnimation.jsx
import React from "react";
import styles from "./CodingTrack.module.css"; // Still using the original CSS
import {
    getSpeedClass,
    getAnimationDuration,
} from "./InstructionDescriptionGenerator";

/**
 * Animated visualization of a motor
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.direction - Direction of rotation ('forward' or 'backward')
 * @param {string|number} props.speed - Speed setting (string: 'slow', 'medium', 'fast' or number: 0-10000)
 * @param {boolean} props.active - Whether the animation is active
 * @param {string} props.port - Motor port identifier
 * @returns {JSX.Element} Animated motor visualization
 */
const MotorAnimation = ({
    direction = "forward",
    speed = "fast",
    active = true,
    port = "A",
}) => {
    // Handle speed as either a string or a number
    let speedClass = typeof speed === "string" ? speed : getSpeedClass(speed);

    // Calculate animation duration based on speed
    const animationDuration = getAnimationDuration(speedClass);

    // Set direction and animation properties
    const rotation =
        direction === "forward" ? styles.clockwise : styles.counterclockwise;

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
                className={`${styles.motorRotor} ${active ? rotation : ""}`}
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
        </div>
    );
};

export default MotorAnimation;
