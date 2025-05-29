/**
 * @file RunMenu.jsx
 * @description Side panel for navigating and executing code, with support for
 * running individual slots or the complete program. Enhanced with Phase 2 progress
 * visualization including continuous vertical progress channel and execution state coordination.
 * Updated to delegate execution control to App.js for modal coordination.
 * FIXED: Continuous progress channel with static segments, separated from draggable step buttons.
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "../styles/RunMenu.module.css";
import { generatePythonCode } from "../../../code-generation/codeGenerator.js";
import { useBLE } from "../../bluetooth/context/BLEContext";
import { useCustomization } from "../../../context/CustomizationContext";
import { useMission } from "../../../context/MissionContext.js";
import { Buffer } from "buffer";
import { ReactComponent as QuestionMarkIcon } from "../../../assets/images/question-mark.svg";
import {
    ClearSlotRequest,
    ClearSlotResponse,
} from "../../../features/bluetooth/ble_resources/messages";
import {
    CircleCheckBig,
    CircleStop,
    CircleAlert,
    RotateCw,
    ArchiveRestore,
    ArchiveX,
    Timer,
    Plus,
    ChevronDown,
    Play,
    Droplet,
    Snail,
    Turtle,
    Rabbit,
    Pencil,
    Square,
    GripVertical,
} from "lucide-react";
import DraggableStepButton from "./DraggableStepButton";

// Debug logging toggle - set to false to reduce console noise
const DEBUG_RUN_MENU = false;

const FilledCircleStop = (props) => {
    return React.cloneElement(<CircleStop />, {
        fill: "#EB3327",
        stroke: "white",
        ...props,
    });
};

const COLOR_MAPPING = {
    black: "#000000",
    pink: "#D432A3",
    purple: "#8A2BE2",
    blue: "#3C90EE",
    azure: "#93E6FC",
    teal: "#40E0D0",
    green: "#4BA551",
    yellow: "#FBE376",
    orange: "#FFA500",
    red: "#EB3327",
    white: "#FFFFFF",
    unknown: "#FFFFFF",
};

/**
 * Mapping from instruction type/subtype to display info
 * Provides the name and icon to show on completed step buttons
 */
const INSTRUCTION_DISPLAY = {
    action: {
        motor: {
            name: "Speed",
            icon: <RotateCw className={styles.commandIcon} />,
        },
    },
    input: {
        time: {
            name: "Wait",
            icon: <Timer className={styles.commandIcon} />,
        },
        button: {
            name: "Button",
            icon: <ArchiveRestore className={styles.commandIcon} />,
        },
        color: {
            name: "Color",
            icon: <Droplet className={styles.commandIcon} />,
        },
    },
    special: {
        stop: {
            name: "Stop",
            icon: <FilledCircleStop className={styles.commandIcon} />,
        },
    },
};

/**
 * RunMenu component for navigating and executing code with Phase 2 progress visualization
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.pyCode - Generated Python code
 * @param {boolean} props.canRun - Whether code is executable
 * @param {number} props.currSlotNumber - Current selected slot
 * @param {Function} props.setCurrSlotNumber - Function to set current slot
 * @param {number} props.missionSteps - Total number of mission steps
 * @param {Array} props.slotData - Data for all coding slots
 * @param {boolean} props.isEditingMode - Whether currently in editing mode
 * @param {Function} props.onStepClick - Handler for step button clicks
 * @param {Function} props.onPlayButtonClick - Handler for play button clicks (Phase 2)
 * @param {boolean} props.isRunning - Whether program is currently running (Phase 2)
 * @param {number|null} props.currentlyExecutingStep - Currently executing step index (Phase 2)
 * @returns {JSX.Element} RunMenu component
 */
