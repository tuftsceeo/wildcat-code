/**
 * @file RunMenu.jsx
 * @description Side panel for navigating and executing code, with support for
 * running individual slots or the complete program. Enhanced with command-specific
 * names and icons for completed steps. Updated for flat task structure.
 */

import React, { useEffect, useState, useRef } from "react";
import styles from "../styles/RunMenu.module.css";
import { generatePythonCode } from "../../../code-generation/codeGenerator.js";
import { useBLE } from "../../bluetooth/context/BLEContext";
import { useCustomization } from "../../../context/CustomizationContext";
import { useMission } from '../../../context/MissionContext.js';
import { Buffer } from "buffer";
import { ReactComponent as QuestionMarkIcon } from "../../../assets/images/question-mark.svg";
import {
    ClearSlotRequest,
    ClearSlotResponse,
} from "../../../features/bluetooth/ble_resources/messages";
import {
    AlertTriangle,
    AlertCircleStop,
    CircleStop,
    HelpCircle,
    RotateCw,
    Clock9,
    Disc,
    ArchiveRestore,
    Timer,
    Plus,
    Lock,
    ChevronDown,
    Droplet,
} from "lucide-react";
import DraggableStepButton from "./DraggableStepButton";

const FilledCircleStop = (props) => {
    return React.cloneElement(<CircleStop />, { fill: "currentColor", ...props });
};

/**
 * Mapping from instruction type/subtype to display info
 * Provides the name and icon to show on completed step buttons
 */
const INSTRUCTION_DISPLAY = {
    action: {
        motor: {
            name: "Speed",
            icon: <RotateCw size={24} />,
        },
    },
    input: {
        time: {
            name: "Wait",
            icon: <Timer size={24} />,
        },
        button: {
            name: "Button",
            icon: <ArchiveRestore size={24} />,
        },
        color: {
            name: "Color",
            icon: <Droplet size={24} />,
        },
    },
    special: {
        stop: {
            name: "Stop",
            icon: <CircleStop size={24} />,
        },
    },
};

/**
 * RunMenu component for navigating and executing code
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.pyCode - Generated Python code
 * @param {boolean} props.canRun - Whether code is executable
 * @param {number} props.currSlotNumber - Current selected slot
 * @param {Function} props.setCurrSlotNumber - Function to set current slot
 * @param {number} props.missionSteps - Total number of mission steps
 * @param {Array} props.slotData - Data for all coding slots
 * @returns {JSX.Element} RunMenu component
 */
