/**
 * @file NavigationControls.jsx
 * @description Navigation controls for moving between slots in the coding track.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

// NavigationControls.jsx
import React from "react";
import styles from "./CodingTrack.module.css"; // Still using the original CSS

/**
 * Navigation controls for moving between slots
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.currSlotNumber - Current slot number
 * @param {number} props.missionSteps - Total number of mission steps
 * @param {Function} props.onPrevious - Callback for previous button
 * @param {Function} props.onNext - Callback for next button
 * @returns {JSX.Element} Navigation controls
 */
const NavigationControls = ({
    currSlotNumber,
    missionSteps,
    onPrevious,
    onNext,
}) => {
    const isPrevButtonDisabled = currSlotNumber <= 0;
    const isNextButtonDisabled = currSlotNumber >= missionSteps;

    return (
        <div className={styles.navigationControls}>
            <button
                className={`${styles.navButton} ${styles.prevButton}`}
                disabled={isPrevButtonDisabled}
                onClick={onPrevious}
                aria-label="Previous step"
            />
            <button
                className={`${styles.navButton} ${styles.nextButton}`}
                disabled={isNextButtonDisabled}
                onClick={onNext}
                aria-label="Next step"
            />
        </div>
    );
};

export default NavigationControls;
