/**
 * @file TimeDash.jsx
 * @description Dashboard interface for configuring time wait actions with block tower
 * visualization. Replaces the previous pie clock with a more intuitive block
 * visualization for students with autism.
 * @author Jennifer Cross with support from Claude
 */

import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/TimeDash.module.css";

/**
 * Time dashboard component for configuring wait durations
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onUpdate - Callback when time configuration changes
 * @param {Object} props.configuration - Current time configuration
 * @param {boolean} props.isMissionMode - Whether running in mission mode
 * @param {Function} props.dispatchTaskEvent - Function to dispatch task events
 * @param {number} props.currSlotNumber - Current active slot number
 * @returns {JSX.Element} Time configuration dashboard with visual representation
 */
export const TimeDash = ({
    onUpdate,
    configuration,
    isMissionMode = false,
    dispatchTaskEvent = null,
    currSlotNumber,
}) => {
    // Initialize seconds from configuration or default to 3
    const [seconds, setSeconds] = useState(configuration?.seconds || 3);

    // Animation state
    const [progress, setProgress] = useState(0);
    const animationRef = useRef(null);
    const animationStart = useRef(null);

    // Track if configuration is complete
    const [isConfigured, setIsConfigured] = useState(!!configuration?.seconds);

    // Use a ref to track if we've sent the initial configuration
    const initialUpdateSent = useRef(false);

    // Only send an update when the component mounts or when configuration changes externally
    useEffect(() => {
        // If configuration exists but doesn't match our state, update our state
        if (
            configuration?.seconds !== undefined &&
            configuration.seconds !== seconds
        ) {
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
                const newConfig = { seconds: newSeconds };
                onUpdate(newConfig);
                setIsConfigured(true);

                // Dispatch timer value changed event for mission tracking
                if (isMissionMode && dispatchTaskEvent) {
                    dispatchTaskEvent("TIMER_VALUE_CHANGED", {
                        seconds: newSeconds,
                        slotIndex: currSlotNumber,
                        configuration: newConfig,
                        currentSlot: currSlotNumber,
                    });
                }
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
                const newConfig = { seconds: newSeconds };
                onUpdate(newConfig);
                setIsConfigured(true);

                // Dispatch timer value changed event for mission tracking
                if (isMissionMode && dispatchTaskEvent) {
                    dispatchTaskEvent("TIMER_VALUE_CHANGED", {
                        seconds: newSeconds,
                        slotIndex: currSlotNumber,
                        configuration: newConfig,
                        currentSlot: currSlotNumber,
                    });
                }
            }
        }
    };

    // Get the stacking pattern based on seconds
    const stackingPattern = getStackingPattern(seconds);

    // Scale block size based on seconds
    const blockSize = getBlockSize(seconds);

    // Block color
    const blockColor = "var(--color-timer-main)";

    // Calculate how many blocks should be visible
    const totalBlocks = stackingPattern.reduce(
        (sum, rowWidth) => sum + rowWidth,
        0,
    );
    const visibleBlocks = Math.ceil(totalBlocks * (1 - progress));

    // Run continuous animation
    useEffect(() => {
        // Animation duration matches the configured seconds
        const ANIMATION_DURATION = seconds * 1000;

        const animate = (timestamp) => {
            if (!animationStart.current) animationStart.current = timestamp;
            const elapsed = timestamp - animationStart.current;

            // Loop the animation
            const normalizedTime =
                (elapsed % ANIMATION_DURATION) / ANIMATION_DURATION;
            setProgress(normalizedTime);

            animationRef.current = requestAnimationFrame(animate);
        };

        // Reset animation start time when seconds change
        animationStart.current = null;
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [seconds]); // Add seconds to dependency array

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

            {/* Block tower visualization */}
            <div className={styles.blockTowerContainer}>
                <div className={styles.blockTower}>
                    {/* Render rows of blocks from top to bottom */}
                    {stackingPattern.map((rowWidth, rowIndex) => (
                        <div
                            key={`row-${rowIndex}`}
                            className={styles.blockRow}
                        >
                            {Array.from({ length: rowWidth }).map(
                                (_, colIndex) => {
                                    // Calculate the position in the stacking order (top to bottom, left to right)
                                    // Sum of all previous rows' widths + current column
                                    let position = 0;
                                    for (let i = 0; i < rowIndex; i++) {
                                        position += stackingPattern[i];
                                    }
                                    position += colIndex;

                                    // Check if this block should be visible based on remaining blocks
                                    // For top-down removal, blocks with lower positions are removed first
                                    const isVisible =
                                        position >= totalBlocks - visibleBlocks;

                                    return (
                                        <div
                                            key={`block-${rowIndex}-${colIndex}`}
                                            className={styles.timeBlock}
                                            style={{
                                                width: `${blockSize.width}px`,
                                                height: `${blockSize.height}px`,
                                                backgroundColor: blockColor,
                                                opacity: isVisible ? 1 : 0.2,
                                                transform: isVisible
                                                    ? "scale(1)"
                                                    : "scale(0.95)",
                                                transition:
                                                    "opacity 0.2s, transform 0.2s",
                                            }}
                                        />
                                    );
                                },
                            )}
                        </div>
                    ))}

                    {/* Base platform */}
                    <div
                        className={styles.blockBase}
                        style={{
                            width: `${Math.max(
                                stackingPattern[stackingPattern.length - 1] *
                                    (blockSize.width + 1) +
                                    20,
                                80,
                            )}px`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * Get stacking pattern based on total blocks
 * Uses predefined patterns for 1-30 seconds
 *
 * @param {number} totalBlocks - Total number of blocks (seconds)
 * @returns {Array} Array representing the width of each row from top to bottom
 */
function getStackingPattern(totalBlocks) {
    // Hard-coded patterns
    const patterns = {
        1: [1],
        2: [2],
        3: [1, 2],
        4: [2, 2],
        5: [2, 3],
        6: [3, 3],
        7: [1, 3, 3],
        8: [2, 3, 3],
        9: [2, 3, 4],
        10: [1, 2, 3, 4],
        11: [1, 3, 3, 4],
        12: [2, 3, 3, 4],
        13: [2, 3, 4, 4],
        14: [2, 3, 4, 5],
        15: [1, 2, 3, 4, 5],
        16: [1, 2, 3, 5, 5],
        17: [1, 2, 4, 5, 5],
        18: [1, 2, 4, 5, 6],
        19: [1, 3, 4, 5, 6],
        20: [2, 3, 4, 5, 6],
        21: [1, 2, 3, 4, 5, 6],
        22: [1, 2, 3, 4, 6, 6],
        23: [1, 2, 3, 5, 6, 6],
        24: [1, 2, 4, 5, 6, 6],
        25: [1, 2, 4, 5, 6, 7],
        26: [1, 3, 4, 5, 6, 7],
        27: [2, 3, 4, 5, 6, 7],
        28: [1, 2, 3, 4, 5, 6, 7],
        29: [1, 2, 3, 4, 6, 6, 7],
        30: [1, 2, 3, 5, 6, 6, 7],
    };

    // For larger values, use a simple pattern
    if (totalBlocks > 30) {
        return [2, 3, 5, 6, 7, 7];
    }

    return patterns[totalBlocks] || [1]; // Default to [1] if not found
}

/**
 * Calculate the size of blocks based on total number
 *
 * @param {number} totalBlocks - Total number of blocks
 * @returns {Object} Object with width and height properties
 */
function getBlockSize(totalBlocks) {
    let width, height;

    if (totalBlocks <= 5) {
        width = 32;
        height = 28;
    } else if (totalBlocks <= 15) {
        width = 28;
        height = 24;
    } else if (totalBlocks <= 25) {
        width = 24;
        height = 20;
    } else {
        width = 20;
        height = 16;
    }

    return { width, height };
}

export default TimeDash;
