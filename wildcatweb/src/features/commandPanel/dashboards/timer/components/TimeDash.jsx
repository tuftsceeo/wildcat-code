/**
 * @file TimeDash.jsx
 * @description Dashboard interface for configuring time wait actions with visual pie clock
 * and numeric controls for selecting duration. Refactored to use consistent design tokens
 * and styling patterns for improved theme compatibility.
 * @author Jennifer Cross with support from Claude
 * @created March 2025
 */
/**
 * @file TimeDash.jsx
 * @description Dashboard interface for configuring time wait actions with visual pie clock
 * and numeric controls for selecting duration. Fixed to avoid infinite update loops.
 */

import React, { useState, useEffect, useRef } from "react";
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
    
    // Use a ref to track if we've sent the initial configuration
    const initialUpdateSent = useRef(false);
    
    // Only send an update when the component mounts or when configuration changes externally
    useEffect(() => {
        // If configuration exists but doesn't match our state, update our state
        if (configuration?.seconds !== undefined && configuration.seconds !== seconds) {
            setSeconds(configuration.seconds);
            return; // Exit early to avoid sending an update for this change
        }
        
        // Only send initial update if we haven't already and if needed
        if (!initialUpdateSent.current && onUpdate && !configuration?.seconds) {
            onUpdate({ seconds });
            setIsConfigured(true);
            initialUpdateSent.current = true;
        }
    }, [configuration, seconds, onUpdate]);

    /**
     * Increase seconds (max 60)
     * Directly calls onUpdate to avoid effect-based update loop
     */
    const increaseSeconds = () => {
        if (seconds < 60) {
            const newSeconds = seconds + 1;
            setSeconds(newSeconds);
            if (onUpdate) {
                onUpdate({ seconds: newSeconds });
                setIsConfigured(true);
            }
        }
    };

    /**
     * Decrease seconds (min 1)
     * Directly calls onUpdate to avoid effect-based update loop
     */
    const decreaseSeconds = () => {
        if (seconds > 1) {
            const newSeconds = seconds - 1;
            setSeconds(newSeconds);
            if (onUpdate) {
                onUpdate({ seconds: newSeconds });
                setIsConfigured(true);
            }
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
