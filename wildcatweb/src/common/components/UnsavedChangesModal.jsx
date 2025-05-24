/**
 * @file UnsavedChangesModal.jsx
 * @description Modal component that appears when user tries to navigate away from
 * editing mode with unsaved changes. Provides options to save, discard, or cancel.
 * Located in common/components for reusability across the application.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

import React from "react";
import Portal from "./Portal";
import {
    Save,
    X,
    Ban,
    Edit3,
    Trash2,
    CircleArrowLeft,
    Pencil,
    CircleCheckBig,
} from "lucide-react";
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
    // Don't render if not open
    if (!isOpen) {
        return null;
    }

    // Handle keyboard events for accessibility
    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            onCancel();
        }
    };

    return (
        <Portal>
            <div
                className={styles.overlay}
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-modal="true"
                aria-labelledby="unsaved-changes-title"
                aria-describedby="unsaved-changes-message"
            >
                <div className={styles.modalContainer}>
                    {/* Header with friendly work icon */}
                    <div className={styles.header}>
                        <Pencil
                            className={styles.workIcon}
                            aria-hidden="true"
                        />
                        <h2
                            id="unsaved-changes-title"
                            className={styles.title}
                        >
                            Save Edits?
                        </h2>
                    </div>

                    {/* Content */}
                    <div className={styles.content}>
                        <p
                            id="unsaved-changes-message"
                            className={styles.message}
                        >
                            Edits are not saved.
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className={styles.actions}>
                        {/* Primary action - full width */}
                        <button
                            className={`${styles.actionButton} ${styles.saveButton} ${styles.primaryAction}`}
                            onClick={onSaveAndContinue}
                            aria-label="Save changes and continue to selected step"
                            autoFocus
                        >
                            <CircleCheckBig className={styles.buttonIcon} />
                            Save
                        </button>

                        {/* Secondary actions - side by side */}
                        <div className={styles.secondaryActions}>
                            <button
                                className={`${styles.actionButton} ${styles.cancelButton} ${styles.secondaryAction}`}
                                onClick={onCancel}
                                aria-label="Cancel and continue editing"
                            >
                                <CircleArrowLeft
                                    className={styles.buttonIcon}
                                />
                                Back
                            </button>

                            <button
                                className={`${styles.actionButton} ${styles.discardButton} ${styles.secondaryAction}`}
                                onClick={onDiscardChanges}
                                aria-label="Don't save changes and continue to selected step"
                            >
                                <Trash2 className={styles.buttonIcon} />
                                Skip
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default UnsavedChangesModal;
