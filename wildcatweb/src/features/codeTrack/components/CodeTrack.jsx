/**
 * @file CodeTrack.jsx
 * @description Main component for displaying the coding track with instructions,
 * including navigation controls and instruction visualization.
 * Updated to dispatch events for Task Registry Mission System.
 */

import React, { useEffect } from "react";
import styles from "../styles/CodingTrack.module.css";
import NavigationControls from "./NavigationControls";
import InstructionVisualizer from "./InstructionVisualizer";
import { generateDescription } from "../../../code-generation/InstructionDescriptionGenerator";
import { useBLE } from "../../bluetooth/context/BLEContext";
import { useMission } from "../../../context/MissionContext"; // Import mission hook
import {
    ClearSlotRequest,
    ClearSlotResponse,
} from "../../bluetooth/ble_resources/messages";
import { generateSlotCode } from "../../../code-generation/codeGenerator";
import { Buffer } from "buffer";
import { CircleStop } from "lucide-react";

/**
 * Main component for displaying the coding track with instructions
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.currSlotNumber - Current slot number
 * @param {Function} props.setCurrSlotNumber - Function to update current slot
 * @param {number} props.missionSteps - Total number of mission steps
 * @param {Array} props.slotData - Array of instruction configurations
 * @param {Function} props.setPyCode - Function to update Python code
 * @param {Function} props.setCanRun - Function to update run status
 * @returns {JSX.Element} Complete coding track interface
 */
const CodeTrack = ({
    currSlotNumber,
    setCurrSlotNumber,
    missionSteps,
    slotData,
    setPyCode,
    setCanRun,
}) => {
    // Get mission context
    const {
        isMissionMode,
        currentMission,
        dispatchTaskEvent,
        validateStepConfiguration,
        getCurrentTask,
        setShowTestPrompt,
    } = useMission();

    // Get current task if we're in mission mode
    const currentTask = getCurrentTask();

    const FilledCircleStop = (props) => {
        return React.cloneElement(<CircleStop />, {
            fill: "currentColor",
            ...props,
        });
    };

    // Get the current instruction from slotData
    const currentInstruction = slotData?.[currSlotNumber];

    // Check if current slot is the stop step
    const isStopStep = currentInstruction?.isStopInstruction === true;

    const { ble, isConnected, portStates } = useBLE();

    /**
     * Handle navigation to previous slot
     */
    const handlePrevious = () => {
        const prevSlot = Math.max(0, currSlotNumber - 1);
        setCurrSlotNumber(prevSlot);

        // Dispatch navigation event for mission tracking
        if (isMissionMode) {
            dispatchTaskEvent("NAVIGATION", {
                fromSlot: currSlotNumber,
                toSlot: prevSlot,
                direction: "previous",
                currentSlot: prevSlot,
            });
        }
    };

    /**
     * Handle navigation to next slot
     */
    const handleNext = () => {
        // missionSteps is the COUNT, so max index is missionSteps-1
        const nextSlot = Math.min(currSlotNumber + 1, missionSteps - 1);
        setCurrSlotNumber(nextSlot);

        // Dispatch navigation event for mission tracking
        if (isMissionMode) {
            dispatchTaskEvent("NAVIGATION", {
                fromSlot: currSlotNumber,
                toSlot: nextSlot,
                direction: "next",
                currentSlot: nextSlot,
            });
        }
    };

    /**
     * Check if the current instruction matches mission requirements
     *
     * @returns {Object} Validation result
     */
    const validateCurrentInstruction = () => {
        // Only validate in mission mode and for the current task's target slot
        if (!isMissionMode || !currentMission || !currentTask) {
            return { isValid: true };
        }

        // If task is for a different slot, don't validate
        if (currentTask.targetSlot !== currSlotNumber) {
            return { isValid: true };
        }

        // If no instruction, it's not valid
        if (!currentInstruction || !currentInstruction.type) {
            return {
                isValid: false,
                message:
                    "Please configure this step according to the mission instructions.",
            };
        }

        // Validate against mission requirements
        return validateStepConfiguration(currentInstruction);
    };

    /**
     * Handle test button click to run current instruction
     */
    const handleTest = async () => {
        console.log(
            "Testing current instruction:",
            generateDescription(currentInstruction),
        );

        try {
            // Check if the robot is connected
            if (!isConnected) {
                console.warn(
                    "Robot not connected. Please connect via Bluetooth first.",
                );
                return;
            }

            // Make sure we have a valid instruction to test
            if (!currentInstruction || !currentInstruction.type) {
                console.warn("No valid instruction in current slot to test");
                return;
            }

            // In mission mode, validate the instruction against mission requirements
            if (isMissionMode && currentTask?.targetSlot === currSlotNumber) {
                const validation = validateCurrentInstruction();
                if (!validation.isValid) {
                    console.warn(
                        "Instruction doesn't meet mission requirements:",
                        validation.message,
                    );
                    return;
                }

                // Hide the test prompt if it's showing
                setShowTestPrompt(false);
            }

            // Generate code specifically for this single instruction
            const code = generateSlotCode(currentInstruction, portStates);
            console.log("Generated Python Code for current slot:", code);

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

            // Only complete the test execution task after successful BLE communication
            if (isMissionMode && currentTask?.type === "TEST_EXECUTION") {
                console.log("CodeTrack: Test execution successful, completing task");
                dispatchTaskEvent("TEST_EXECUTION", {
                    slotIndex: currSlotNumber,
                    instruction: currentInstruction,
                    currentSlot: currSlotNumber,
                });
            }
        } catch (error) {
            console.error("Error running test program:", error);
        }
    };

    return (
        <div className={styles.trackContainer}>
            <div className={styles.slotDisplay}>
                {/* Main visualization area */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexGrow: 1,
                    }}
                >
                    {isStopStep ? (
                        <div className={styles.stopVisualization}>
                            <CircleStop
                                size={100}
                                className={styles.stopIcon}
                            />
                            <div className={styles.stopLabel}>STOP</div>
                        </div>
                    ) : (
                        <InstructionVisualizer
                            instruction={currentInstruction}
                        />
                    )}
                </div>

                {/* Test button - only show for non-stop steps */}
                {!isStopStep && (
                    <button
                        className={styles.testButton}
                        onClick={handleTest}
                        disabled={!isConnected || !currentInstruction?.type}
                        aria-label="Test current instruction"
                    >
                        Test
                    </button>
                )}

                {/* Navigation controls */}
                <NavigationControls
                    currSlotNumber={currSlotNumber}
                    missionSteps={missionSteps}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    currentInstruction={currentInstruction}
                    // Pass mission validation for button state
                    validInMission={validateCurrentInstruction().isValid}
                    isMissionMode={
                        isMissionMode &&
                        currentTask?.targetSlot === currSlotNumber
                    }
                />
            </div>
        </div>
    );
};

export default CodeTrack;
