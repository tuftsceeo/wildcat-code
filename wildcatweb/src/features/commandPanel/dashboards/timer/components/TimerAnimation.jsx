/**
 * @file TimerAnimation.jsx
 * @description Visualization for a timer instruction with block tower visualization
 * that shows time passing more intuitively for students with autism.
 * @author Jennifer Cross with support from Claude
 */

import React, { useState, useEffect, useRef } from "react";
import styles from "../../../../codeTrack/styles/CodingTrack.module.css";

/**
 * Block Tower Visualization for timer instructions
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.seconds - Duration in seconds
 * @param {boolean} props.active - Whether the animation is active
 * @returns {JSX.Element} Timer visualization with block tower
 */
const TimerAnimation = ({ seconds = 3, active = true }) => {
    // Animation state
    const [progress, setProgress] = useState(0);
    const animationRef = useRef(null);
    const animationStart = useRef(null);
    
    // Get stacking pattern based on seconds
    const stackingPattern = getStackingPattern(seconds);
    
    // Scale block size based on seconds
    const blockSize = getBlockSize(seconds);
    
    // Block color
    const blockColor = 'var(--color-timer-main)';
    
    // Calculate how many blocks should be visible
    const totalBlocks = stackingPattern.reduce((sum, rowWidth) => sum + rowWidth, 0);
    const visibleBlocks = Math.ceil(totalBlocks * (1 - progress));
    
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
    }, [active, seconds]); // Add seconds to dependency array
    
    return (
        <div className={styles.timerVisualization}>
            {/* Time display */}
            <div className={styles.timerValue}>{seconds}</div>
            
            {/* Block tower visualization */}
            <div className={styles.blockTower}>
                {/* Render rows of blocks from top to bottom */}
                {stackingPattern.map((rowWidth, rowIndex) => (
                    <div 
                        key={`row-${rowIndex}`}
                        className={styles.blockRow}
                    >
                        {Array.from({ length: rowWidth }).map((_, colIndex) => {
                            // Calculate the position in the stacking order (top to bottom, left to right)
                            // Sum of all previous rows' widths + current column
                            let position = 0;
                            for (let i = 0; i < rowIndex; i++) {
                                position += stackingPattern[i];
                            }
                            position += colIndex;
                            
                            // Check if this block should be visible based on remaining blocks
                            // For top-down removal, blocks with lower positions are removed first
                            const isVisible = position >= (totalBlocks - visibleBlocks);
                            
                            return (
                                <div 
                                    key={`block-${rowIndex}-${colIndex}`}
                                    className={styles.timerBlock}
                                    style={{
                                        width: `${blockSize.width}px`,
                                        height: `${blockSize.height}px`, 
                                        backgroundColor: blockColor,
                                        opacity: isVisible ? 1 : 0.2,
                                        transform: isVisible ? 'scale(1)' : 'scale(0.95)'
                                    }}
                                />
                            );
                        })}
                    </div>
                ))}
                
                {/* Base platform */}
                <div 
                    className={styles.blockBase}
                    style={{ 
                        width: `${Math.max(stackingPattern[stackingPattern.length-1] * (blockSize.width + 1) + 20, 80)}px`
                    }}
                />
            </div>
            
            <div className={styles.timerUnit}>SECONDS</div>
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
        30: [1, 2, 3, 5, 6, 6, 7]
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

export default TimerAnimation;