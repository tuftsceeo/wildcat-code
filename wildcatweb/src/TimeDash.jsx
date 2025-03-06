/**
 * @file TimeDash.jsx
 * @description Dashboard interface for configuring time wait actions,
 * with visual time selection controls.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

import React, { useState, useEffect } from "react";
import styles from "./TimeDash.module.css";

export const TimeDash = ({ onUpdate, configuration }) => {
    const [seconds, setSeconds] = useState(configuration?.seconds || 3);

    // Changed to only trigger when seconds actually changes
    useEffect(() => {
        if (onUpdate) {
            // Add null check
            onUpdate({ seconds });
        }
    }, [seconds, onUpdate]); // Added onUpdate to dependencies

    const handleSecondsChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value > 0) {
            setSeconds(value);
        }
    };

    // Timer visualization component
    const TimerVisualization = ({ seconds }) => {
        const radius = 60;
        const circumference = 2 * Math.PI * radius;

        return (
            <div className={styles.timerVisualization}>
                <div className={styles.timerDisplay}>
                    <svg
                        width="150"
                        height="150"
                        viewBox="0 0 150 150"
                    >
                        {/* Background circle */}
                        <circle
                            className={styles.timerBackground}
                            cx="75"
                            cy="75"
                            r={radius}
                        />

                        {/* Timer circle - would animate in a functioning timer */}
                        <circle
                            className={styles.timerCircle}
                            cx="75"
                            cy="75"
                            r={radius}
                            strokeDasharray={circumference}
                            strokeDashoffset="0"
                        />
                    </svg>

                    {/* Time display */}
                    <div className={styles.timeDigits}>{seconds}</div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.timeGroup}>
            <div className={styles.timeName}>Wait Time</div>

            {/* Timer visualization */}
            <TimerVisualization seconds={seconds} />

            <div className={styles.timeControl}>
                <input
                    type="number"
                    min="1"
                    value={seconds}
                    onChange={handleSecondsChange}
                    className={styles.timeInput}
                />
                <span className={styles.timeUnit}>seconds</span>
            </div>
        </div>
    );
};

export default TimeDash;
