/**
 * @file MotorSlider.jsx
 * @description A custom slider component for controlling motor speed and direction
 * with 7 positions: fast/medium/slow countercw, stop, slow/medium/fast clockwise.
 */

import React, { useState, useRef, useEffect } from "react";
import {
    sliderPositionToSpeed,
    speedToSliderPosition,
    SPEED_PRESETS,
    validateSpeed,
} from "./motorSpeedUtils";
import {
    SkipBack,
    SkipClockwise,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
    Square, CircleStop,
} from "lucide-react";
import styles from "../styles/MotorSlider.module.css";

/**
 * Motor speed and direction slider component
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.value - Current speed value (-1000 to 1000)
 * @param {Function} props.onChange - Callback when speed changes
 * @param {boolean} props.disabled - Whether the slider is disabled
 * @returns {JSX.Element} Motor slider component
 */
const MotorSlider = ({ value = 0, onChange, disabled = false }) => {
    // Validate the initial value to ensure it's within range
    const validatedValue = validateSpeed(value);

    // Convert the initial value to a slider position (0-6)
    const [position, setPosition] = useState(
        speedToSliderPosition(validatedValue),
    );
    const sliderRef = useRef(null);

    // Update position when value changes externally
    useEffect(() => {
        setPosition(speedToSliderPosition(validateSpeed(value)));
    }, [value]);

    // Handle slider click to set position
    const handleSliderClick = (e) => {
        if (disabled) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const width = rect.width;
        const clickX = e.clientX - rect.left;

        // Calculate position (0-6) based on where the user clicked
        const newPosition = Math.min(
            6,
            Math.max(0, Math.round((clickX / width) * 6)),
        );
        setPosition(newPosition);

        // Convert position to speed value and notify parent
        const newSpeed = sliderPositionToSpeed(newPosition);
        if (onChange) {
            onChange(newSpeed);
        }
    };

    // Handle clicking on a specific position indicator
    const handlePositionClick = (newPosition) => {
        if (disabled) return;

        setPosition(newPosition);
        const newSpeed = sliderPositionToSpeed(newPosition);
        if (onChange) {
            onChange(newSpeed);
        }
    };

    // Position labels with Lucide icons
    const positionLabels = [
        { icon: <SkipBack size={16} />, label: "Fast" },
        { icon: <ChevronsLeft size={16} />, label: "Medium" },
        { icon: <ChevronLeft size={16} />, label: "Slow" },
        { icon: <CircleStop color="var(--color-error-main)" fill="var(--color-error-main)" size={14} />, label: "Stop" },
        { icon: <ChevronRight size={16} />, label: "Slow" },
        { icon: <ChevronsRight size={16} />, label: "Medium" },
        { icon: <SkipClockwise size={16} />, label: "Fast" },
    ];

    // Calculate the current speed for ARIA attributes
    const currentSpeed = sliderPositionToSpeed(position);

    return (
        <div
            className={`${styles.sliderContainer} ${
                disabled ? styles.disabled : ""
            }`}
            role="group"
            aria-label="Motor speed control"
        >
            {/* Direction labels */}
            <div className={styles.directionLabels}>
                <div className={styles.countercwLabel}>BACKWARD</div>
                <div className={styles.clockwiseLabel}>FORWARD</div>
            </div>

            {/* Slider track */}
            <div
                ref={sliderRef}
                className={styles.sliderTrack}
                onClick={handleSliderClick}
                role="slider"
                aria-valuemin={-1000}
                aria-valuemax={1000}
                aria-valuenow={currentSpeed}
                aria-valuetext={`${
                    currentSpeed === 0
                        ? "Stopped"
                        : `${
                              Math.abs(currentSpeed) <= 330
                                  ? "Slow"
                                  : Math.abs(currentSpeed) <= 660
                                  ? "Medium"
                                  : "Fast"
                          } 
          ${currentSpeed < 0 ? "Counterclockwise" : "Clockwise"}`
                }`}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
            >
                {/* Track background with gradient */}
                <div className={styles.sliderBackground}>
                    <div className={styles.countercwSection}></div>
                    <div className={styles.centerStop}></div>
                    <div className={styles.clockwiseSection}></div>
                </div>

                {/* Position indicators */}
                <div className={styles.positionIndicators}>
                    {[0, 1, 2, 3, 4, 5, 6].map((pos) => (
                        <div
                            key={pos}
                            className={`${styles.positionIndicator} ${
                                position === pos ? styles.active : ""
                            }`}
                            role="presentation"
                        />
                    ))}
                </div>

                {/* Slider thumb */}
                <div
                    className={styles.sliderThumb}
                    style={{ left: `${(position / 6) * 100}%` }}
                    role="presentation"
                />
            </div>

            {/* Position icons */}
            <div className={styles.positionIcons}>
                {positionLabels.map((pos, index) => (
                    <button
                        key={index}
                        className={`${styles.positionIcon} ${
                            position === index ? styles.active : ""
                        }`}
                        onClick={() => handlePositionClick(index)}
                        disabled={disabled}
                        aria-label={`${pos.label} ${
                            index < 3
                                ? "countercw"
                                : index > 3
                                ? "clockwise"
                                : "stop"
                        }`}
                        aria-pressed={position === index}
                    >
                        <div className={styles.iconWrapper}>{pos.icon}</div>
                        <div className={styles.iconLabel}>{pos.label}</div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MotorSlider;
