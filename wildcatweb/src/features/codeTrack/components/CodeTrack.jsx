/**
 * @file CodeTrack.jsx
 * @description Main component for displaying the coding track with instructions,
 * including navigation controls and instruction visualization.
 * Updated to handle mission validation and show test prompts.
 * @author Jennifer Cross with support from Claude
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
import { Octagon } from "lucide-react";

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
        currentStepIndex, 
        markStepTested, 
        completeStep, 
        validateStepConfiguration,
        setOverlayContent,
        setShowMissionOverlay
    } = useMission();

    // Ensure current slot is valid based on missionSteps
    useEffect(() => {
        // If currSlotNumber is beyond the valid range, reset it to the max allowed
        // IMPORTANT: missionSteps is the COUNT, so max index is missionSteps-1
        if (currSlotNumber >= missionSteps) {
            setCurrSlotNumber(missionSteps - 1);
        }
    }, [currSlotNumber, missionSteps, setCurrSlotNumber]);

    // Get the current instruction from slotData
    const currentInstruction = slotData?.[currSlotNumber];

    const FilledOctagon = (props) => {
        return React.cloneElement(<Octagon />, { fill: "currentColor", ...props });
    };

    // Check if current slot is the stop step
    const isStopStep = currentInstruction?.isStopInstruction === true;

    const { ble, isConnected, portStates } = useBLE();

    /**
     * Handle navigation to previous slot
     */
    const handlePrevious = () => {
        setCurrSlotNumber(Math.max(0, currSlotNumber - 1));
    };

    /**
     * Handle navigation to next slot
     */
    const handleNext = () => {
        // missionSteps is the COUNT, so max index is missionSteps-1
        const nextSlot = Math.min(currSlotNumber + 1, missionSteps - 1);
        setCurrSlotNumber(nextSlot);
    };

    /**
     * Check if the current instruction matches mission requirements
     * 
     * @returns {Object} Validation result
     */
    const validateCurrentInstruction = () => {
        // Only validate in mission mode and when on the current mission step
        if (!isMissionMode || !currentMission || currSlotNumber !== currentStepIndex) {
            return { isValid: true };
        }
        
        // If no instruction, it's not valid
        if (!currentInstruction || !currentInstruction.type) {
            return { 
                isValid: false, 
                message: "Please configure this step according to the mission instructions."
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
            if (isMissionMode && currSlotNumber === currentStepIndex) {
                const validation = validateCurrentInstruction();
                if (!validation.isValid) {
                    console.warn("Instruction doesn't meet mission requirements:", validation.message);
                    
                    // Show mission overlay with validation error
                    setOverlayContent({
                        type: 'error',
                        title: "Not Quite Right",
                        message: validation.message,
                        hint: currentMission.steps[currentStepIndex].instructions?.hints?.[0]
                    });
                    setShowMissionOverlay(true);
                    return;
                }
                
                // Mark the step as tested
                markStepTested(currentStepIndex);
                
                // If the step has a success message, prepare to show it
                const missionStep = currentMission.steps[currentStepIndex];
                if (missionStep.instructions?.successMessage) {
                    // Queue success message to show after test runs
                    setTimeout(() => {
                        setOverlayContent({
                            type: 'success',
                            title: "Great Job!",
                            message: missionStep.instructions.successMessage
                        });
                        setShowMissionOverlay(true);
                        
                        // Mark the step as completed
                        completeStep(currentStepIndex, currentInstruction.configuration);
                    }, 3000); // Show after 3 seconds to let the test run
                }
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
                            <FilledOctagon
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

                {/* Navigation controls - now passing currentInstruction */}
                <NavigationControls
                    currSlotNumber={currSlotNumber}
                    missionSteps={missionSteps}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    currentInstruction={currentInstruction}
                    // Pass mission validation for button state
                    validInMission={validateCurrentInstruction().isValid}
                    isMissionMode={isMissionMode && currSlotNumber === currentStepIndex}
                />
            </div>
        </div>
    );
};

export default CodeTrack;