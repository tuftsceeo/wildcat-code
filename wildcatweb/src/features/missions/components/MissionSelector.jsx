/**
 * @file MissionSelector.jsx
 * @description Component for selecting missions or switching to sandbox mode
 * with error handling for empty mission lists
 */

import React, { useState, useEffect } from "react";
import { useMission } from "../../../context/MissionContext.js";
import { useCustomization } from "../../../context/CustomizationContext.js";
import Portal from "../../../common/components/Portal.js";
import { Rocket, Play, Gamepad2, ChevronLeft, ChevronRight, AlertTriangle, FilePlus } from "lucide-react";
import styles from "../styles/MissionSelector.module.css";

/**
 * Mission selector component showing available missions
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the selector is open
 * @param {Function} props.onClose - Function to call when closing the selector
 * @param {boolean} props.initialSetup - Whether this is the initial app setup
 * @returns {JSX.Element} Mission selector component
 */
const MissionSelector = ({ isOpen, onClose, initialSetup = false }) => {
    const { availableMissions, startMission, isMissionMode, setIsMissionMode, validateHardwareRequirements, exitMission } = useMission();

    const { setStepCount, MIN_STEPS } = useCustomization();

    const [selectedMissionIndex, setSelectedMissionIndex] = useState(0);
    const [showHardwareWarning, setShowHardwareWarning] = useState(false);
    const [missingHardware, setMissingHardware] = useState([]);

    // Handle case where availableMissions is empty or undefined
    const hasMissions = availableMissions && availableMissions.length > 0;

    // Get the currently selected mission
    const selectedMission = hasMissions ? availableMissions[selectedMissionIndex] : null;

    // Reset selectedMissionIndex when availableMissions changes
    useEffect(() => {
        if (hasMissions && selectedMissionIndex >= availableMissions.length) {
            setSelectedMissionIndex(0);
        }
    }, [availableMissions, selectedMissionIndex, hasMissions]);

    /**
     * Handle starting a mission
     * Validates hardware requirements before starting
     */
    const handleStartMission = () => {
        if (!selectedMission) return;

        // Validate hardware requirements
        const { isValid, missingHardware: missing } = validateHardwareRequirements();

        if (!isValid) {
            setMissingHardware(missing);
            setShowHardwareWarning(true);
            return;
        }

        // Start the mission
        startMission(selectedMission.missionId);
        onClose();
    };

    /**
     * Handle switching to sandbox mode
     */
    const handleSandboxMode = () => {
        setIsMissionMode(false);
        onClose();
    };

    /**
     * Handle creating a new project
     * Resets the robot configuration and step count
     */
    const handleNewProject = () => {
        // Exit mission mode if active
        if (isMissionMode) {
            exitMission();
        }

        // Reset step count to minimum (3 steps: 2 plus stop)
        setStepCount(MIN_STEPS);

        // Dispatch event to reset slot data
        window.dispatchEvent(
            new CustomEvent("updateSlotData", {
                detail: {
                    slotData: Array(MIN_STEPS - 1).fill({
                        type: null,
                        subtype: null,
                        configuration: {},
                    }),
                },
            }),
        );

        // Close the selector
        onClose();
    };

    /**
     * Navigate to the previous mission
     */
    const handlePrevMission = () => {
        if (!hasMissions) return;

        setSelectedMissionIndex((prev) => (prev === 0 ? availableMissions.length - 1 : prev - 1));
    };

    /**
     * Navigate to the next mission
     */
    const handleNextMission = () => {
        if (!hasMissions) return;

        setSelectedMissionIndex((prev) => (prev === availableMissions.length - 1 ? 0 : prev + 1));
    };

    /**
     * Dismiss hardware warning and continue with mission
     */
    const handleContinueAnyway = () => {
        if (!selectedMission) return;

        setShowHardwareWarning(false);
        startMission(selectedMission.missionId);
        onClose();
    };

    // If the selector is not open, don't render anything
    if (!isOpen) {
        return null;
    }

    return (
        <Portal>
            <div className={styles.overlay}>
                <div className={styles.missionSelector}>
                    {/* Title and header */}
                    <div className={styles.header}>
                        <h2 className={styles.title}>{initialSetup ? "Choose Your Mode" : "Select Mission"}</h2>
                        {!initialSetup && (
                            <button
                                className={styles.closeButton}
                                onClick={onClose}
                                aria-label="Close mission selector"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* Main content */}
                    <div className={styles.content}>
                        {/* Initial setup mode selection */}
                        {initialSetup ? (
                            <div className={styles.sideByOptions}>
                                {/* Sandbox mode option */}
                                <div className={styles.modeCard}>
                                    <Gamepad2
                                        size={48}
                                        className={styles.modeIconLarge}
                                    />
                                    <h3 className={styles.modeTitle}>Sandbox Mode</h3>
                                    <p className={styles.modeDescription}>Create your own programs with full freedom.</p>
                                    <button
                                        className={styles.modeButton}
                                        onClick={handleSandboxMode}
                                    >
                                        <Play size={20} />
                                        Start Sandbox
                                    </button>
                                </div>

                                <div className={styles.separator}>
                                    <span>OR</span>
                                </div>

                                {/* Mission selection */}
                                <div className={styles.modeCard}>
                                    <Rocket
                                        size={48}
                                        className={styles.modeIconLarge}
                                    />
                                    <h3 className={styles.modeTitle}>Mission Mode</h3>
                                    <p className={styles.modeDescription}>Complete guided missions to learn programming.</p>

                                    <button
                                        className={styles.modeButton}
                                        onClick={handleStartMission}
                                        disabled={!selectedMission}
                                    >
                                        <Play size={20} />
                                        Start Mission
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.missionContainer}>
                                {/* Navigation buttons */}
                                <button
                                    className={`${styles.navButton} ${styles.prevButton}`}
                                    onClick={handlePrevMission}
                                    aria-label="Previous mission"
                                    disabled={!hasMissions}
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                {/* Mission card */}
                                {selectedMission ? (
                                    <div className={styles.missionCard}>
                                        <div className={styles.missionHeader}>
                                            <Rocket
                                                size={24}
                                                className={styles.missionIcon}
                                            />
                                            <h3 className={styles.missionTitle}>{selectedMission.title}</h3>
                                        </div>

                                        <div className={styles.missionInfo}>
                                            <p className={styles.missionDescription}>{selectedMission.description}</p>
                                        </div>

                                        <button
                                            className={styles.startButton}
                                            onClick={handleStartMission}
                                        >
                                            <Play size={20} />
                                            Go!
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.noMissionsCard}>
                                        <div className={styles.noMissionsIcon}>
                                            <Rocket size={48} />
                                        </div>
                                        <h3 className={styles.noMissionsTitle}>No Missions Available</h3>
                                        <p className={styles.noMissionsText}>No missions are currently available. Try sandbox mode instead.</p>
                                    </div>
                                )}

                                <button
                                    className={`${styles.navButton} ${styles.nextButton}`}
                                    onClick={handleNextMission}
                                    aria-label="Next mission"
                                    disabled={!hasMissions}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mission count indicator */}
                    {hasMissions && (
                        <div className={styles.missionIndicator}>
                            {availableMissions.map((_, index) => (
                                <div
                                    key={index}
                                    className={`${styles.indicatorDot} ${index === selectedMissionIndex ? styles.activeDot : ""}`}
                                    onClick={() => setSelectedMissionIndex(index)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Sandbox option when not in setup mode */}
                    {!initialSetup && (
                        <div className={styles.sandboxOption}>
                            <button
                                className={styles.sandboxButton}
                                onClick={handleSandboxMode}
                            >
                                <Gamepad2 size={16} />
                                Switch to Sandbox Mode
                            </button>

                            {/* New Project button */}
                            <button
                                className={styles.newProjectButton}
                                onClick={handleNewProject}
                            >
                                <FilePlus size={16} />
                                New Project
                            </button>
                        </div>
                    )}
                </div>

                {/* Hardware warning modal */}
                {showHardwareWarning && (
                    <div className={styles.warningModal}>
                        <div className={styles.warningContent}>
                            <AlertTriangle
                                size={48}
                                className={styles.warningIcon}
                            />

                            <h3 className={styles.warningTitle}>Missing Hardware</h3>

                            <p className={styles.warningText}>This mission requires the following hardware that isn't connected:</p>

                            <ul className={styles.hardwareList}>
                                {missingHardware.map((item, index) => (
                                    <li
                                        key={index}
                                        className={styles.hardwareItem}
                                    >
                                        {item === "motor" ? "Motor" : ""}
                                        {item === "button" ? "Force Sensor/Button" : ""}
                                    </li>
                                ))}
                            </ul>

                            <div className={styles.warningButtons}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={() => setShowHardwareWarning(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className={styles.continueButton}
                                    onClick={handleContinueAnyway}
                                >
                                    Continue Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Portal>
    );
};

export default MissionSelector;
