import React, { useState, useEffect } from 'react';
import styles from './TimeDash.module.css';

export const TimeDash = ({ onUpdate, configuration }) => {
    const [seconds, setSeconds] = useState(configuration?.seconds || 3);

    // Changed to only trigger when seconds actually changes
    useEffect(() => {
        if (onUpdate) {  // Add null check
            onUpdate({ seconds });
        }
    }, [seconds]); // Removed onUpdate from dependencies

    const handleSecondsChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value > 0) {
            setSeconds(value);
        }
    };

    return (
        <div className={styles.timeGroup}>
            <div className={styles.timeName}>Wait Time</div>
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