export const RunMenu = ({
    pyCode,
    canRun,
    currSlotNumber,
    setCurrSlotNumber,
    missionSteps,
    slotData,
}) => {
    console.log("RunMenu: Rendering with missionSteps =", missionSteps);

    const { ble, isConnected, portStates } = useBLE();

    // Get user preferences from CustomizationContext
    const { 
        requireSequentialCompletion, 
        useCommandLabels,
        stepCount,
        setStepCount,
        MAX_STEPS
    } = useCustomization();

    // Get mission context
    const {
        isMissionMode,
        currentMission,
        dispatchTaskEvent,
        isTaskCompleted,
        getCurrentTask
    } = useMission();

    // Add state to track when reordering is in progress
    const [isReordering, setIsReordering] = useState(false);
    const [isScrollable, setIsScrollable] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const contentRef = useRef(null);

    // Log any inconsistencies between missionSteps and slotData length
    useEffect(() => {
        // The slotData array should be exactly missionSteps in length
        // (we're now treating missionSteps as the COUNT of steps, not the max index)
        if (slotData && slotData.length !== missionSteps) {
            console.warn(
                "RunMenu: Inconsistency detected - slotData length doesn't match missionSteps",
            );
        }
    }, [missionSteps, slotData]);

    // Check if content is scrollable
    useEffect(() => {
        const checkScrollable = () => {
            const menuElement = document.querySelector(`.${styles.menuContent}`);
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
            const menuElement = document.querySelector(`.${styles.menuContent}`);
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
            menuElement.addEventListener('scroll', handleScroll);
            // Check initial position
            handleScroll();
            return () => menuElement.removeEventListener('scroll', handleScroll);
        }
    }, []);

    /**
     * Check if a step is completed (has instructions assigned)
     *
     * @param {number} index - Step index to check
     * @returns {boolean} Whether the step is completed
     */
    const isStepCompleted = (index) => {
        return !!(
            slotData &&
            slotData[index]?.type &&
            slotData[index]?.subtype
        );
    };

    /**
     * Check if a step is accessible based on user preferences and previous steps completion
     *
     * @param {number} index - Step index to check
     * @returns {boolean} Whether the step is accessible
     */
    const isStepAccessible = (index) => {
        // If sequential completion is disabled or we're reordering, all steps are accessible
        if (!requireSequentialCompletion || isReordering) {
            return true;
        }

        // First step is always accessible
        if (index === 0) return true;

        // The stop step is a special case - it's accessible if the second-to-last step is completed
        if (index === missionSteps - 1) {
            return isStepCompleted(missionSteps - 2);
        }

        // A regular step is accessible if all previous steps are completed
        for (let i = 0; i < index; i++) {
            if (!isStepCompleted(i)) return false;
        }

        return true;
    };

    /**
     * Get display info (name and icon) for a step based on user preferences
     *
     * @param {number} index - Step index
     * @returns {Object} Object with name and icon for the step
     */
    const getStepDisplayInfo = (index) => {
        // If this is the stop step (last step)
        if (index === missionSteps - 1) {
            return {
                name: "Stop",
                icon: (
                    <CircleStop
                        size={24}
                        className={styles.commandIcon}
                    />
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
                        width={30}
                        height={30}
                    />
                ) : null,
            };
        }

        // Get the type and subtype from the slot data
        const { type, subtype } = slotData[index];

        // If command labels are disabled, use "Step X" format even for completed steps
        if (!useCommandLabels) {
            return {
                name: `Step ${index + 1}`,
                icon: (
                    <QuestionMarkIcon
                        className={styles.commandIcon}
                        fill="currentColor"
                        width={30}
                        height={30}
                    />
                ),
            };
        }

        // Special case for button instruction
        if (type === "input" && subtype === "button") {
            return {
                name: INSTRUCTION_DISPLAY[type][subtype].name,
                icon: (
                    <ArchiveRestore
                        size={24}
                        className={
                            styles.commandIcon + " " + styles.flippedVertically
                        }
                    />
                ),
            };
        }

        // Try to get the display info from our mapping
        return {
            name: INSTRUCTION_DISPLAY[type][subtype].name,
            icon: React.cloneElement(INSTRUCTION_DISPLAY[type][subtype].icon, {
                className: styles.commandIcon,
            }),
        };
    };

    /**
     * Check for disconnected motors in configurations
     *
     * @param {Array} slots - Slot configurations to check
     * @returns {Array} Array of disconnected port objects
     */
    const checkDisconnectedMotors = (slots) => {
        const disconnectedPorts = [];
        slots.forEach((slot, index) => {
            if (slot?.type === "action" && slot?.subtype === "motor") {
                const configs = Array.isArray(slot.configuration)
                    ? slot.configuration
                    : [slot.configuration];

                configs.forEach((config) => {
                    if (config?.port && !portStates[config.port]) {
                        disconnectedPorts.push({
                            slot: index + 1,
                            port: config.port,
                        });
                    }
                });
            }
        });
        return disconnectedPorts;
    };

    /**
     * Run all slots sequentially
     */
    const handleRunAllSlots = async () => {
        try {
            if (!isConnected) {
                console.warn(
                    "Robot not connected. Please connect via Bluetooth first.",
                );
                return;
            }

            const code = generatePythonCode(slotData, portStates);
            console.log("Generated Python Code for all slots:", code);

            // Clear the program slot
            const clearResponse = await ble.sendRequest(
                new ClearSlotRequest(0),
                ClearSlotResponse,
            );

            if (!clearResponse.success) {
                console.warn("Failed to clear program slot"); // Warning ok, sometimes the program slot is empty
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
                console.log("RunMenu: Dispatching RUN_PROGRAM event", {
                    slots: slotData.length,
                    currentSlot: currSlotNumber,
                    isMissionMode,
                    currentMission: currentMission
                });
                
                dispatchTaskEvent("RUN_PROGRAM", {
                    slots: slotData.length,
                    currentSlot: currSlotNumber,
                    type: "RUN_PROGRAM" // Explicitly set the event type
                });
            }
        } catch (error) {
            console.error("Error running program:", error);
        }
    };

    /**
     * Handle clicking on a step button
     *
     * @param {number} stepIndex - Index of the clicked step
     */
    const handleStepClick = (stepIndex) => {
        // Only allow clicking on accessible steps
        if (isStepAccessible(stepIndex)) {
            console.log(
                "RunMenu: Clicked on step",
                stepIndex === missionSteps - 1 ? "Stop" : stepIndex + 1
            );

            // Dispatch navigation event for mission tracking
            if (isMissionMode) {
                dispatchTaskEvent("NAVIGATION", {
                    fromSlot: currSlotNumber,
                    toSlot: stepIndex,
                    direction: currSlotNumber < stepIndex ? "next" : "previous",
                    currentSlot: stepIndex,
                });
            }

            // Update current slot
            setCurrSlotNumber(stepIndex);
        }
    };

    // Check for any disconnected motors in the current configuration
    const disconnectedMotors = checkDisconnectedMotors(slotData);
    const currentSlotDisconnected = checkDisconnectedMotors([
        slotData[currSlotNumber],
    ]);

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
     * Move a step to a new position
     * 
     * @param {number} fromIndex - Source index
     * @param {number} toIndex - Destination index
     */
    const moveStep = (fromIndex, toIndex) => {
        if (isMissionMode) return;

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
        window.dispatchEvent(new CustomEvent('updateSlotData', { 
            detail: { slotData: newSlotData } 
        }));
    };

    /**
     * Add a new step before the stop step
     */
    const handleAddStep = () => {
        if (isMissionMode) return;

        // Check if we can add more steps
        if (stepCount >= MAX_STEPS) {
            console.warn("Cannot add more steps - maximum reached");
            return;
        }

        // Create new empty slot
        const newSlot = {
            type: null,
            subtype: null,
            configuration: {},
        };

        // Insert new slot before the stop step
        const newSlotData = [...slotData];
        newSlotData.splice(missionSteps - 1, 0, newSlot);

        // Update step count
        setStepCount(stepCount + 1);

        // Dispatch event to update slot data
        window.dispatchEvent(new CustomEvent('updateSlotData', { 
            detail: { slotData: newSlotData } 
        }));
    };

    /**
     * Generate buttons for each mission step
     *
     * @returns {Array} Array of step button elements
     */
    const renderStepButtons = () => {
        console.log("RunMenu: Rendering", missionSteps, "step buttons");

        const buttons = [];
        // Create regular step buttons (excluding the stop step)
        for (let i = 0; i < missionSteps - 1; i++) {
            const completed = isMissionMode
                ? isStepConfiguredInMission(i)
                : isStepCompleted(i);
            const accessible = isStepAccessible(i);
            const { name, icon } = getStepDisplayInfo(i);

            const stepButton = (
                <button
                    key={i}
                    className={`${styles.stepButton} 
                              ${
                                  isConnected &&
                                  checkDisconnectedMotors([slotData?.[i]])
                                      .length > 0
                                      ? styles.warning
                                      : ""
                              } 
                              ${completed ? styles.completed : ""}
                              ${slotData?.[i]?.type ? styles.configured : ""} 
                              ${i === currSlotNumber ? styles.current : ""}`}
                    onClick={() => handleStepClick(i)}
                    disabled={!accessible}
                    aria-label={`${name}${
                        i === currSlotNumber ? " (current)" : ""
                    }${completed ? " (completed)" : ""}`}
                    aria-current={i === currSlotNumber ? "step" : false}
                >
                    <span className={styles.stepName}>{name}</span>
                    {icon && (
                        <span className={styles.iconContainer}>{icon}</span>
                    )}
                </button>
            );

            // Wrap the button in DraggableStepButton if not in mission mode
            buttons.push(
                <DraggableStepButton
                    key={i}
                    index={i}
                    moveStep={moveStep}
                    isMissionMode={isMissionMode}
                >
                    {stepButton}
                </DraggableStepButton>
            );
        }

        // Add the special Stop button
        const stopStepIndex = missionSteps - 1;
        const stopAccessible = isStepAccessible(stopStepIndex);

        buttons.push(
            <button
                key="stop"
                className={`${styles.stepButton} ${styles.stopButton} ${
                    currSlotNumber === stopStepIndex ? styles.current : ""
                }`}
                onClick={() => handleStepClick(stopStepIndex)}
                disabled={!stopAccessible}
                aria-label="Stop"
                aria-current={currSlotNumber === stopStepIndex ? "step" : false}
            >
                <span className={styles.stepName}>Stop</span>
                <CircleStop
                    size={24}
                    className={styles.stopIcon}
                />
            </button>
        );

        return buttons;
    };

    return (
        <div className={styles.menuBackground}>
            <div className={`${styles.menuContent} ${isScrollable ? styles.scrollable : ''} ${isAtBottom ? styles.atBottom : ''}`}>
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
                                <Plus size={20} />
                                Add Step
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Gradient overlay */}
            <div className={styles.gradientOverlay}>
                <ChevronDown size={24} color="var(--panel-text)" />
            </div>

            {/* Play button */}
            <div className={styles.playButtonContainer}>
                <button
                    className={styles.playButton}
                    onClick={handleRunAllSlots}
                    disabled={!canRun || !isConnected}
                    aria-label="Run all steps"
                >
                    Play
                </button>
            </div>
        </div>
    );
};

export default RunMenu;
