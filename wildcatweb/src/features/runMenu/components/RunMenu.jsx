/**
 * @file RunMenu.jsx
 * @description Side panel for navigating and executing code, with support for
 * running individual slots or the complete program. Updated to handle special Stop step
 * and sequential step completion requirement.
 * @author Jennifer Cross with support from Claude
 * @created March 2025
 */

import React, { useEffect } from "react";
import styles from "../styles/RunMenu.module.css";
import { generatePythonCode } from "../../../code-generation/codeGenerator.js";
import { useBLE } from "../../bluetooth/context/BLEContext";
import { Buffer } from "buffer";
import {
    ClearSlotRequest,
    ClearSlotResponse,
} from "../../../features/bluetooth/ble_resources/messages";
import { AlertTriangle, AlertOctagon, Octagon, Check } from "lucide-react";


const FilledOctagon = (props) => {
    return React.cloneElement(<Octagon />, { fill: "currentColor", ...props });
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

    /**
     * Check if a step is completed (has instructions assigned)
     * 
     * @param {number} index - Step index to check
     * @returns {boolean} Whether the step is completed
     */
    const isStepCompleted = (index) => {
        return !!(slotData && slotData[index]?.type && slotData[index]?.subtype);
    };

    /**
     * Check if a step is accessible based on previous steps completion
     * 
     * @param {number} index - Step index to check
     * @returns {boolean} Whether the step is accessible
     */
    const isStepAccessible = (index) => {
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
                console.warn("Failed to clear program slot");
                return;
            }

            // Upload and transfer the program
            await ble.uploadProgramFile(
                "program.py",
                0,
                Buffer.from(code, "utf-8"),
            );

            // Start the program
            await ble.startProgram(0);
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
                slotData[stepIndex]?.isStopInstruction ? "Stop" : stepIndex + 1,
            );
            setCurrSlotNumber(stepIndex);
        }
    };

    // Check for any disconnected motors in the current configuration
    const disconnectedMotors = checkDisconnectedMotors(slotData);
    const currentSlotDisconnected = checkDisconnectedMotors([
        slotData[currSlotNumber],
    ]);

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
            const completed = isStepCompleted(i);
            const accessible = isStepAccessible(i);
            
            buttons.push(
                <button
                    key={i}
                    className={`${styles.stepButton} 
                              ${isConnected && checkDisconnectedMotors([slotData?.[i]]).length > 0 ? styles.warning : ""} 
                              ${completed ? styles.completed : ""}
                              ${slotData?.[i]?.type ? styles.configured : ""} 
                              ${i === currSlotNumber ? styles.current : ""}`}
                    onClick={() => handleStepClick(i)}
                    disabled={!accessible}
                    aria-label={`Step ${i + 1}${i === currSlotNumber ? " (current)" : ""}${completed ? " (completed)" : ""}`}
                    aria-current={i === currSlotNumber ? "step" : false}
                >
                    Step {i + 1}
                    {completed && <Check className={styles.checkIcon} size={16} />}
                </button>
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
               
                Stop 
                <FilledOctagon
                    size={30}
                    className={styles.stopIcon}
                />
            </button>
        );

        return buttons;
    };

    return (
        <div className={styles.menuBackground}>
            <div className={styles.menuContent}>
                {/* Title hidden by CSS */}
                <div className={styles.menuTitle}>CODE STEPS</div>

                {/* Step buttons */}
                <div className={styles.stepsContainer}>
                    {renderStepButtons()}
                </div>

                {/* Play button */}
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