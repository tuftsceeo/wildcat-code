/**
 * @file UnsavedChangesModal.jsx
 * @description Modal component that appears when user tries to navigate away from
 * editing mode with unsaved changes. Provides options to save, discard, or cancel.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

import React from "react";
import Portal from "../../../common/components/Portal";
import { AlertTriangle, Save, X, Ban } from "lucide-react";
import styles from "../styles/UnsavedChangesModal.module.css";

/**
 * Modal component for handling unsaved changes during navigation
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onSaveAndContinue - Save changes and continue to target step
 * @param {Function} props.onDiscardChanges - Discard changes and continue to target step
 * @param {Function} props.onCancel - Cancel navigation and stay in editing mode
 * @param {number} props.targetStepNumber - The step number user was trying to navigate to
 * @returns {JSX.Element|null} Modal component or null if not open
 */
const UnsavedChangesModal = ({
    isOpen,
    onSaveAndContinue,
    onDiscardChanges,
    onCancel,
    targetStepNumber,
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <Portal>
            <div className={styles.overlay}>
                <div className={styles.modalContainer}>
                    {/* Header with warning icon */}
                    <div className={styles.header}>
                        <AlertTriangle
                            size={48}
                            className={styles.warningIcon}
                        />
                        <h2 className={styles.title}>Unsaved Changes</h2>
                    </div>

                    {/* Content */}
                    <div className={styles.content}>
                        <p className={styles.message}>
                            You have unsaved changes in this step.
                        </p>
                        <p className={styles.submessage}>
                            What would you like to do before going to Step{" "}
                            {targetStepNumber + 1}?
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className={styles.actions}>
                        <button
                            className={`${styles.actionButton} ${styles.saveButton}`}
                            onClick={onSaveAndContinue}
                            aria-label="Save changes and continue to selected step"
                        >
                            <Save className={styles.buttonIcon} />
                            Save & Continue
                        </button>

                        <button
                            className={`${styles.actionButton} ${styles.discardButton}`}
                            onClick={onDiscardChanges}
                            aria-label="Discard changes and continue to selected step"
                        >
                            <Ban className={styles.buttonIcon} />
                            Discard Changes
                        </button>

                        <button
                            className={`${styles.actionButton} ${styles.cancelButton}`}
                            onClick={onCancel}
                            aria-label="Cancel navigation and continue editing"
                        >
                            <X className={styles.buttonIcon} />
                            Stay Here
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default UnsavedChangesModal;