export const RunMenu = ({
    pyCode,
    canRun,
    currSlotNumber,
    setCurrSlotNumber,
    missionSteps,
    slotData,
    isEditingMode = false,
    onStepClick,
    onPlayButtonClick,
    isRunning = false,
    currentlyExecutingStep = null,
}) => {
    if (DEBUG_RUN_MENU) {
        console.log("RunMenu: Rendering with missionSteps =", missionSteps);
    }

    const {
        ble,
        isConnected,
        stopRunningProgram,
        portStates,
        DEVICE_TYPES,
        checkDisconnectedDevices,
    } = useBLE();

    // Get user preferences from CustomizationContext
    const {
        requireSequentialCompletion,
        useCommandLabels,
        stepCount,
        setStepCount,
        MAX_STEPS,
    } = useCustomization();

    // Get mission context
    const {
        isMissionMode,
        currentMission,
        dispatchTaskEvent,
        isTaskCompleted,
    } = useMission();

    // Add state to track when reordering is in progress
    const [isReordering, setIsReordering] = useState(false);
    const [isScrollable, setIsScrollable] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);

    /**
     * Run all slots sequentially - now delegates to RunMenu for actual execution
     */
    const handleRunAllSlots = useCallback(async () => {
        try {
            if (!isConnected) {
                console.warn(
                    "Robot not connected. Please connect via Bluetooth first.",
                );
                return;
            }

            const code = generatePythonCode(slotData, portStates);

            if (DEBUG_RUN_MENU) {
                console.log(
                    "RunMenu: Generated Python Code for all slots:",
                    code,
                );
            }

            // Clear the program slot
            const clearResponse = await ble.sendRequest(
                new ClearSlotRequest(0),
                ClearSlotResponse,
            );

            if (!clearResponse.success) {
                console.warn("RunMenu: Failed to clear program slot");
            }

            // Upload and transfer the program
            await ble.uploadProgramFile(
                "program.py",
                0,
                Buffer.from(code, "utf-8"),
            );

            // Start the program
            await ble.startProgram(0);

            // Dispatch run program event for mission tracking
            if (isMissionMode) {
                if (DEBUG_RUN_MENU) {
                    console.log("RunMenu: Dispatching RUN_PROGRAM event", {
                        slots: slotData.length,
                        currentSlot: currSlotNumber,
                        isMissionMode,
                        currentMission: currentMission,
                    });
                }

                dispatchTaskEvent("RUN_PROGRAM", {
                    slots: slotData.length,
                    currentSlot: currSlotNumber,
                    type: "RUN_PROGRAM",
                });
            }
        } catch (error) {
            console.error("RunMenu: Error running program:", error);
        }
    }, [
        isConnected,
        slotData,
        portStates,
        ble,
        isMissionMode,
        currentMission,
        currSlotNumber,
        dispatchTaskEvent,
    ]);

    /**
     * Stop the currently running program
     */
    const handleStopProgram = useCallback(async () => {
        try {
            if (DEBUG_RUN_MENU) {
                console.log("RunMenu: Stop button clicked");
            }

            const success = await stopRunningProgram();

            if (!success) {
                console.warn(
                    "RunMenu: Stop command may have failed, but will wait for program flow notification",
                );
            }
        } catch (error) {
            console.error("RunMenu: Error stopping program:", error);
        }
    }, [stopRunningProgram]);

    // Phase 2: Listen for execution events from App.js
    useEffect(() => {
        const handleExecuteProgram = () => {
            handleRunAllSlots();
        };

        const handleStopProgramEvent = () => {
            handleStopProgram();
        };

        window.addEventListener("executeProgram", handleExecuteProgram);
        window.addEventListener("stopProgram", handleStopProgramEvent);

        return () => {
            window.removeEventListener("executeProgram", handleExecuteProgram);
            window.removeEventListener("stopProgram", handleStopProgramEvent);
        };
    }, [handleRunAllSlots, handleStopProgram]); // ← Depend on memoized functions

    // Verify slotData consistency - should now match missionSteps exactly with Option B
    useEffect(() => {
        if (slotData && slotData.length !== missionSteps) {
            if (DEBUG_RUN_MENU) {
                console.warn(
                    "RunMenu: Inconsistency detected - slotData length doesn't match missionSteps",
                    { slotDataLength: slotData.length, missionSteps },
                );
            }
        }
    }, [missionSteps, slotData]);

    // Check if content is scrollable
    useEffect(() => {
        const checkScrollable = () => {
            const menuElement = document.querySelector(
                `.${styles.menuContent}`,
            );
            if (menuElement) {
                const { scrollHeight, clientHeight } = menuElement;
                setIsScrollable(scrollHeight > clientHeight);
            }
        };

        // Check initially and after content changes
        checkScrollable();
        const observer = new ResizeObserver(checkScrollable);
        const menuElement = document.querySelector(`.${styles.menuContent}`);
        if (menuElement) {
            observer.observe(menuElement);
        }

        return () => observer.disconnect();
    }, [missionSteps, slotData]); // Recheck when steps or data changes

    // Check if we're at the bottom of the content
    useEffect(() => {
        const handleScroll = () => {
            const menuElement = document.querySelector(
                `.${styles.menuContent}`,
            );
            if (menuElement) {
                const { scrollTop, scrollHeight, clientHeight } = menuElement;
                // Add a small threshold to account for rounding errors
                const threshold = 2;
                const remainingScroll = scrollHeight - scrollTop - clientHeight;
                const isBottom = remainingScroll <= threshold;
                setIsAtBottom(isBottom);
            }
        };

        const menuElement = document.querySelector(`.${styles.menuContent}`);
        if (menuElement) {
            menuElement.addEventListener("scroll", handleScroll);
            // Check initial position
            handleScroll();
            return () =>
                menuElement.removeEventListener("scroll", handleScroll);
        }
    }, []);

    /**
     * Phase 2: Get progress state for a step based on execution status
     * @param {number} stepIndex - Index of the step to check
     * @returns {string} Progress state: 'completed', 'current', 'upcoming', 'idle'
     */
    const getProgressState = (stepIndex) => {
        const slot = slotData[stepIndex];
        const isStopStep = slot?.type === "special";

        // Stop step doesn't have progress visualization
        if (isStopStep) return "none";

        // Always show progress channel (persistent), but different states during execution
        if (!isRunning) return "idle";

        // Currently executing
        if (currentlyExecutingStep === stepIndex) return "current";

        // Completed (executed before current)
        if (
            currentlyExecutingStep !== null &&
            stepIndex < currentlyExecutingStep
        )
            return "completed";

        // Upcoming (will execute after current)
        if (
            currentlyExecutingStep !== null &&
            stepIndex > currentlyExecutingStep
        )
            return "upcoming";

        return "idle";
    };

    /**
     * Determine the visual state of a step button for styling and badges
     *
     * @param {number} stepIndex - Index of the step to check
     * @returns {string} Visual state: 'empty', 'viewing', 'editing', 'configured', or 'stop'
     */
    const getStepVisualState = (stepIndex) => {
        const slot = slotData[stepIndex];
        const isStepConfigured = !!(slot?.type && slot?.subtype);
        const isCurrentSlot = stepIndex === currSlotNumber;
        const isStopStep = slot?.type === "special";

        if (isStopStep) return "stop";
        if (isCurrentSlot && isEditingMode) return "editing";
        if (isCurrentSlot && !isEditingMode && isStepConfigured)
            return "viewing";
        if (isStepConfigured) return "configured";
        return "empty";
    };

    /**
     * Check if a step is completed (has instructions assigned)
     *
     * @param {number} index - Step index to check
     * @returns {boolean} Whether the step is completed
     */
    const isStepCompleted = (index) => {
        const slot = slotData?.[index];
        // Special steps (like stop) are always considered "completed"
        if (slot?.type === "special") return true;
        // Regular steps need type and subtype
        return !!(slot?.type && slot?.subtype);
    };

    /**
     * Check if a step is accessible based on user preferences and previous steps completion
     * Special handling: Stop steps are always accessible
     *
     * @param {number} index - Step index to check
     * @returns {boolean} Whether the step is accessible
     */
    const isStepAccessible = (index) => {
        const slot = slotData?.[index];

        // STOP STEP SPECIAL CASE: Always accessible
        if (slot?.type === "special") {
            return true;
        }

        // If sequential completion is disabled or we're reordering, all steps are accessible
        if (!requireSequentialCompletion || isReordering) {
            return true;
        }

        // First step is always accessible
        if (index === 0) return true;

        // A regular step is accessible if all previous steps are completed
        for (let i = 0; i < index; i++) {
            if (!isStepCompleted(i)) return false;
        }

        return true;
    };

    /**
     * Get display info (name and icon) for a step based on user preferences and visual state
     *
     * @param {number} index - Step index
     * @returns {Object} Object with name and icon for the step
     */
    const getStepDisplayInfo = (index) => {
        const slot = slotData?.[index];
        const visualState = getStepVisualState(index);

        // Handle special steps (like stop)
        if (slot?.type === "special") {
            const displayInfo = INSTRUCTION_DISPLAY[slot.type]?.[slot.subtype];
            return {
                name: displayInfo?.name || "Special",
                icon: displayInfo?.icon || (
                    <CircleStop className={styles.commandIcon} />
                ),
            };
        }

        // If the step is not completed
        if (!isStepCompleted(index)) {
            return {
                name: `Step ${index + 1}`,
                icon: isStepAccessible(index) ? (
                    <QuestionMarkIcon
                        className={styles.commandIcon}
                        fill="currentColor"
                    />
                ) : null,
            };
        }

        // Get the type and subtype from the slot data
        const { type, subtype, configuration } = slot;

        // If command labels are disabled, use "Step X" format even for completed steps
        if (!useCommandLabels) {
            return {
                name: `Step ${index + 1}`,
                icon: (
                    <QuestionMarkIcon
                        className={styles.commandIcon}
                        fill="currentColor"
                    />
                ),
            };
        }

        // Special case for button instruction
        if (type === "input" && subtype === "button") {
            // Check if this is a release condition (not pressed)
            const isReleaseCondition =
                configuration?.waitCondition === "released";

            return {
                name: INSTRUCTION_DISPLAY[type][subtype].name,
                icon: isReleaseCondition ? (
                    <ArchiveX
                        className={
                            styles.commandIcon + " " + styles.flippedVertically
                        }
                    />
                ) : (
                    <ArchiveRestore
                        className={
                            styles.commandIcon + " " + styles.flippedVertically
                        }
                    />
                ),
            };
        }

        // Special case for color instruction - fill the droplet with the specified color
        if (
            type === "input" &&
            subtype === "color" &&
            configuration &&
            configuration.color
        ) {
            const colorValue =
                COLOR_MAPPING[configuration.color] || COLOR_MAPPING.unknown;
            return {
                name: INSTRUCTION_DISPLAY[type][subtype].name,
                icon: React.cloneElement(
                    INSTRUCTION_DISPLAY[type][subtype].icon,
                    {
                        className: styles.commandIcon,
                        fill: colorValue,
                    },
                ),
            };
        }

        // Special case for motor instruction - use different icons based on speed
        if (type === "action" && subtype === "motor" && configuration) {
            // Get the first motor configuration if it's an array
            const motorConfig = Array.isArray(configuration)
                ? configuration.sort((a, b) =>
                      (a.port || "").localeCompare(b.port || ""),
                  )[0]
                : configuration;

            if (motorConfig) {
                const speed = motorConfig.speed || 0;
                const absSpeed = Math.abs(speed);
                const isClockwise = speed > 0;

                // Determine which icon to use based on speed
                let speedIcon;
                if (speed === 0) {
                    speedIcon = (
                        <FilledCircleStop className={styles.commandIcon} />
                    );
                } else if (absSpeed <= 330) {
                    // SLOW_THRESHOLD
                    speedIcon = <Snail className={styles.commandIcon} />;
                } else if (absSpeed <= 660) {
                    // MEDIUM_THRESHOLD
                    speedIcon = <Turtle className={styles.commandIcon} />;
                } else {
                    speedIcon = <Rabbit className={styles.commandIcon} />;
                }

                // Add flipped class if the motor is going clockwise
                const iconClassName = isClockwise
                    ? styles.commandIcon + " " + styles.flippedHorizontally
                    : styles.commandIcon;

                return {
                    name: INSTRUCTION_DISPLAY[type][subtype].name,
                    icon: React.cloneElement(speedIcon, {
                        className: iconClassName,
                    }),
                };
            }
        }

        // Try to get the display info from our mapping
        const displayInfo = INSTRUCTION_DISPLAY[type]?.[subtype];
        return {
            name: displayInfo?.name || `${type}-${subtype}`,
            icon: displayInfo?.icon ? (
                React.cloneElement(displayInfo.icon, {
                    className: styles.commandIcon,
                })
            ) : (
                <QuestionMarkIcon
                    className={styles.commandIcon}
                    fill="currentColor"
                />
            ),
        };
    };

    /**
     * Get the appropriate corner badge for a step based on its visual state
     *
     * @param {string} visualState - The visual state of the step
     * @returns {JSX.Element|null} Corner badge component or null
     */
    const getCornerBadge = (
        visualState,
        isStopStep = false,
        hasWarning = false,
    ) => {
        // Priority: Warning badge overrides other badges
        if (hasWarning) {
            return (
                <div className={`${styles.cornerBadge} ${styles.warning}`}>
                    <CircleAlert
                        className={`${styles.cornerIcon} ${styles.warning}`}
                        strokeWidth={2}
                    />
                </div>
            );
        }
        switch (visualState) {
            case "editing":
                return (
                    <div className={`${styles.cornerBadge} ${styles.editing}`}>
                        <Pencil
                            className={styles.cornerIcon}
                            strokeWidth={3}
                        />
                    </div>
                );
            case "configured":
                return (
                    <div
                        className={`${styles.cornerBadge} ${styles.configured}`}
                    >
                        <CircleCheckBig
                            className={`${styles.cornerIcon} ${styles.configured}`}
                            strokeWidth={2}
                        />
                    </div>
                );
            case "viewing":
                return (
                    <div className={`${styles.cornerBadge} ${styles.viewing}`}>
                        <CircleCheckBig
                            className={`${styles.cornerIcon} ${styles.viewing}`}
                            strokeWidth={2}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    /**
     * Phase 2: Handle clicking on a step button - now uses onStepClick prop for coordination
     *
     * @param {number} stepIndex - Index of the clicked step
     */
    const handleStepClick = (stepIndex) => {
        // Use the provided onStepClick handler if available, otherwise fallback to direct slot setting
        if (onStepClick) {
            onStepClick(stepIndex);
        } else {
            // Fallback behavior for backward compatibility
            if (isStepAccessible(stepIndex)) {
                const slot = slotData?.[stepIndex];
                const stepName =
                    slot?.type === "special" ? "Stop" : `${stepIndex + 1}`;

                if (DEBUG_RUN_MENU) {
                    console.log(`RunMenu: Clicked on step ${stepName}`);
                }

                // Dispatch navigation event for mission tracking
                if (isMissionMode) {
                    dispatchTaskEvent("NAVIGATION", {
                        fromSlot: currSlotNumber,
                        toSlot: stepIndex,
                        direction:
                            currSlotNumber < stepIndex ? "next" : "previous",
                        currentSlot: stepIndex,
                    });
                }

                // Update current slot
                setCurrSlotNumber(stepIndex);
            }
        }
    };

    // Check for any disconnected devices in the current configuration using centralized function
    const hasDeviceWarnings = (slotIndex) => {
        return (
            isConnected &&
            checkDisconnectedDevices([slotData?.[slotIndex]]).length > 0
        );
    };

    /**
     * Check if a step has been configured in mission mode
     * Uses task completion status for validation
     *
     * @param {number} slotIndex - Slot index to check
     * @returns {boolean} Whether step is configured in mission mode
     */
    const isStepConfiguredInMission = (slotIndex) => {
        if (!isMissionMode || !currentMission)
            return isStepCompleted(slotIndex);

        // Find tasks that target this slot
        const tasksForSlot = currentMission.tasks.filter(
            (task) => task.targetSlot === slotIndex,
        );

        if (tasksForSlot.length === 0) return isStepCompleted(slotIndex);

        // Check if configuration tasks for this slot are completed
        return tasksForSlot.some((task) => {
            // Only consider configuration-related tasks
            if (
                ![
                    "MOTOR_CONFIGURATION",
                    "TIMER_SETTING",
                    "BUTTON_CONFIGURATION",
                ].includes(task.type)
            ) {
                return false;
            }

            const taskIndex = currentMission.tasks.indexOf(task);
            return isTaskCompleted(taskIndex);
        });
    };

    /**
     * Move a step to a new position (only for non-special steps)
     * Special handling to prevent moving to/from stop step positions
     *
     * @param {number} fromIndex - Source index
     * @param {number} toIndex - Destination index
     */
    const moveStep = (fromIndex, toIndex) => {
        if (isMissionMode) return;

        // STOP STEP PROTECTION: Prevent any moves involving special steps
        const fromSlot = slotData[fromIndex];
        const toSlot = slotData[toIndex];

        // Don't allow moving special steps (like stop)
        if (fromSlot?.type === "special") {
            if (DEBUG_RUN_MENU) {
                console.log("RunMenu: Cannot move special step (stop)");
            }
            return;
        }

        // Don't allow moving TO a special step position (would displace stop)
        if (toSlot?.type === "special") {
            if (DEBUG_RUN_MENU) {
                console.log("RunMenu: Cannot move to special step position");
            }
            return;
        }

        // Don't allow moving past the stop step (toIndex should be < last configurable slot)
        const lastConfigurableIndex = slotData.length - 1 - 1; // -1 for array index, -1 for stop step
        if (toIndex > lastConfigurableIndex) {
            if (DEBUG_RUN_MENU) {
                console.log(
                    "RunMenu: Cannot move past the last configurable slot",
                );
            }
            return;
        }

        // Set reordering state to true
        setIsReordering(true);

        // Create a new array with the moved step
        const newSlotData = [...slotData];
        const [movedStep] = newSlotData.splice(fromIndex, 1);
        newSlotData.splice(toIndex, 0, movedStep);

        // Update current slot number to follow the moved step
        if (currSlotNumber === fromIndex) {
            setCurrSlotNumber(toIndex);
        } else if (currSlotNumber > fromIndex && currSlotNumber <= toIndex) {
            // If current slot is between the old and new position, shift it back
            setCurrSlotNumber(currSlotNumber - 1);
        } else if (currSlotNumber < fromIndex && currSlotNumber >= toIndex) {
            // If current slot is between the new and old position, shift it forward
            setCurrSlotNumber(currSlotNumber + 1);
        }

        // Dispatch event to update slot data
        window.dispatchEvent(
            new CustomEvent("updateSlotData", {
                detail: { slotData: newSlotData },
            }),
        );
    };

    /**
     * Add a new step before the stop step
     */
    const handleAddStep = () => {
        if (isMissionMode) return;

        // Check if we can add more steps
        if (stepCount >= MAX_STEPS) {
            console.warn("RunMenu: Cannot add more steps - maximum reached");
            return;
        }

        // Create new empty slot
        const newSlot = {
            type: null,
            subtype: null,
            configuration: {},
        };

        // Insert new slot before the last slot (which should be the stop step)
        const newSlotData = [...slotData];
        newSlotData.splice(slotData.length - 1, 0, newSlot);

        // Update step count
        setStepCount(stepCount + 1);

        // Dispatch event to update slot data
        window.dispatchEvent(
            new CustomEvent("updateSlotData", {
                detail: { slotData: newSlotData },
            }),
        );
    };

    /**
     * FIXED: Render progress segment for a step - continuous, static segments
     * @param {number} stepIndex - Index of the step
     * @returns {JSX.Element|null} Progress segment element or null
     */
    const renderProgressSegment = (stepIndex) => {
        const progressState = getProgressState(stepIndex);
        const slot = slotData[stepIndex];
        const isStopStep = slot?.type === "special";

        // No progress segment for stop step
        if (isStopStep) {
            return null;
        }

        // Check if step is configured for opacity styling
        const isConfigured = isStepCompleted(stepIndex);

        // Determine if this is the first or last configurable step for border radius
        const isFirstStep = stepIndex === 0;
        const lastConfigurableIndex = slotData.length - 2; // -1 for zero-based, -1 for stop step
        const isLastConfigurableStep = stepIndex === lastConfigurableIndex;

        return (
            <div
                className={`${styles.progressSegment} ${
                    styles[
                        `progress${
                            progressState.charAt(0).toUpperCase() +
                            progressState.slice(1)
                        }`
                    ]
                } ${isFirstStep ? styles.progressFirst : ""} ${
                    isLastConfigurableStep ? styles.progressLast : ""
                } ${!isConfigured ? styles.progressUnconfigured : ""}`}
            />
        );
    };

    /**
     * FIXED: Generate buttons for each step - now with separated progress segments and step containers
     *
     * @returns {Array} Array of step wrapper elements
     */
    const renderStepButtons = () => {
        if (DEBUG_RUN_MENU) {
            console.log("RunMenu: Rendering", slotData.length, "step buttons");
        }

        return slotData.map((slot, i) => {
            const completed = isMissionMode
                ? isStepConfiguredInMission(i)
                : isStepCompleted(i);
            const accessible = isStepAccessible(i);
            const visualState = getStepVisualState(i);
            const { name, icon } = getStepDisplayInfo(i);
            const isStopStep = slot?.type === "special";

            const hasDeviceWarning = hasDeviceWarnings(i);
            const cornerBadge = getCornerBadge(
                visualState,
                isStopStep,
                hasDeviceWarning,
            );

            const stepButton = (
                <button
                    className={`${styles.stepButton}
                            ${hasDeviceWarning ? styles.warning : ""} 
                            ${styles[visualState]} 
                            ${isStopStep ? styles.stopStep : ""}
                            ${completed ? styles.completed : ""}
                            ${slot?.type ? styles.configured : ""} 
                            ${i === currSlotNumber ? styles.current : ""}`}
                    onClick={() => handleStepClick(i)}
                    disabled={!accessible}
                    aria-label={`${name}${
                        i === currSlotNumber ? " (current)" : ""
                    }${completed ? " (completed)" : ""}${
                        visualState === "editing" ? " (editing)" : ""
                    }${visualState === "viewing" ? " (viewing)" : ""}`}
                    aria-current={i === currSlotNumber ? "step" : false}
                    style={{ position: "relative" }}
                >
                    {/* Drag handle moved inside button for non-mission, non-special steps */}
                    {!isMissionMode && !isStopStep && (
                        <div className={styles.dragHandle}>
                            <GripVertical className={styles.dragIcon} />
                        </div>
                    )}

                    <span className={styles.stepName}>{name}</span>
                    {icon && (
                        <span className={styles.iconContainer}>{icon}</span>
                    )}
                    {cornerBadge}
                </button>
            );

            // FIXED: New wrapper structure - progress segment + step container
            const stepWrapper = (
                <div
                    key={i}
                    className={styles.stepWrapper}
                >
                    {/* Left side: Static progress segment */}
                    {renderProgressSegment(i)}

                    {/* Right side: Step button container */}
                    <div className={styles.stepButtonContainer}>
                        {/* Wrap in DraggableStepButton if not in mission mode and not a special step */}
                        {!isMissionMode && !isStopStep ? (
                            <DraggableStepButton
                                index={i}
                                moveStep={moveStep}
                                isMissionMode={isMissionMode}
                            >
                                {stepButton}
                            </DraggableStepButton>
                        ) : (
                            stepButton
                        )}
                    </div>
                </div>
            );

            return stepWrapper;
        });
    };

    return (
        <div className={styles.menuBackground}>
            <div
                className={`${styles.menuContent} ${
                    isScrollable ? styles.scrollable : ""
                } ${isAtBottom ? styles.atBottom : ""}`}
            >
                {/* Title hidden by CSS */}
                <div className={styles.menuTitle}>CODE STEPS</div>

                {/* Content wrapper */}
                <div className={styles.menuContentWrapper}>
                    {/* Step buttons */}
                    <div className={styles.stepsContainer}>
                        {renderStepButtons()}
                    </div>

                    {/* Add Step button - only show in sandbox mode */}
                    {!isMissionMode && (
                        <div className={styles.stepsContainer}>
                            <button
                                className={styles.addStepButton}
                                onClick={handleAddStep}
                                disabled={stepCount >= MAX_STEPS}
                                aria-label="Add new step"
                            >
                                <Plus className={styles.commandIcon} />
                                Add Step
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Gradient overlay */}
            <div className={styles.gradientOverlay}>
                <ChevronDown
                    className={styles.commandIcon}
                    color="var(--panel-text)"
                />
            </div>

            {/* Control buttons container - Phase 2: Delegate to App.js */}
            <div className={styles.controlButtonsContainer}>
                {/* Play button - Large when stopped, small when running */}
                <button
                    className={`${styles.playButton} ${
                        isRunning
                            ? styles.playButtonRunning
                            : styles.playButtonStopped
                    }`}
                    onClick={onPlayButtonClick || handleRunAllSlots}
                    disabled={!canRun || !isConnected}
                    aria-label={
                        isRunning ? "Program is running" : "Run all steps"
                    }
                >
                    {/* Play icon - different styles for running vs stopped */}
                    <Play
                        className={
                            isRunning
                                ? styles.playIconRunning
                                : styles.playIconStopped
                        }
                        aria-hidden="true"
                    />

                    {/* Button text - only show when stopped */}
                    <span
                        className={`${styles.buttonText} ${
                            isRunning
                                ? styles.buttonTextHidden
                                : styles.buttonTextVisible
                        }`}
                    >
                        Play
                    </span>
                </button>

                {/* Stop button - Small when stopped, large when running */}
                <button
                    className={`${styles.stopButton} ${
                        isRunning
                            ? styles.stopButtonRunning
                            : styles.stopButtonStopped
                    }`}
                    onClick={handleStopProgram}
                    disabled={!isConnected}
                    aria-label="Stop running program"
                >
                    <Square className={styles.stopIcon} />

                    {/* Button text - only show when running */}
                    <span
                        className={`${styles.buttonText} ${
                            isRunning
                                ? styles.buttonTextVisible
                                : styles.buttonTextHidden
                        }`}
                    >
                        Stop
                    </span>
                </button>
            </div>
        </div>
    );
};

export default RunMenu;
