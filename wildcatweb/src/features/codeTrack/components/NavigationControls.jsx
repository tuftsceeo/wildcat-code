/**
 * @file NavigationControls.jsx
 * @description Navigation controls for moving between slots in the coding track.
 * Updated to disable Next button until current step is completed.
 * @author Jennifer Cross with support from Claude
 */

import React from "react";
import styles from "../styles/CodingTrack.module.css";

/**
 * Navigation controls for moving between slots
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.currSlotNumber - Current slot number
 * @param {number} props.missionSteps - Total number of mission steps
 * @param {Function} props.onPrevious - Callback for previous button
 * @param {Function} props.onNext - Callback for next button
 * @param {Object} props.currentInstruction - Current instruction data
 * @returns {JSX.Element} Navigation controls
 */
const NavigationControls = ({
    currSlotNumber,
    missionSteps,
    onPrevious,
    onNext,
    currentInstruction,
}) => {
    // Check if current step is completed (has an instruction configured)
    const isCurrentStepCompleted = !!(currentInstruction?.type && currentInstruction?.subtype);
    
    // missionSteps is the COUNT, so max index is missionSteps-1
    const isPrevButtonDisabled = currSlotNumber <= 0;
    
    // Disable Next button if:
    // 1. We're at the last step OR
    // 2. Current step isn't completed
    const isNextButtonDisabled = currSlotNumber >= missionSteps - 1 || !isCurrentStepCompleted;

    return (
        <div className={styles.navigationControls}>
            <button
                className={`${styles.navButton} ${styles.prevButton}`}
                disabled={isPrevButtonDisabled}
                onClick={onPrevious}
                aria-label={
                    isPrevButtonDisabled
                        ? "Start"
                        : `Previous Go to Step ${currSlotNumber}`
                }
            />
            <button
                className={`${styles.navButton} ${styles.nextButton}`}
                disabled={isNextButtonDisabled}
                onClick={onNext}
                aria-label={
                    isNextButtonDisabled
                        ? "End"
                        : `Next Go to Step ${currSlotNumber + 2}`
                }
            />
        </div>
    );
};

export default NavigationControls;