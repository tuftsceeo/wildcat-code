/**
 * @file StepsSettings.jsx
 * @description Component for controlling the number of coding steps available in the application
 * with safeguards against accidentally deleting steps that contain code.
 * Now includes toggle switches for controlling step navigation behavior.
 * @author Jennifer Cross with support from Claude
 */

import React, { useState, useEffect } from "react";
import { Minus, Plus, AlertTriangle, Lock } from "lucide-react";
import { useCustomization } from "../../../context/CustomizationContext";
import { useMission } from "../../../context/MissionContext";

import Portal from "../../../common/components/Portal";
import styles from "../styles/StepsSettings.module.css";

/**
 * Toggle switch component for boolean settings
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.label - Label text for the toggle
 * @param {string} props.description - Description text explaining the toggle functionality
 * @param {boolean} props.value - Current toggle value
 * @param {Function} props.onChange - Function called when toggle changes
 * @returns {JSX.Element} Toggle switch UI component
 */
const ToggleSwitch = ({ label, description, value, onChange }) => {
    return (
        <div className={styles.toggleOption}>
            <label className={styles.toggleLabel}>
                <div className={styles.toggleLabelText}>{label}</div>
                <div className={styles.toggleSwitch}>
                    <input
                        type="checkbox"
                        checked={value}
                        onChange={() => onChange(!value)}
                        className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                </div>
            </label>
            {description && (
                <div className={styles.toggleDescription}>{description}</div>
            )}
        </div>
    );
};

/**
 * Settings component for step count configuration
 * and step behavior preferences
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.slotData - Current slot data to check for populated steps
 * @param {Function} props.onUpdateMissionSteps - Function to update the mission steps
 * @returns {JSX.Element} Step settings interface
 */
const StepsSettings = ({ slotData = [], onUpdateMissionSteps }) => {
    // Get step count and preferences from context
    const { 
        stepCount, 
        setStepCount, 
        MIN_STEPS, 
        MAX_STEPS,
        requireSequentialCompletion,
        setRequireSequentialCompletion,
        useCommandLabels,
        setUseCommandLabels
    } = useCustomization();

    // Get mission mode state
    const { isMissionMode } = useMission();

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
        if (isMissionMode) {
            setConfirmationMessage("Cannot modify step count while a mission is in progress.");
            setShowConfirmation(true);
            return;
        }

        if (tempStepCount < MAX_STEPS) {
            setTempStepCount((prev) => prev + 1);
        }
    };

    /**
     * Decrease step count (with lower limit)
     */
    const handleDecreaseSteps = () => {
        if (isMissionMode) {
            setConfirmationMessage("Cannot modify step count while a mission is in progress.");
            setShowConfirmation(true);
            return;
        }

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

        console.log("StepSettings: Applying step count change to", validStepCount);

        // Update the context
        setStepCount(validStepCount);

        // Notify parent component if callback provided
        if (onUpdateMissionSteps) {
            console.log("StepSettings: Calling onUpdateMissionSteps with", validStepCount);
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

    /**
     * Handle toggle change for sequential completion requirement
     * 
     * @param {boolean} newValue - New toggle value
     */
    const handleSequentialToggle = (newValue) => {
        setRequireSequentialCompletion(newValue);
    };

    /**
     * Handle toggle change for command labels
     * 
     * @param {boolean} newValue - New toggle value
     */
    const handleCommandLabelsToggle = (newValue) => {
        setUseCommandLabels(newValue);
    };

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                Number of Code Steps
            </div>
            {isMissionMode && (
                <div className={styles.missionModeWarning}>
                    <Lock size={16} />
                    <span>Mission in Progress</span>
                </div>
            )}

            <div className={styles.stepCountControl}>
                <button
                    className={`${styles.stepButton} ${
                        tempStepCount <= MIN_STEPS || isMissionMode ? styles.disabled : ""
                    }`}
                    onClick={handleDecreaseSteps}
                    disabled={tempStepCount <= MIN_STEPS || isMissionMode}
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
                        tempStepCount >= MAX_STEPS || isMissionMode ? styles.disabled : ""
                    }`}
                    onClick={handleIncreaseSteps}
                    disabled={tempStepCount >= MAX_STEPS || isMissionMode}
                    aria-label="Increase step count"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className={styles.updateButtonContainer}>
                <button
                    className={`${styles.updateButton} ${isMissionMode ? styles.disabled : ""}`}
                    onClick={handleApplySteps}
                    disabled={tempStepCount === stepCount || isMissionMode}
                >
                    Apply Changes
                </button>
            </div>

            {/* New toggle section for step behavior options */}
            <div className={styles.toggleSection}>
                <div className={styles.toggleSectionTitle}>Step Navigation Options</div>
                
                <ToggleSwitch 
                    label="Require Sequential Completion"
                    description="When enabled, each step can only be accessed after previous steps are completed"
                    value={requireSequentialCompletion}
                    onChange={handleSequentialToggle}
                />
                
                <ToggleSwitch 
                    label="Use Command Labels"
                    description="When enabled, completed steps show command names instead of 'Step 1', 'Step 2', etc."
                    value={useCommandLabels}
                    onChange={handleCommandLabelsToggle}
                />
            </div>

            <div className={styles.description}>
                <p>
                    Use these settings to adjust how many code steps are available
                    and how they behave in the application.
                </p>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmation && (
                <div className={styles.confirmationOverlay}>
                    <div className={styles.confirmationDialog}>
                        <div className={styles.confirmationHeader}>
                            <AlertTriangle size={24} color="var(--color-warning-main)" />
                            <h3>Warning: {isMissionMode ? "Mission in Progress" : "Code Will Be Deleted"}</h3>
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
                            {!isMissionMode && (
                                <button
                                    className={styles.confirmButton}
                                    onClick={applyStepCountChange}
                                >
                                    Confirm
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StepsSettings;