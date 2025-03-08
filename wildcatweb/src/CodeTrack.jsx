/**
 * @file CodeTrack.jsx - FINAL FIX
 * @description Main component for displaying the coding track with instructions,
 * including navigation controls and instruction visualization.
 */

import React, { useEffect } from "react";
import styles from "./CodingTrack.module.css";
import NavigationControls from "./NavigationControls";
import InstructionVisualizer from "./InstructionVisualizer";
import { generateDescription } from "./InstructionDescriptionGenerator";
import { useBLE } from "./BLEContext";
import { ClearSlotRequest, ClearSlotResponse } from "./ble_resources/messages";
import { generateSlotCode } from "./codeGenerator";
import { Buffer } from "buffer";

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
    console.log("CodeTrack: Rendering with missionSteps =", missionSteps);
    console.log("CodeTrack: Current slot number =", currSlotNumber);

    // Ensure current slot is valid based on missionSteps
    useEffect(() => {
        // If currSlotNumber is beyond the valid range, reset it to the max allowed
        // IMPORTANT: missionSteps is now the COUNT, so max index is missionSteps-1
        if (currSlotNumber >= missionSteps) {
            console.log(
                "CodeTrack: Resetting currSlotNumber from",
                currSlotNumber,
                "to",
                missionSteps - 1,
            );
            setCurrSlotNumber(missionSteps - 1);
        }
    }, [currSlotNumber, missionSteps, setCurrSlotNumber]);

    const currentInstruction = slotData?.[currSlotNumber];
    const { ble, isConnected, portStates } = useBLE();
    // Navigation handlers
    const handlePrevious = () => {
        console.log(
            "CodeTrack: handlePrevious called, current =",
            currSlotNumber,
        );
        setCurrSlotNumber(Math.max(0, currSlotNumber - 1));
    };

    const handleNext = () => {
        console.log("CodeTrack: handleNext called, current =", currSlotNumber);
        // FIXED: missionSteps is the COUNT, so max index is missionSteps-1
        const nextSlot = Math.min(currSlotNumber + 1, missionSteps - 1);
        console.log("CodeTrack: Moving to next slot:", nextSlot);
        setCurrSlotNumber(nextSlot);
    };

    const handleTest = async () => {
        console.log(
            "Testing current instruction:",
            generateDescription(currentInstruction)
        );
    
        try {
            // Check if the robot is connected
            if (!isConnected) {
                console.warn(
                    "Robot not connected. Please connect via Bluetooth first."
                );
                return;
            }
    
            // Make sure we have a valid instruction to test
            if (!currentInstruction || !currentInstruction.type) {
                console.warn("No valid instruction in current slot to test");
                return;
            }
    
            // Generate code specifically for this single instruction
            const code = generateSlotCode(currentInstruction, portStates);
            console.log("Generated Python Code for current slot:", code);
    
            // Clear the program slot on the robot
            const clearResponse = await ble.sendRequest(
                new ClearSlotRequest(0),
                ClearSlotResponse
            );
    
            if (!clearResponse.success) {
                console.warn("Failed to clear program slot");
                return;
            }
    
            // Upload and transfer the program
            await ble.uploadProgramFile(
                "program.py",
                0,
                Buffer.from(code, "utf-8")
            );
    
            // Start the program on the robot
            await ble.startProgram(0);
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
                    <InstructionVisualizer instruction={currentInstruction} />
                </div>

                {/* Test button */}
                <button
                    className={styles.testButton}
                    onClick={handleTest}
                >
                    Test
                </button>

                {/* Navigation controls */}
                <NavigationControls
                    currSlotNumber={currSlotNumber}
                    missionSteps={missionSteps}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                />
            </div>
        </div>
    );
};

export default CodeTrack;
