/**
 * @file MotorVisualization.jsx
 * @description Visual representation of motor speed using vertical bars and animal icons,
 * designed for students with varied learning needs including those with autism.
 */

import React from "react";
import styles from "../styles/MotorVisualization.module.css";
import { validateSpeed, getSpeedDescription } from "./motorSpeedUtils";
import {
    Rabbit,
    Turtle,
    CircleStop,
    ArrowLeft,
    ArrowRight,
    MoveLeft,
    MoveRight,
} from "lucide-react";

 const FilledCircleStop = (props) => {
        return React.cloneElement(<CircleStop />, { fill: "currentColor", ...props });
      };

/**
 * Motor visualization component with vertical bars and animal icons
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object|Array} props.configuration - Motor configuration
 * @param {boolean} props.showLabels - Whether to show text labels (for accessibility)
 * @returns {JSX.Element} Visual representation of motor speed/direction
 */
const MotorVisualization = ({ configuration, showLabels = true }) => {
    // Handle empty configuration case
    if (!configuration) {
        return null;
    }

    // Handle different configuration formats
    const configs = Array.isArray(configuration)
        ? configuration
        : [configuration];

    // Only show for valid motor configuration
    if (configs.length === 0 || !configs.some((c) => c && c.port)) {
        return null;
    }

    return (
        <div className={styles.motorVisualizationContainer}>
            {configs.map((config, index) =>
                config && config.port ? (
                    <SingleMotorVisualization
                        key={`motor-${config.port || index}`}
                        config={config}
                        showLabels={showLabels}
                    />
                ) : null,
            )}
        </div>
    );
};

/**
 * Single motor visualization component
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.config - Motor configuration
 * @param {boolean} props.showLabels - Whether to show text labels
 * @returns {JSX.Element} Single motor visualization
 */
const SingleMotorVisualization = ({ config, showLabels }) => {
    if (!config || !config.port) {
        return null;
    }

    // Extract relevant information from configuration
    const { port = "A" } = config;
    const speed = validateSpeed(config.speed || 0);

    // Get speed information
    const { level, direction } = getSpeedDescription(speed);

    // Calculate which bars should be active and their colors
    const getBarStatus = () => {
        const barStatus = [];

        // We'll have 8 bars total (4 for each direction)
        for (let i = 0; i < 8; i++) {
            // Bars 0-3 are countercw (yellow), bars 4-7 are clockwise (green)
            const isClockwise = i >= 4;
            const intensityLevel = isClockwise ? i - 4 : 3 - i;

            // Determine if this bar should be active based on speed and direction
            let isActive = false;

            if (speed === 0) {
                // When stopped, only middle bars are slightly active
                isActive = i === 3 || i === 4;
            } else if (direction === "clockwise" && isClockwise) {
                // Clockwise motion - light up appropriate green bars
                if (level === "slow" && intensityLevel <= 0) isActive = true;
                else if (level === "medium" && intensityLevel <= 1)
                    isActive = true;
                else if (level === "fast" && intensityLevel <= 2)
                    isActive = true;
            } else if (direction === "countercw" && !isClockwise) {
                // Counterclockwise motion - light up appropriate yellow bars
                if (level === "slow" && intensityLevel <= 0) isActive = true;
                else if (level === "medium" && intensityLevel <= 1)
                    isActive = true;
                else if (level === "fast" && intensityLevel <= 2)
                    isActive = true;
            }

            // Add this bar's status to our array
            barStatus.push({
                isActive,
                isClockwise,
                intensityLevel,
                className: isClockwise ? styles.clockwiseBar : styles.countercwBar,
            });
        }

        return barStatus;
    };

    // Calculate slider position (0-100%)
    const getSliderPosition = () => {
        if (speed === 0) return 50; // Center
        if (direction === "countercw") {
            return speed === -330 ? 30 : speed === -660 ? 20 : 10; // Slow, Medium, Fast countercw
        } else {
            return speed === 330 ? 70 : speed === 660 ? 80 : 90; // Slow, Medium, Fast clockwise
        }
    };

    // Get all bar statuses
    const bars = getBarStatus();
    const sliderPosition = getSliderPosition();

    return (
        <div className={styles.motorVisualization}>
            {/* Motor title */}
            <div className={styles.motorTitle}>MOTOR {port}</div>

            {/* Bar graph visualization */}
            <div className={styles.barGraph}>
                {bars.map((bar, index) => (
                    <div
                        key={index}
                        className={`${styles.bar} ${bar.className} ${
                            bar.isActive ? styles.active : ""
                        }`}
                        style={{
                            /* Height varies by intensity level */
                            height: `${55 + bar.intensityLevel * 15}%`,
                            /* More intense bars are slightly wider */
                            width: `${10 + bar.intensityLevel * 2}px`,
                            /* Opacity based on activity and level */
                            opacity: bar.isActive
                                ? 0.7 + bar.intensityLevel * 0.1
                                : 0.2,
                        }}
                    />
                ))}
            </div>

            {/* Slider indicator */}
            <div className={styles.sliderContainer}>
                <div className={styles.sliderTrack}>
                    <div
                        className={styles.sliderThumb}
                        style={{ left: `${sliderPosition}%` }}
                    />
                </div>
            </div>

            {/* Animal icons for direction and speed */}
            <div className={styles.animalIcons}>
                {/* Fast Counterclockwise (Rabbit) */}
                <div
                    className={`${styles.animalIcon} ${
                        direction === "countercw" && level === "fast"
                            ? styles.active
                            : ""
                    }`}
                >
                    <Rabbit
                        className={styles.flippedHorizontally}
                        size={24}
                    />
                </div>

                {/* Medium Counterclockwise (Arrow) */}
                <div
                    className={`${styles.animalIcon} ${
                        direction === "countercw" && level === "medium"
                            ? styles.active
                            : ""
                    }`}
                >
                    <MoveLeft size={24} />
                </div>

                {/* Slow Counterclockwise (Turtle) */}
                <div
                    className={`${styles.animalIcon} ${
                        direction === "countercw" && level === "slow"
                            ? styles.active
                            : ""
                    }`}
                >
                    <Turtle
                        className={styles.flippedHorizontally}
                        size={24}
                    />
                </div>

                {/* Stop (CircleStop) */}
                <div
    className={`${styles.animalIcon} ${
        speed === 0 ? styles.active : ""
    }`}
>
    <CircleStop 
        size={20} 
        color="var(--color-error-main)" 
    />
</div>
                {/* Slow Clockwise (Turtle) */}
                <div
                    className={`${styles.animalIcon} ${
                        direction === "clockwise" && level === "slow"
                            ? styles.active
                            : ""
                    }`}
                >
                    <Turtle size={24} />
                </div>

                {/* Medium Clockwise (Arrow) */}
                <div
                    className={`${styles.animalIcon} ${
                        direction === "clockwise" && level === "medium"
                            ? styles.active
                            : ""
                    }`}
                >
                    <MoveRight size={24} />
                </div>

                {/* Fast Clockwise (Rabbit) */}
                <div
                    className={`${styles.animalIcon} ${
                        direction === "clockwise" && level === "fast"
                            ? styles.active
                            : ""
                    }`}
                >
                    <Rabbit size={24} />
                </div>
            </div>

            {/* Speed and direction text (only shown when labels are enabled) */}
            {showLabels && (
                <div className={styles.speedLabel}>
                    {speed === 0 ? "Stop" : `${level} ${direction}`}
                </div>
            )}
        </div>
    );
};

export default MotorVisualization;
