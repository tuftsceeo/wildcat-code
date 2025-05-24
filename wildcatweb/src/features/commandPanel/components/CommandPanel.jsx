/**
 * @file CommandPanel.jsx
 * @description Primary interface for creating and configuring code actions,
 * providing action type selection and parameter configuration.
 * Updated to work with the Task Registry Mission System and dispatch events.
 * Enhanced with confirmation workflow to prevent accidental overwrites,
 * Edit button support for viewing mode, and unsaved changes communication.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
    Check,
    RefreshCcwDot,
    Plus,
    Zap,
    Disc,
    Lightbulb,
    RotateCw,
    Volume,
    Timer,
    Clock9,
    CircleStop,
    ArchiveRestore,
    Droplet,
    Edit3,
    ChevronRight,
    CircleArrowRight,
    CheckCircle,
} from "lucide-react";

import styles from "../styles/FunctionDefault.module.css";
import { MotorDash } from "../dashboards/motor/components/MotorDash.jsx";
import { TimeDash } from "../dashboards/timer/components/TimeDash.jsx";
import { ButtonDash } from "../dashboards/button/components/ButtonDash.jsx";
import { ColorSensorDash } from "../dashboards/colorSensor/components/ColorSensorDash.jsx";
import TypeSelector from "./TypeSelector";
import InstructionDescriptionPanel from "../instructions/components/InstructionDescriptionPanel";
import SubtypeSelector from "./SubtypeSelector";
import TaskInstructionPanel from "../../missions/components/TaskInstructionPanel";
import { useCustomization } from "../../../context/CustomizationContext";
import { speakWithRobotVoice } from "../../../common/utils/speechUtils";
import { useMission } from "../../../context/MissionContext.js";
import { useBLE } from "../../bluetooth/context/BLEContext";

const FilledCircleStop = (props) => {
    return React.cloneElement(<CircleStop />, {
        fill: "currentColor",
        ...props,
    });
};

// Define the control types and their configurations
const CONTROL_TYPES = {
    action: {
        motor: {
            name: "Speed",
            component: MotorDash,
            icon: <RotateCw className={styles.commandIcon} />,
        },
        // hub: {
        //     name: "Hub",
        //     component: null, // Will be implemented later
        //     icon: <Lightbulb size={20} />,
        // },
        // sound: {
        //     name: "Sound",
        //     component: null, // Will be implemented later
        //     icon: <Volume size={20} />,
        // },
    },
    input: {
        time: {
            name: "Wait",
            component: TimeDash,
            icon: <Timer className={styles.commandIcon} />,
        },
        button: {
            // Updated - Kept subtype name but changed display name
            name: "Button", // Changed from "Force Sensor" to "Button"
            component: ButtonDash,
            icon: (
                <ArchiveRestore
                    className={`${styles.commandIcon} ${styles.flippedVertically}`}
                />
            ), // Using Disc icon for button
        },
        color: {
            name: "Color",
            component: ColorSensorDash,
            icon: <Droplet className={styles.commandIcon} />,
        },
    },
    special: {
        stop: {
            name: "Stop",
            component: null,
            icon: <CircleStop className={styles.commandIcon} />,
        },
    },
};

/**
 * CommandPanel provides the interface for creating code actions
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.currSlotNumber - Current active slot number
 * @param {Function} props.onSlotUpdate - Callback function when slot configuration changes
 * @param {Array} props.slotData - Array of slot configurations
 * @param {number} props.missionSteps - Total number of steps including stop step
 * @param {boolean} props.isEditingMode - Whether currently in editing mode
 * @param {Function} props.onSaveAndExit - Callback for confirmation with auto-progression logic
 * @param {Function} props.onEnterEditingMode - Callback to enter editing mode from viewing mode
 * @param {Function} props.onUnsavedChangesUpdate - Callback to communicate unsaved changes status
 * @returns {JSX.Element} Complete command panel interface
 */
export const CommandPanel = ({
    currSlotNumber,
    onSlotUpdate,
    slotData,
    missionSteps,
    isEditingMode = false,
    onSaveAndExit,
    onEnterEditingMode,
    onUnsavedChangesUpdate,
}) => {
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSubtype, setSelectedSubtype] = useState(null);
    const [dashboardConfig, setDashboardConfig] = useState(null);
    const [lastSavedConfig, setLastSavedConfig] = useState(null);

    // Current instruction for the description panel
    const [currentInstruction, setCurrentInstruction] = useState(null);

    // Mission context for constraints and task tracking
    const {
        isMissionMode,
        currentMission,
        getCurrentTask,
        isTaskCompleted,
        completeTask,
        dispatchTaskEvent,
        validateStepConfiguration,
        isComponentVisible,
        isComponentEnabled,
        getPrefilledValue,
        isValueLocked,
        currentTaskIndex,
        requestHint,
    } = useMission();

    // Add state for test prompt
    const [showTestPrompt, setShowTestPrompt] = useState(false);

    // Get current task for the mission
    const currentTask = getCurrentTask();
    const isCurrentTaskCompleted = currentTask
        ? isTaskCompleted(currentTaskIndex)
        : false;

    // Determine if we should show the task panel
    // Simply check if currentTask exists
    const showTaskPanel = currentTask !== null;

    // Determine if the current slot is the special stop step
    const isStopStep = slotData?.[currSlotNumber]?.type === "special";

    // Determine if we should apply mission constraints to this slot
    const shouldApplyMissionConstraints =
        isMissionMode && currentMission && currentTask !== null;

    // Helper functions for confirmation system
    const hasValidConfiguration = !!(
        selectedType &&
        selectedSubtype &&
        dashboardConfig
    );

    // Improved unsaved changes detection
    const hasUnsavedChanges = (() => {
        // If we don't have a valid configuration, no changes to save
        if (!hasValidConfiguration) return false;

        // If lastSavedConfig is null but we have a configuration, that's an unsaved change
        if (lastSavedConfig === null && dashboardConfig !== null) return true;

        // Otherwise compare the stringified versions
        return (
            JSON.stringify(dashboardConfig) !== JSON.stringify(lastSavedConfig)
        );
    })();

    // Communicate unsaved changes status to parent
    useEffect(() => {
        if (onUnsavedChangesUpdate) {
            onUnsavedChangesUpdate(hasUnsavedChanges);
        }
    }, [hasUnsavedChanges, onUnsavedChangesUpdate]);

    /**
     * Get the appropriate button text based on next slot state
     * @returns {string} "Next" or "Done"
     */
    const getButtonText = () => {
        const nextSlotIndex = currSlotNumber + 1;

        // Check if next slot exists and is not a special slot (like stop)
        if (
            nextSlotIndex >= slotData.length ||
            slotData[nextSlotIndex]?.type === "special"
        ) {
            return "Done"; // No next configurable slot exists
        }

        // Check if next slot is unconfigured (empty)
        const nextSlot = slotData[nextSlotIndex];
        const isNextSlotEmpty = !(nextSlot?.type && nextSlot?.subtype);

        // Show "Next" only if next slot is empty (so we can progress to configure it)
        // Show "Done" if next slot is already configured (so we stay and return to viewing)
        return isNextSlotEmpty ? "Next" : "Done";
    };

    /**
     * Handle confirmation and save with improved state management
     */
    const handleConfirmAndSave = () => {
        const instruction = {
            type: selectedType,
            subtype: selectedSubtype,
            configuration: dashboardConfig,
        };

        const shouldProgress = getButtonText() === "Next";

        // Update last saved config immediately to prevent race conditions
        setLastSavedConfig(dashboardConfig);

        // Call the save and exit handler if provided
        if (onSaveAndExit) {
            onSaveAndExit(instruction, shouldProgress);
        } else {
            // Fallback to direct slot update for backward compatibility
            onSlotUpdate(instruction);
        }
    };

    /**
     * Handle entering editing mode for current configured step
     */
    const handleEditStep = () => {
        console.log(
            `CommandPanel: Entering editing mode for slot ${currSlotNumber}`,
        );
        if (onEnterEditingMode) {
            onEnterEditingMode();
        }
    };

    // Reset state when slot number changes
    useEffect(() => {
        console.log(`CommandPanel: Slot changed to ${currSlotNumber}`, {
            hasSlotData: !!slotData?.[currSlotNumber],
            slotData: JSON.stringify(slotData?.[currSlotNumber]),
            isStopStep: isStopStep,
        });

        const currentSlotData = slotData?.[currSlotNumber];
        if (currentSlotData && currentSlotData.type) {
            console.log(`CommandPanel: Loading slot ${currSlotNumber} data`, {
                type: currentSlotData.type,
                subtype: currentSlotData.subtype,
                config: JSON.stringify(currentSlotData.configuration),
            });

            setSelectedType(currentSlotData.type);
            setSelectedSubtype(currentSlotData.subtype);
            setDashboardConfig(currentSlotData.configuration);
            setLastSavedConfig(currentSlotData.configuration);

            // Set current instruction for description
            setCurrentInstruction(currentSlotData);
        } else if (shouldApplyMissionConstraints && currentTask) {
            // Apply mission preset type/subtype if available
            if (currentTask.requiredType) {
                console.log(
                    `CommandPanel: Applying mission preset type: ${currentTask.requiredType}`,
                );
                setSelectedType(currentTask.requiredType);

                // If subtype is also specified, apply it too
                if (currentTask.requiredSubtype) {
                    console.log(
                        `CommandPanel: Applying mission preset subtype: ${currentTask.requiredSubtype}`,
                    );
                    setSelectedSubtype(currentTask.requiredSubtype);
                }
            }
        } else {
            // Reset everything when there's no valid slot data
            console.log(
                `CommandPanel: No valid data for slot ${currSlotNumber}, resetting state`,
            );

            setSelectedType(null);
            setSelectedSubtype(null);
            setDashboardConfig(null);
            setLastSavedConfig(null);
            setCurrentInstruction(null);
        }
    }, [
        currSlotNumber,
        slotData,
        isStopStep,
        shouldApplyMissionConstraints,
        currentTask,
    ]);

    // Modified auto-save logic - only save when not in editing mode or when explicitly confirmed
    useEffect(() => {
        console.log("CommandPanel: dashboardConfig effect triggered", {
            hasConfig: !!dashboardConfig,
            currentSlot: currSlotNumber,
            isEditingMode: isEditingMode,
        });

        if (!dashboardConfig) {
            console.log(
                "CommandPanel: No dashboard config, checking if we need to update",
            );

            // If we had a previous config but it was nullified, we should update the slot
            if (lastSavedConfig) {
                console.log(
                    "CommandPanel: Config was cleared, updating slot to null",
                );

                if (selectedType && selectedSubtype) {
                    // Create an instruction with null configuration
                    const instruction = {
                        type: selectedType,
                        subtype: selectedSubtype,
                        configuration: null,
                    };

                    // Only auto-save if not in editing mode
                    if (!isEditingMode) {
                        onSlotUpdate(instruction);
                        setLastSavedConfig(null);
                    }
                    setCurrentInstruction(instruction);
                } else {
                    // If no type/subtype, clear the slot entirely
                    if (!isEditingMode) {
                        onSlotUpdate(null);
                        setLastSavedConfig(null);
                    }
                    setCurrentInstruction(null);
                }
            }
            return;
        }

        // Check if the configuration has actually changed
        if (
            JSON.stringify(dashboardConfig) !== JSON.stringify(lastSavedConfig)
        ) {
            console.log("CommandPanel: Configuration changed", {
                from: JSON.stringify(lastSavedConfig),
                to: JSON.stringify(dashboardConfig),
                isEditingMode: isEditingMode,
            });

            if (selectedType && selectedSubtype) {
                // Create the instruction
                const instruction = {
                    type: selectedType,
                    subtype: selectedSubtype,
                    configuration: dashboardConfig,
                };

                // Always update currentInstruction for preview
                setCurrentInstruction(instruction);

                // Only auto-save if NOT in editing mode
                if (!isEditingMode) {
                    // In mission mode, validate against mission requirements
                    if (shouldApplyMissionConstraints) {
                        const validation =
                            validateStepConfiguration(instruction);
                        if (!validation.isValid) {
                            console.warn(
                                `CommandPanel: Configuration doesn't meet mission requirements: ${validation.message}`,
                            );
                            // We could add UI feedback here about the invalid configuration
                            // For now, we'll still allow it but could restrict it if needed
                        } else if (
                            currentTask?.type === "MOTOR_CONFIGURATION"
                        ) {
                            // Complete the task if it's a motor configuration task and the configuration is valid
                            console.log(
                                "CommandPanel: Motor configuration meets requirements, completing task",
                            );
                            completeTask(currentTaskIndex, {
                                configuration: instruction.configuration,
                            });
                        } else if (currentTask?.type === "TIMER_SETTING") {
                            // Complete the task if it's a timer setting task and the configuration is valid
                            console.log(
                                "CommandPanel: Timer configuration meets requirements, completing task",
                            );
                            completeTask(currentTaskIndex, {
                                configuration: instruction.configuration,
                            });
                        }
                    }

                    // Update slot and set current instruction
                    console.log(
                        "CommandPanel: Calling onSlotUpdate with instruction",
                        {
                            instruction: JSON.stringify(instruction),
                            slot: currSlotNumber,
                        },
                    );

                    onSlotUpdate(instruction);
                    setLastSavedConfig(dashboardConfig);

                    // Check if we should show the test prompt for this mission step
                    if (
                        shouldApplyMissionConstraints &&
                        currentTask?.testPrompt?.showPrompt
                    ) {
                        setShowTestPrompt(true);
                    }

                    // Dispatch configuration changed event for mission tracking
                    if (isMissionMode) {
                        dispatchTaskEvent("CONFIGURATION_CHANGED", {
                            slotIndex: currSlotNumber,
                            configType: selectedType,
                            configSubtype: selectedSubtype,
                            configuration: dashboardConfig,
                            currentSlot: currSlotNumber,
                        });
                    }
                }
            }
        }
    }, [
        dashboardConfig,
        lastSavedConfig,
        selectedType,
        selectedSubtype,
        onSlotUpdate,
        currSlotNumber,
        shouldApplyMissionConstraints,
        currentTask,
        validateStepConfiguration,
        setShowTestPrompt,
        isMissionMode,
        dispatchTaskEvent,
        completeTask,
        currentTaskIndex,
        isEditingMode, // Added to dependencies
    ]);

    // Handle updates from the dashboard components
    const handleDashboardUpdate = useCallback(
        (config) => {
            console.log("CommandPanel: Dashboard update received", {
                config: JSON.stringify(config),
                previousConfig: JSON.stringify(dashboardConfig),
                selectedType,
                selectedSubtype,
            });

            setDashboardConfig(config);
        },
        [dashboardConfig, selectedType, selectedSubtype],
    );

    // Handle type selection
    const handleTypeSelect = (type) => {
        // Check if this selection is allowed in mission mode
        if (
            shouldApplyMissionConstraints &&
            currentTask?.requiredType &&
            type !== currentTask.requiredType
        ) {
            // Type is restricted in this mission step
            console.warn(
                `CommandPanel: Type ${type} is not allowed in this mission step. Required: ${currentTask.requiredType}`,
            );
            return; // Don't allow changing to an invalid type
        }

        if (type !== selectedType) {
            console.log(
                `CommandPanel: Type changed from ${selectedType} to ${type}`,
            );

            setSelectedType(type);
            setSelectedSubtype(null);
            setDashboardConfig(null);
            setLastSavedConfig(null);
            setCurrentInstruction(null);

            // Dispatch type selection event for mission tracking
            if (isMissionMode) {
                dispatchTaskEvent(
                    type === "action"
                        ? "ACTION_TYPE_SELECTED"
                        : "INPUT_TYPE_SELECTED",
                    {
                        slotIndex: currSlotNumber,
                        type: type,
                        currentSlot: currSlotNumber,
                    },
                );

                // Complete the SELECT_INPUT_TYPE task if the user clicked SENSE
                if (
                    currentTask?.type === "SELECT_INPUT_TYPE" &&
                    type === "input"
                ) {
                    console.log(
                        "CommandPanel: Input type selected, completing task",
                    );
                    completeTask(currentTaskIndex, {
                        selectedType: type,
                    });
                }
            }
        }
    };

    // Handle subtype selection
    const handleSubtypeSelect = (subtype) => {
        // Check if this selection is allowed in mission mode
        if (
            shouldApplyMissionConstraints &&
            currentTask?.requiredSubtype &&
            subtype !== currentTask.requiredSubtype
        ) {
            // Subtype is restricted in this mission step
            console.warn(
                `CommandPanel: Subtype ${subtype} is not allowed in this mission step. Required: ${currentTask.requiredSubtype}`,
            );
            return; // Don't allow changing to an invalid subtype
        }

        console.log(
            `CommandPanel: Subtype changed from ${selectedSubtype} to ${subtype}`,
        );

        setSelectedSubtype(subtype);
        setDashboardConfig(null);
        setLastSavedConfig(null);
        setCurrentInstruction(null);

        // Apply prefilled values from mission if available
        if (
            shouldApplyMissionConstraints &&
            currentTask?.uiRestrictions?.prefilledValues
        ) {
            const prefills = currentTask.uiRestrictions.prefilledValues;
            if (Object.keys(prefills).length > 0) {
                // Create a basic configuration with prefilled values
                setDashboardConfig(prefills);
            }
        }

        // Dispatch subtype selection event for mission tracking
        if (isMissionMode) {
            dispatchTaskEvent("SUBTYPE_SELECTED", {
                slotIndex: currSlotNumber,
                type: selectedType,
                subtype: subtype,
                currentSlot: currSlotNumber,
            });
        }
    };

    // Get voice settings from context
    const { language, voice, volume } = useCustomization();

    // Play the audio description with the selected robot voice
    const handlePlayAudio = (text) => {
        const languageCode = language === "es" ? "es-ES" : "en-US";
        speakWithRobotVoice(text, voice, volume, languageCode);
    };

    // Handle requesting a hint
    const handleHintRequest = () => {
        if (requestHint) {
            requestHint();
        }
    };

    // Render the dashboard based on selected subtype
    const renderDashboard = () => {
        // Basic checks to avoid accessing undefined objects
        if (!selectedType || !selectedSubtype) {
            return <div className={styles.dashboardPlaceholder}></div>;
        }

        // Additional safety check for the CONTROL_TYPES structure
        if (
            !CONTROL_TYPES[selectedType] ||
            !CONTROL_TYPES[selectedType][selectedSubtype]
        ) {
            console.error(
                `Invalid control type: ${selectedType}/${selectedSubtype}`,
            );
            return <div className={styles.dashboardPlaceholder}></div>;
        }

        // Check if the component exists before trying to render it
        const componentToRender =
            CONTROL_TYPES[selectedType][selectedSubtype].component;
        if (!componentToRender) {
            return <div className={styles.dashboardPlaceholder}></div>;
        }

        return (
            <div
                className={styles.dashboardContainer}
                data-control-type={selectedSubtype || "default"}
            >
                {React.createElement(componentToRender, {
                    onUpdate: handleDashboardUpdate,
                    configuration: dashboardConfig,
                    slotData: slotData,
                    currSlotNumber: currSlotNumber,
                    // Pass mission-related props
                    isMissionMode: shouldApplyMissionConstraints,
                    missionStep: currentTask,
                    getPrefilledValue: getPrefilledValue,
                    isValueLocked: isValueLocked,
                    // Pass event dispatcher for components to use
                    dispatchTaskEvent: dispatchTaskEvent,
                })}
            </div>
        );
    };

    return (
        <div className={styles.hubTopBackground}>
            {/* Add TaskInstructionPanel at the top if in mission mode */}
            {showTaskPanel && (
                <TaskInstructionPanel
                    task={currentTask}
                    taskIndex={currentTaskIndex}
                    isCompleted={isCurrentTaskCompleted}
                    onRequestHint={handleHintRequest}
                />
            )}

            {/* Type Selector (ACTION/SENSE) or Stop indicator for stop step */}
            {!isStopStep ? (
                // Only show type selector in editing mode, but maintain space in viewing mode
                isEditingMode ? (
                    (shouldApplyMissionConstraints &&
                        isComponentVisible("type-selector")) ||
                    !shouldApplyMissionConstraints ? (
                        <TypeSelector
                            selectedType={selectedType}
                            onTypeChange={handleTypeSelect}
                            disabled={
                                shouldApplyMissionConstraints &&
                                !isComponentEnabled("type-selector")
                            }
                        />
                    ) : null
                ) : (
                    // Placeholder spacer to maintain layout when type selector is hidden
                    <div className={styles.typeSelectorSpacer}></div>
                )
            ) : (
                <div className={styles.stopStepIndicator}>
                    <CircleStop
                        size={80}
                        className={styles.stopIcon}
                    />
                    <h2 className={styles.stopText}>Stop</h2>
                </div>
            )}

            {/* Content area with two-column layout - show in editing mode, or spacer in viewing mode */}
            {!isStopStep &&
                (isEditingMode && selectedType ? (
                    <div className={styles.contentContainer}>
                        {/* Left column - ACTION subtype or SENSE dashboard */}
                        <div className={styles.leftColumn}>
                            {selectedType === "action" ? (
                                (shouldApplyMissionConstraints &&
                                    isComponentVisible("subtype-selector")) ||
                                !shouldApplyMissionConstraints ? (
                                    <SubtypeSelector
                                        controlTypes={CONTROL_TYPES}
                                        selectedType={selectedType}
                                        selectedSubtype={selectedSubtype}
                                        onSubtypeSelect={handleSubtypeSelect}
                                        disabled={
                                            shouldApplyMissionConstraints &&
                                            !isComponentEnabled(
                                                "subtype-selector",
                                            )
                                        }
                                    />
                                ) : null
                            ) : (
                                renderDashboard()
                            )}
                        </div>

                        {/* Right column - ACTION dashboard or SENSE subtype */}
                        <div className={styles.rightColumn}>
                            {selectedType === "action" ? (
                                renderDashboard()
                            ) : (shouldApplyMissionConstraints &&
                                  isComponentVisible("subtype-selector")) ||
                              !shouldApplyMissionConstraints ? (
                                <SubtypeSelector
                                    controlTypes={CONTROL_TYPES}
                                    selectedType={selectedType}
                                    selectedSubtype={selectedSubtype}
                                    onSubtypeSelect={handleSubtypeSelect}
                                    disabled={
                                        shouldApplyMissionConstraints &&
                                        !isComponentEnabled("subtype-selector")
                                    }
                                />
                            ) : null}
                        </div>
                    </div>
                ) : (
                    // Placeholder spacer to maintain layout when content is hidden
                    !isEditingMode && (
                        <div className={styles.contentSpacer}></div>
                    )
                ))}

            {/* Edit button - positioned where confirmation button would be - only show in viewing mode */}
            {!isEditingMode && hasValidConfiguration && !isStopStep && (
                <div className={styles.confirmationContainer}>
                    <button
                        className={`${styles.confirmButton} ${styles.editButton}`}
                        onClick={handleEditStep}
                        aria-label="Edit current step configuration"
                    >
                        <Edit3 className={styles.buttonIcon} />
                        Edit Step
                    </button>
                </div>
            )}

            {/* Confirmation button - positioned between content and description panel - only show in editing mode */}
            {isEditingMode && hasValidConfiguration && (
                <div className={styles.confirmationContainer}>
                    <button
                        className={`${styles.confirmButton} ${
                            hasUnsavedChanges
                                ? styles.confirmButtonEnabled
                                : styles.confirmButtonDisabled
                        }`}
                        onClick={handleConfirmAndSave}
                        disabled={!hasUnsavedChanges}
                    >
                        {getButtonText() === "Next" ? (
                            <CircleArrowRight className={styles.buttonIcon} />
                        ) : (
                            <CheckCircle className={styles.buttonIcon} />
                        )}
                        {getButtonText()}
                    </button>
                </div>
            )}

            {/* Instruction Description Panel at bottom */}
            <InstructionDescriptionPanel
                instruction={
                    isStopStep
                        ? {
                              type: "special",
                              subtype: "stop",
                              description:
                                  "This step will stop all motors when the program ends.",
                          }
                        : currentInstruction
                }
                onPlayAudio={handlePlayAudio}
                slotNumber={currSlotNumber}
                // Add mission-specific instructions if available
                missionInstructions={currentTask?.instructions}
            />
        </div>
    );
};

export default CommandPanel;
