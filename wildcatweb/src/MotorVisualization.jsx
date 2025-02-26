/**
 * @file MotorVisualization.jsx
 * @description Visual representation of motor speed using animated bars,
 * providing feedback on motor configuration.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

// MotorVisualization.jsx
import React from "react";
import styles from "./FunctionDefault.module.css"; // Reusing the same CSS initially

/**
 * Visual representation of motor speed using bars
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.configuration - Motor configuration data
 * @param {number} [props.configuration.speed=5000] - Speed value (0-10000)
 * @returns {JSX.Element} Visual bars representing motor speed
 */
const MotorVisualization = ({ configuration }) => {
    // Only show for valid motor configuration
    if (!configuration) {
        return null;
    }

    // Create array of bar heights for visualization
    const bars = [70, 85, 60, 40, 20, 35, 50, 75, 90];
    const currentSpeed = configuration.speed || 5000;
    const speedPercentage = Math.min(currentSpeed / 10000, 1);
    const highlightIndex = Math.floor(speedPercentage * (bars.length - 1));

    return (
        <div className={styles.motorVisualization}>
            <div className={styles.visualizationTitle}>MOTOR A</div>
            <div className={styles.barGraph}>
                {bars.map((height, index) => (
                    <div
                        key={index}
                        className={`${styles.bar} ${
                            index > 5 ? styles.green : ""
                        } ${index === highlightIndex ? styles.highlight : ""}`}
                        style={{ height: `${height}%` }}
                    ></div>
                ))}
            </div>
            <div className={styles.speedIcons}>
                <span className={styles.speedIcon}>🐢</span>
                <span className={styles.speedIcon}>🐇</span>
            </div>
        </div>
    );
};

export default MotorVisualization;
