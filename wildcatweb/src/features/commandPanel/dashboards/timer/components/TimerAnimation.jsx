/**
 * @file TimerAnimation.jsx
 * @description Visualization for a timer instruction with base ten blocks visualization
 * that represents time more clearly for students with autism.
 */

import React, { useState, useEffect, useRef } from "react";
import { Timer } from "lucide-react";
import styles from "../../../../codeTrack/styles/CodingTrack.module.css";

/**
 * Base Ten Blocks Visualization for timer instructions
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.seconds - Duration in seconds
 * @param {boolean} props.active - Whether the animation is active
 * @returns {JSX.Element} Timer visualization with base ten blocks
 */
const TimerAnimation = ({ seconds = 3, active = true }) => {
    // Animation state
    const [progress, setProgress] = useState(0);
    const animationRef = useRef(null);
    const animationStart = useRef(null);
    
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
    
    // Run continuous animation
    useEffect(() => {
        if (!active) return;
        
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
    }, [active, seconds]);
    
    return (
        <div className={styles.timerVisualization}>
            {/* Time display */}
            <div className={styles.timerValue}>
                <Timer className={styles.timerIcon} />
                {seconds}
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
            
            <div className={styles.timerUnit}>SECONDS</div>
        </div>
    );
};

export default TimerAnimation;