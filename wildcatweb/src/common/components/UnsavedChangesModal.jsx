/**
 * @file UnsavedChangesModal.jsx
 * @description Modal component that appears when user tries to navigate away from
 * editing mode with unsaved changes. Enhanced with Phase 2 context-specific actions
 * and execution state handling for comprehensive modal coordination.
 * @author Jennifer Cross with support from Claude
 * @updated February 2025
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
    Play,
    Square,
    StepForward,
    CircleAlert,
} from "lucide-react";
import styles from "../styles/UnsavedChangesModal.module.css";

/**
 * Get context-specific modal content based on action context and execution state
 * @param {string} actionContext - The context: 'play', 'navigate', 'edit'
 * @param {boolean} isExecutionRunning - Whether program is currently running
 * @param {number|null} targetStepNumber - Target step number for navigation context
 * @returns {Object} Modal content configuration
 */
const getModalContent = (
    actionContext,
    isExecutionRunning,
    targetStepNumber,
) => {
    // Handle execution states first
    if (isExecutionRunning) {
        if (actionContext === "navigate") {
            return {
                title: "Stop Code?",
                message: `Stop running code to go to Step ${
                    targetStepNumber + 1
                }?`,
                primaryAction: {
                    text: "Stop & Go",
                    icon: <Square />,
                    description:
                        "Stop the program and navigate to the selected step",
                },
                secondaryActions: {
                    back: {
                        text: "Back",
                        icon: <CircleArrowLeft />,
                        description: "Cancel and stay with current step",
                    },
                },
            };
        } else if (actionContext === "edit") {
            return {
                title: "Stop Code?",
                message: "Stop running code to make edits?",
                primaryAction: {
                    text: "Stop & Edit",
                    icon: <Square />,
                    description: "Stop the program and enter editing mode",
                },
                secondaryActions: {
                    back: {
                        text: "Back",
                        icon: <CircleArrowLeft />,
                        description: "Cancel and continue watching program",
                    },
                },
            };
        }
    }

    // Handle non-execution states with unsaved changes
    switch (actionContext) {
        case "play":
            return {
                title: "Save Edits?",
                message: "Edits are not saved.",
                primaryAction: {
                    text: "Save & Play",
                    icon: <Play />,
                    description: "Save changes and start running the program",
                },
                secondaryActions: {
                    back: {
                        text: "Back",
                        icon: <CircleArrowLeft />,
                        description: "Cancel and continue editing",
                    },
                    discard: {
                        text: "Skip & Play",
                        icon: <StepForward />,
                        description:
                            "Discard changes and start running the program",
                    },
                },
            };

        case "navigate":
        default:
            const stepText =
                targetStepNumber !== null
                    ? ` to Step ${targetStepNumber + 1}`
                    : "";
            return {
                title: "Save Edits?",
                message: "Edits are not saved.",
                primaryAction: {
                    text: "Save",
                    icon: <CircleCheckBig />,
                    description: `Save changes and continue${stepText}`,
                },
                secondaryActions: {
                    back: {
                        text: "Back",
                        icon: <CircleArrowLeft />,
                        description: "Cancel and continue editing",
                    },
                    discard: {
                        text: "Skip",
                        icon: <Trash2 />,
                        description: `Don't save changes and continue${stepText}`,
                    },
                },
            };
    }
};

/**
 * Modal component for handling unsaved changes with Phase 2 context support
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onSaveAndContinue - Save changes and continue with action
 * @param {Function} props.onDiscardChanges - Discard changes and continue with action
 * @param {Function} props.onCancel - Cancel action and stay in current state
 * @param {Function} props.onStopAndProceed - Stop execution and proceed with action (Phase 2)
 * @param {number|null} props.targetStepNumber - The step number user was trying to navigate to
 * @param {string} props.actionContext - Context: 'play', 'navigate', 'edit' (Phase 2)
 * @param {boolean} props.isExecutionRunning - Whether program is currently running (Phase 2)
 * @returns {JSX.Element|null} Modal component or null if not open
 */
const UnsavedChangesModal = ({
    isOpen,
    onSaveAndContinue,
    onDiscardChanges,
    onCancel,
    onStopAndProceed,
    targetStepNumber = null,
    actionContext = "navigate",
    isExecutionRunning = false,
}) => {
    // Don't render if not open
    if (!isOpen) {
        return null;
    }

    // Get context-specific content
    const modalContent = getModalContent(
        actionContext,
        isExecutionRunning,
        targetStepNumber,
    );

    // Handle keyboard events for accessibility
    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            onCancel();
        }
    };

    /**
     * Handle primary action button click
     */
    const handlePrimaryAction = () => {
        if (isExecutionRunning && onStopAndProceed) {
            onStopAndProceed();
        } else {
            onSaveAndContinue();
        }
    };

    /**
     * Handle discard action button click (only available in non-execution contexts)
     */
    const handleDiscardAction = () => {
        if (!isExecutionRunning && onDiscardChanges) {
            onDiscardChanges();
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
                    {/* Header with context-appropriate icon */}
                    <div className={styles.header}>
                        {isExecutionRunning ? (
                            <CircleAlert
                                className={styles.workIcon}
                                aria-hidden="true"
                            />
                        ) : (
                            <Pencil
                                className={styles.workIcon}
                                aria-hidden="true"
                            />
                        )}
                        <h2
                            id="unsaved-changes-title"
                            className={styles.title}
                        >
                            {modalContent.title}
                        </h2>
                    </div>

                    {/* Content */}
                    <div className={styles.content}>
                        <p
                            id="unsaved-changes-message"
                            className={styles.message}
                        >
                            {modalContent.message}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className={styles.actions}>
                        {/* Primary action - full width */}
                        <button
                            className={`${styles.actionButton} ${
                                styles.saveButton
                            } ${styles.primaryAction} ${
                                isExecutionRunning ? styles.stopAction : ""
                            }`}
                            onClick={handlePrimaryAction}
                            aria-label={modalContent.primaryAction.description}
                            autoFocus
                        >
                            {React.cloneElement(
                                modalContent.primaryAction.icon,
                                {
                                    className: styles.buttonIcon,
                                },
                            )}
                            {modalContent.primaryAction.text}
                        </button>

                        {/* Secondary actions - side by side */}
                        <div className={styles.secondaryActions}>
                            <button
                                className={`${styles.actionButton} ${styles.cancelButton} ${styles.secondaryAction}`}
                                onClick={onCancel}
                                aria-label={
                                    modalContent.secondaryActions.back
                                        .description
                                }
                            >
                                {React.cloneElement(
                                    modalContent.secondaryActions.back.icon,
                                    {
                                        className: styles.buttonIcon,
                                    },
                                )}
                                {modalContent.secondaryActions.back.text}
                            </button>

                            {/* Discard button - only show in non-execution contexts */}
                            {!isExecutionRunning &&
                                modalContent.secondaryActions.discard && (
                                    <button
                                        className={`${styles.actionButton} ${styles.discardButton} ${styles.secondaryAction}`}
                                        onClick={handleDiscardAction}
                                        aria-label={
                                            modalContent.secondaryActions
                                                .discard.description
                                        }
                                    >
                                        {React.cloneElement(
                                            modalContent.secondaryActions
                                                .discard.icon,
                                            {
                                                className: styles.buttonIcon,
                                            },
                                        )}
                                        {
                                            modalContent.secondaryActions
                                                .discard.text
                                        }
                                    </button>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default UnsavedChangesModal;
