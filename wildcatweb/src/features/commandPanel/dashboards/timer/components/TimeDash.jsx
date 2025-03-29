/**
 * @file TimeDash.jsx
 * @description Dashboard interface for configuring time wait actions with base ten blocks
 * visualization. Replaces the previous tower visualization with a base ten blocks
 * visualization for students with autism.
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

    // Calculate the number of hundreds, tens and ones
    const hundreds = Math.floor(seconds / 100);
    const tens = Math.floor((seconds % 100) / 10);
    const ones = seconds % 10;

    // Determine how many units should be ghosted based on animation progress
    const totalUnits = seconds;
    const ghostedUnits = Math.floor(totalUnits * progress);
    
    // Check if a specific unit should be ghosted
    const isUnitGhosted = (position) => {
        return position < ghostedUnits;
    };
    
    // Calculate positions for proper visual LIFO ordering (last in, first out)
    const getUnitPosition = (place, index, subIndex = 0) => {
        // Places: 0 = ones, 1 = tens, 2 = hundreds
        
        if (place === 0) { // Ones position - index is from top (newest) to bottom
            // Reverse the index so top block (index 0) is counted first
            return (ones - 1 - index);
        }
        else if (place === 1) { // Tens position - rightmost rod first, top to bottom
            // Ensure we've exhausted all ones blocks
            const onesBasePosition = ones;
            // Calculate tens position: starting from rightmost rod, top to bottom
            return onesBasePosition + (tens - 1 - index) * 10 + (9 - subIndex);
        }
        else { // Hundreds position 
            // Ensure we've exhausted all ones and tens blocks
            const basePosition = ones + tens * 10;
            // For hundreds, we need to count from right column to left, top to bottom
            return basePosition + (hundreds - 1 - index) * 100 + subIndex;
        }
    };
    
    // Function to create cells for the hundred squares
    const renderHundredCells = (hundredIdx) => {
        const cells = [];
        
        // Iterate through columns from right to left
        for (let colIdx = 9; colIdx >= 0; colIdx--) {
            // Iterate through rows from top to bottom
            for (let rowIdx = 0; rowIdx < 10; rowIdx++) {
                // Calculate subIndex to maintain correct sequence
                const subIndex = (9 - colIdx) * 10 + rowIdx;
                
                // Calculate position using unified position function
                const position = getUnitPosition(2, hundredIdx, subIndex);
                const ghosted = isUnitGhosted(position);
                
                cells.push(
                    <div 
                        key={`hundred-${hundredIdx}-cell-${colIdx}-${rowIdx}`}
                        className={`${styles.baseTenCell} ${ghosted ? styles.ghosted : ''}`}
                        style={{ 
                            gridColumn: colIdx + 1,
                            gridRow: rowIdx + 1,
                        }}
                    />
                );
            }
        }
        
        return cells;
    };

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

    // Run continuous animation
    useEffect(() => {
        // Animation duration matches the configured seconds
        const ANIMATION_DURATION = seconds * 1000;

        const animate = (timestamp) => {
            if (!animationStart.current) animationStart.current = timestamp;
            const elapsed = timestamp - animationStart.current;

            // Loop the animation
            const normalizedTime = (elapsed % ANIMATION_DURATION) / ANIMATION_DURATION;
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

            {/* Base Ten Block Visualization */}
            <div className={styles.baseTenContainer}>
                <div className={styles.baseTenBlocks}>
                    {/* Hundreds representation */}
                    {hundreds > 0 && (
                        <div className={styles.hundredsGroup}>
                            {Array.from({ length: hundreds }).map((_, hundredIdx) => (
                                <div 
                                    key={`hundred-${hundredIdx}`} 
                                    className={styles.hundredSquare}
                                >
                                    {renderHundredCells(hundredIdx)}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Tens representation */}
                    {tens > 0 && (
                        <div className={styles.tensGroup}>
                            {Array.from({ length: tens }).map((_, tenIdx) => (
                                <div 
                                    key={`ten-${tenIdx}`} 
                                    className={styles.tenRod}
                                >
                                    <div className={styles.tenSegments}>
                                        {Array.from({ length: 10 }).map((_, segmentIdx) => {
                                            const position = getUnitPosition(1, tenIdx, segmentIdx);
                                            const ghosted = isUnitGhosted(position);
                                            
                                            return (
                                                <div 
                                                    key={`ten-${tenIdx}-segment-${segmentIdx}`}
                                                    className={`${styles.tenSegment} ${ghosted ? styles.ghosted : ''}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Ones representation */}
                    {ones > 0 && (
                        <div className={styles.onesGroup}>
                            <div className={styles.onesStack}>
                                {Array.from({ length: ones }).map((_, oneIdx) => {
                                    const position = getUnitPosition(0, oneIdx);
                                    const ghosted = isUnitGhosted(position);
                                    
                                    return (
                                        <div 
                                            key={`one-${oneIdx}`} 
                                            className={`${styles.oneBlock} ${ghosted ? styles.ghosted : ''}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimeDash;