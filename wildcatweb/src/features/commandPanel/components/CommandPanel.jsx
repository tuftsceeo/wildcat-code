/**
 * @file CommandPanel.jsx
 * @description Primary interface for creating and configuring code actions,
 * providing action type selection and parameter configuration.
 * Enhanced with Phase 2 configuration management including discard functionality
 * and execution state awareness for modal coordination.
 * FIXED: Edit button now accessible during playback with proper modal integration.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
    LaptopMinimalCheck,
    StepForward,
    RotateCw,
    Timer,
    CircleStop,
    ArchiveRestore,
    Droplet,
    Edit3,
    CheckCircle,
    CircleAlert,
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
import { generateSlotCode } from "../../../code-generation/codeGenerator";
import {
    ClearSlotRequest,
    ClearSlotResponse,
} from "../../bluetooth/ble_resources/messages";
import { Buffer } from "buffer";

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
    },
    input: {
        time: {
            name: "Wait",
            component: TimeDash,
            icon: <Timer className={styles.commandIcon} />,
        },
        button: {
            name: "Button",
            component: ButtonDash,
            icon: (
                <ArchiveRestore
                    className={`${styles.commandIcon} ${styles.flippedVertically}`}
                />
            ),
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
 * CommandPanel provides the interface for creating code actions with Phase 2 enhancements
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
 * @param {boolean} props.triggerSave - External trigger to force save operation
 * @param {boolean} props.isRunning - Whether program is currently running (Phase 2)
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
    triggerSave = false,
    isRunning = false,
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

    // Get BLE context for testing functionality
    const { ble, isConnected, portStates, checkDisconnectedDevices } = useBLE();

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

    /**
     * Phase 2: Handle discarding changes to revert to saved slot configuration
     * This restores the control panel to the last saved state
     */
    const handleDiscardChanges = useCallback(() => {
        console.log(
            "CommandPanel: Discarding changes and reverting to saved state",
        );

        const currentSlotData = slotData?.[currSlotNumber];

        if (currentSlotData && currentSlotData.type) {
            // Revert to saved slot configuration
            console.log(
                "CommandPanel: Reverting to saved slot data:",
                currentSlotData,
            );

            setSelectedType(currentSlotData.type);
            setSelectedSubtype(currentSlotData.subtype);
            setDashboardConfig(currentSlotData.configuration);
            setLastSavedConfig(currentSlotData.configuration);
            setCurrentInstruction(currentSlotData);
        } else {
            // No saved configuration, clear everything
            console.log(
                "CommandPanel: No saved configuration, clearing all fields",
            );

            setSelectedType(null);
            setSelectedSubtype(null);
            setDashboardConfig(null);
            setLastSavedConfig(null);
            setCurrentInstruction(null);
        }
    }, [slotData, currSlotNumber]);

    /**
     * Phase 2: Listen for discard events from App.js
     */
    useEffect(() => {
        const handleDiscardEvent = () => {
            handleDiscardChanges();
        };

        window.addEventListener("discardChanges", handleDiscardEvent);

        return () => {
            window.removeEventListener("discardChanges", handleDiscardEvent);
        };
    }, [handleDiscardChanges]);

    /**
     * Check if the current configuration has device connectivity issues
     * @returns {boolean} True if there are disconnected devices for current config
     */
    const hasDeviceWarnings = () => {
        if (!hasValidConfiguration || !isConnected) return false;

        // Create temporary instruction object from current control panel state
        const tempInstruction = {
            type: selectedType,
            subtype: selectedSubtype,
            configuration: dashboardConfig,
        };

        // Check for disconnected devices using BLE context function
        const disconnectedDevices = checkDisconnectedDevices([tempInstruction]);
        return disconnectedDevices.length > 0;
    };

    // Communicate unsaved changes status to parent
    useEffect(() => {
        if (onUnsavedChangesUpdate) {
            onUnsavedChangesUpdate(hasUnsavedChanges);
        }
    }, [hasUnsavedChanges, onUnsavedChangesUpdate]);

    // Handle external save trigger (e.g., from "Save & Continue" modal)
    useEffect(() => {
        if (triggerSave && hasValidConfiguration && hasUnsavedChanges) {
            console.log("CommandPanel: External save trigger activated");
            handleConfirmAndSave();
        }
    }, [triggerSave, hasValidConfiguration, hasUnsavedChanges]);

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
     * Handle testing the current control panel configuration
     */
    const handleTestCurrentConfig = async () => {
        try {
            // Check if the robot is connected
            if (!isConnected) {
                console.warn(
                    "Robot not connected. Please connect via Bluetooth first.",
                );
                return;
            }

            // Make sure we have a valid configuration to test
            if (!hasValidConfiguration) {
                console.warn("No valid configuration to test");
                return;
            }

            // Create instruction object from current control panel state
            const tempInstruction = {
                type: selectedType,
                subtype: selectedSubtype,
                configuration: dashboardConfig,
            };

            console.log(
                "CommandPanel: Testing current configuration:",
                tempInstruction,
            );

            // In mission mode, validate the instruction against mission requirements
            if (
                shouldApplyMissionConstraints &&
                currentTask?.targetSlot === currSlotNumber
            ) {
                const validation = validateStepConfiguration(tempInstruction);
                if (!validation.isValid) {
                    console.warn(
                        "Configuration doesn't meet mission requirements:",
                        validation.message,
                    );
                    return;
                }
            }

            // Generate code specifically for this instruction
            const code = generateSlotCode(tempInstruction, portStates);
            console.log("CommandPanel: Generated Python Code for test:", code);

            // Clear the program slot on the robot
            const clearResponse = await ble.sendRequest(
                new ClearSlotRequest(0),
                ClearSlotResponse,
            );

            if (!clearResponse.success) {
                console.warn("Failed to clear program slot");
                return;
            }

            // Upload and transfer the program
            await ble.uploadProgramFile(
                "program.py",
                0,
                Buffer.from(code, "utf-8"),
            );

            // Start the program on the robot
            await ble.startProgram(0);

            // Dispatch test execution event for mission tracking if applicable
            if (isMissionMode && currentTask?.type === "TEST_EXECUTION") {
                console.log(
                    "CommandPanel: Test execution successful, completing task",
                );
                dispatchTaskEvent("TEST_EXECUTION", {
                    slotIndex: currSlotNumber,
                    instruction: tempInstruction,
                    currentSlot: currSlotNumber,
                });
            }
        } catch (error) {
            console.error("CommandPanel: Error running test program:", error);
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

    // Update instruction display whenever configuration changes (for live preview)
    useEffect(() => {
        console.log(
            "CommandPanel: Configuration changed - updating instruction display",
            {
                hasConfig: !!dashboardConfig,
                currentSlot: currSlotNumber,
                selectedType,
                selectedSubtype,
            },
        );

        if (selectedType && selectedSubtype && dashboardConfig) {
            // Create instruction for display purposes
            const instruction = {
                type: selectedType,
                subtype: selectedSubtype,
                configuration: dashboardConfig,
            };

            // Always update instruction display for live preview
            setCurrentInstruction(instruction);

            console.log("CommandPanel: Updated instruction display", {
                instruction: JSON.stringify(instruction),
            });
        } else {
            // Clear instruction display if configuration is incomplete
            setCurrentInstruction(null);
            console.log(
                "CommandPanel: Cleared instruction display (incomplete config)",
            );
        }
    }, [selectedType, selectedSubtype, dashboardConfig, currSlotNumber]);

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

            {/* FIXED: Edit button - now accessible during playback, will trigger modal */}
            {!isEditingMode && hasValidConfiguration && !isStopStep && (
                <div className={styles.confirmationContainer}>
                    <button
                        className={`${styles.confirmButton} ${styles.editButton}`}
                        onClick={handleEditStep}
                        aria-label="Edit current step configuration"
                        disabled={false} // Always enabled - modal will handle execution state
                    >
                        <Edit3 className={styles.buttonIcon} />
                        Edit Step
                    </button>
                </div>
            )}

            {/* Button container - only show in editing mode with valid configuration */}
            {isEditingMode && hasValidConfiguration && (
                <div className={styles.confirmationContainer}>
                    {/* Test button - left side */}
                    <button
                        className={`${styles.testButton} ${
                            hasDeviceWarnings() ? styles.testButtonWarning : ""
                        }`}
                        onClick={handleTestCurrentConfig}
                        disabled={!isConnected || !hasValidConfiguration}
                        aria-label="Test current configuration"
                    >
                        <StepForward className={styles.buttonIcon} />
                        Test
                        {/* Warning corner badge when device is disconnected */}
                        {hasDeviceWarnings() && (
                            <div
                                className={`${styles.cornerBadge} ${styles.warning}`}
                            >
                                <CircleAlert
                                    className={`${styles.cornerIcon} ${styles.warning}`}
                                    strokeWidth={2}
                                />
                            </div>
                        )}
                    </button>

                    {/* Done/Next button - right side */}
                    <button
                        className={`${styles.confirmButton} ${styles.confirmButtonEnabled}`}
                        onClick={handleConfirmAndSave}
                        disabled={!hasValidConfiguration}
                        aria-label={`${getButtonText()} - ${
                            hasUnsavedChanges ? "Save changes and" : ""
                        } ${
                            getButtonText() === "Next"
                                ? "continue to next step"
                                : "exit editing mode"
                        }`}
                    >
                        {getButtonText() === "Next" ? (
                            <LaptopMinimalCheck className={styles.buttonIcon} />
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
