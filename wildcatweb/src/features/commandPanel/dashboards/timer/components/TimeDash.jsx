/**
 * @file TimeDash.jsx
 * @description Dashboard interface for configuring time wait actions with visual pie clock
 * and numeric controls for selecting duration. Refactored to use consistent design tokens
 * and styling patterns for improved theme compatibility.
 * @author Jennifer Cross with support from Claude
 * @created March 2025
 */

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import styles from "../styles/TimeDash.module.css";

/**
 * Time dashboard component for configuring wait durations
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onUpdate - Callback when time configuration changes
 * @param {Object} props.configuration - Current time configuration
 * @returns {JSX.Element} Time configuration dashboard with visual representation
 */
export const TimeDash = ({ onUpdate, configuration }) => {
    // Initialize seconds from configuration or default to 3
    const [seconds, setSeconds] = useState(configuration?.seconds || 3);

    // Track if configuration is complete
    const [isConfigured, setIsConfigured] = useState(!!configuration?.seconds);

    // Update configuration when seconds changes
    useEffect(() => {
        if (onUpdate) {
            onUpdate({ seconds });
            setIsConfigured(true);
        }
    }, [seconds, onUpdate]);

    /**
     * Increase seconds (max 60)
     */
    const increaseSeconds = () => {
        if (seconds < 60) {
            setSeconds(seconds + 1);
        }
    };

    /**
     * Decrease seconds (min 1)
     */
    const decreaseSeconds = () => {
        if (seconds > 1) {
            setSeconds(seconds - 1);
        }
    };

    // Calculate degrees for the conic gradient (portion of the clock to fill)
    const conicValue = `${Math.min(360 * (seconds / 60), 360)}deg`;

    return (
        <div className={styles.timeGroup}>
            <div className={styles.timeName}>WAIT FOR</div>

            {/* Time controls with buttons and numeric display */}
            <div className={styles.timeControlGroup}>
                <div className={styles.timeControls}>
                    <button
                        className={styles.timeButton}
                        onClick={decreaseSeconds}
                        disabled={seconds <= 1}
                        aria-label="Decrease seconds"
                    >
                        -
                    </button>

                    <div
                        className={styles.timeInput}
                        role="spinbutton"
                        aria-valuenow={seconds}
                        aria-valuemin={1}
                        aria-valuemax={60}
                    >
                        {seconds}
                    </div>

                    <button
                        className={styles.timeButton}
                        onClick={increaseSeconds}
                        disabled={seconds >= 60}
                        aria-label="Increase seconds"
                    >
                        +
                    </button>
                </div>

                <div className={styles.timeUnit}>seconds</div>
            </div>

            {/* Pie chart clock visualization */}
            <div className={styles.clockContainer}>
                <div className={styles.pieClock}>
                    <div
                        className={styles.pieSlice}
                        style={{
                            background: `conic-gradient(var(--color-timer-main) ${conicValue}, transparent 0)`,
                        }}
                        aria-hidden="true"
                    ></div>
                </div>
                <div
                    className={styles.clockBorder}
                    aria-hidden="true"
                ></div>
            </div>
        </div>
    );
};

export default TimeDash;
