/**
 * @file CommandPanel.jsx
 * @description Primary interface for creating and configuring code actions,
 * providing action type selection and parameter configuration.
 * Updated to work with the Task Registry Mission System and dispatch events.
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
    Octagon,
    ArchiveRestore,
} from "lucide-react";

import styles from "../styles/FunctionDefault.module.css";
import { MotorDash } from "../dashboards/motor/components/MotorDash.jsx";
import { TimeDash } from "../dashboards/timer/components/TimeDash.jsx";
import { ButtonDash } from "../dashboards/button/components/ButtonDash.jsx";
import TypeSelector from "./TypeSelector";
import InstructionDescriptionPanel from "../instructions/components/InstructionDescriptionPanel";
import SubtypeSelector from "./SubtypeSelector";
import TaskInstructionPanel from "../../missions/components/TaskInstructionPanel";
import { useCustomization } from "../../../context/CustomizationContext";
import { speakWithRobotVoice } from "../../../common/utils/speechUtils";
import { useMission } from "../../../context/MissionContext.js";

const FilledOctagon = (props) => {
    return React.cloneElement(<Octagon />, { fill: "currentColor", ...props });
};

// Define the control types and their configurations
const CONTROL_TYPES = {
    action: {
        motor: {
            name: "Speed",
            component: MotorDash,
            icon: <RotateCw size={32} />,
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
            icon: <Timer size={32} />,
        },
        button: {
            // Updated - Kept subtype name but changed display name
            name: "Button", // Changed from "Force Sensor" to "Button"
            component: ButtonDash,
            icon: <ArchiveRestore size={32} />, // Using Disc icon for button
        },
    },
    special: {
        stop: {
            name: "Stop",
            component: null,
            icon: <FilledOctagon size={32} />,
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
 * @returns {JSX.Element} Complete command panel interface
 */
export const CommandPanel = ({
    currSlotNumber,
    onSlotUpdate,
    slotData,
    missionSteps,
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
        currentTaskIndex,
        isComponentVisible,
        isComponentEnabled,
        getPrefilledValue,
        isValueLocked,
        validateStepConfiguration,
        dispatchTaskEvent,
        setShowTestPrompt,
        // Task-level state and functions
        getCurrentTask,
        isTaskCompleted,
        requestHint,
    } = useMission();

    // Get current task for the mission
    const currentTask = getCurrentTask();
    const isCurrentTaskCompleted = currentTask
        ? isTaskCompleted(currentTaskIndex)
        : false;

    // Determine if we should show the task panel
    // Simply check if currentTask exists
    const showTaskPanel = currentTask !== null;

    // Determine if the current slot is the special stop step
    const isStopStep =
        slotData && slotData[currSlotNumber]?.isStopInstruction === true;

    // Determine if we should apply mission constraints to this slot
    const shouldApplyMissionConstraints =
        isMissionMode &&
        currentMission &&
        currentTask?.targetSlot === currSlotNumber;

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

    // Auto-save when configuration changes
    useEffect(() => {
        console.log("CommandPanel: dashboardConfig effect triggered", {
            hasConfig: !!dashboardConfig,
            currentSlot: currSlotNumber,
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
                    onSlotUpdate(instruction);
                    setLastSavedConfig(null);
                    setCurrentInstruction(instruction);
                } else {
                    // If no type/subtype, clear the slot entirely
                    onSlotUpdate(null);
                    setLastSavedConfig(null);
                    setCurrentInstruction(null);
                }
            }
            return;
        }

        // Check if the configuration has actually changed
        if (
            JSON.stringify(dashboardConfig) !== JSON.stringify(lastSavedConfig)
        ) {
            console.log("CommandPanel: Configuration changed, auto-saving...", {
                from: JSON.stringify(lastSavedConfig),
                to: JSON.stringify(dashboardConfig),
            });

            if (selectedType && selectedSubtype) {
                // Create the instruction
                const instruction = {
                    type: selectedType,
                    subtype: selectedSubtype,
                    configuration: dashboardConfig,
                };

                // In mission mode, validate against mission requirements
                if (shouldApplyMissionConstraints) {
                    const validation = validateStepConfiguration(instruction);
                    if (!validation.isValid) {
                        console.warn(
                            `CommandPanel: Configuration doesn't meet mission requirements: ${validation.message}`,
                        );
                        // We could add UI feedback here about the invalid configuration
                        // For now, we'll still allow it but could restrict it if needed
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
                setCurrentInstruction(instruction);

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
                <TypeSelector
                    selectedType={selectedType}
                    onTypeChange={handleTypeSelect}
                    disabled={
                        shouldApplyMissionConstraints &&
                        !isComponentVisible("type-selector")
                    }
                />
            ) : (
                <div className={styles.stopStepIndicator}>
                    <TypeSelector
                        selectedType={selectedType}
                        onTypeChange={handleTypeSelect}
                        disabled={true} // Always disabled for stop step
                    />
                    <FilledOctagon
                        size={80}
                        className={styles.stopIcon}
                    />
                    <h2 className={styles.stopText}>Stop</h2>
                </div>
            )}

            {/* Content area with two-column layout - only show for non-stop steps */}
            {selectedType && !isStopStep && (
                <div className={styles.contentContainer}>
                    {/* Left column - ACTION subtype or SENSE dashboard */}
                    <div className={styles.leftColumn}>
                        {selectedType === "action" ? (
                            <SubtypeSelector
                                controlTypes={CONTROL_TYPES}
                                selectedType={selectedType}
                                selectedSubtype={selectedSubtype}
                                onSubtypeSelect={handleSubtypeSelect}
                                disabled={
                                    shouldApplyMissionConstraints &&
                                    !isComponentVisible("subtype-selector")
                                }
                            />
                        ) : (
                            renderDashboard()
                        )}
                    </div>

                    {/* Right column - ACTION dashboard or SENSE subtype */}
                    <div className={styles.rightColumn}>
                        {selectedType === "action" ? (
                            renderDashboard()
                        ) : (
                            <SubtypeSelector
                                controlTypes={CONTROL_TYPES}
                                selectedType={selectedType}
                                selectedSubtype={selectedSubtype}
                                onSubtypeSelect={handleSubtypeSelect}
                                disabled={
                                    shouldApplyMissionConstraints &&
                                    !isComponentVisible("subtype-selector")
                                }
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Instruction Description Panel at bottom */}
            <InstructionDescriptionPanel
                instruction={currentInstruction}
                onPlayAudio={handlePlayAudio}
                slotNumber={currSlotNumber}
                // Add mission-specific instructions if available
                missionInstructions={currentTask?.instructions}
            />
        </div>
    );
};

export default CommandPanel;