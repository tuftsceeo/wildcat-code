/**
 * @file StepsSettings.jsx
 * @description Component for controlling the number of coding steps available in the application
 * with safeguards against accidentally deleting steps that contain code.
 * @author Jennifer Cross with support from Claude
 */

import React, { useState, useEffect } from "react";
import { Minus, Plus, AlertTriangle } from "lucide-react";
import { useCustomization } from "../../../context/CustomizationContext";
import Portal from "../../../common/components/Portal";
import styles from "../styles/StepsSettings.module.css";

/**
 * Settings component for step count configuration
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.slotData - Current slot data to check for populated steps
 * @param {Function} props.onUpdateMissionSteps - Function to update the mission steps
 * @returns {JSX.Element} Step settings interface
 */
const StepsSettings = ({ slotData = [], onUpdateMissionSteps }) => {
    // Get step count from context
    const { stepCount, setStepCount, MIN_STEPS, MAX_STEPS } =
        useCustomization();

    // Local state for step count (before applying)
    const [tempStepCount, setTempStepCount] = useState(stepCount);

    // State for confirmation dialog
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState("");

    // Reset local count when context changes
    useEffect(() => {
        setTempStepCount(stepCount);
    }, [stepCount]);

    /**
     * Increase step count (with upper limit)
     */
    const handleIncreaseSteps = () => {
        if (tempStepCount < MAX_STEPS) {
            setTempStepCount((prev) => prev + 1);
        }
    };

    /**
     * Decrease step count (with lower limit)
     */
    const handleDecreaseSteps = () => {
        if (tempStepCount > MIN_STEPS) {
            setTempStepCount((prev) => prev - 1);
        }
    };

    /**
     * Check if reducing steps would delete populated steps
     *
     * @returns {Array} Array of step numbers that would be deleted and have content
     */
    const checkForPopulatedSteps = () => {
        const stepsToRemove = [];

        // Check if any steps being removed contain data
        for (
            let i = tempStepCount;
            i < slotData.length && i <= stepCount;
            i++
        ) {
            // Check if this slot has configuration data
            if (slotData[i]?.type && slotData[i]?.subtype) {
                stepsToRemove.push(i + 1); // +1 for human-readable step numbers
            }
        }

        return stepsToRemove;
    };

    /**
     * Handle applying the new step count
     */
    const handleApplySteps = () => {
        // If reducing steps, check if any populated steps would be removed
        if (tempStepCount < stepCount) {
            const populatedSteps = checkForPopulatedSteps();

            if (populatedSteps.length > 0) {
                // Show confirmation dialog if populated steps would be removed
                setConfirmationMessage(
                    `This will remove step${
                        populatedSteps.length > 1 ? "s" : ""
                    } ${populatedSteps.join(", ")} which contain${
                        populatedSteps.length === 1 ? "s" : ""
                    } code. Continue?`,
                );
                setShowConfirmation(true);
                return;
            }
        }

        // No confirmation needed, apply changes
        applyStepCountChange();
    };

    /**
     * Apply the step count change after confirmation (if needed)
     */
    const applyStepCountChange = () => {
        // Ensure the step count is within valid range
        const validStepCount = Math.max(
            MIN_STEPS,
            Math.min(MAX_STEPS, tempStepCount),
        );

        // Update the context
        setStepCount(validStepCount);

        // Notify parent component if callback provided
        if (onUpdateMissionSteps) {
            onUpdateMissionSteps(validStepCount);
        }

        // Hide confirmation dialog if it was showing
        setShowConfirmation(false);
    };

    /**
     * Cancel the step count change
     */
    const handleCancelChange = () => {
        // Reset temp count and hide confirmation
        setTempStepCount(stepCount);
        setShowConfirmation(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.title}>Number of Code Steps</div>

            <div className={styles.stepCountControl}>
                <button
                    className={`${styles.stepButton} ${
                        tempStepCount <= MIN_STEPS ? styles.disabled : ""
                    }`}
                    onClick={handleDecreaseSteps}
                    disabled={tempStepCount <= MIN_STEPS}
                    aria-label="Decrease step count"
                >
                    <Minus size={24} />
                </button>

                <div className={styles.stepCountDisplay}>
                    <div className={styles.stepCount}>{tempStepCount}</div>
                    <div className={styles.stepLabel}>STEPS</div>
                </div>

                <button
                    className={`${styles.stepButton} ${
                        tempStepCount >= MAX_STEPS ? styles.disabled : ""
                    }`}
                    onClick={handleIncreaseSteps}
                    disabled={tempStepCount >= MAX_STEPS}
                    aria-label="Increase step count"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className={styles.updateButtonContainer}>
                <button
                    className={styles.updateButton}
                    onClick={handleApplySteps}
                    disabled={tempStepCount === stepCount}
                >
                    Apply Changes
                </button>
            </div>

            <div className={styles.description}>
                <p>
                    Use this setting to adjust how many code steps are available
                    in the application.
                </p>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmation && (
                <Portal>
                    <div className={styles.confirmationOverlay}>
                        <div className={styles.confirmationDialog}>
                            <div className={styles.confirmationHeader}>
                                <AlertTriangle
                                    size={24}
                                    color="var(--color-warning)"
                                />
                                <h3>Warning: Code Will Be Deleted</h3>
                            </div>

                            <div className={styles.confirmationMessage}>
                                {confirmationMessage}
                            </div>

                            <div className={styles.confirmationButtons}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={handleCancelChange}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={styles.confirmButton}
                                    onClick={applyStepCountChange}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
};

export default StepsSettings;
