// CodeTrack.jsx
import React from "react";
import styles from "./CodingTrack.module.css"; // Still using the original CSS
import NavigationControls from "./NavigationControls";
import InstructionVisualizer from "./InstructionVisualizer";
import { generateDescription } from "./InstructionDescriptionGenerator";

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
    const currentInstruction = slotData?.[currSlotNumber];

    // Navigation handlers
    const handlePrevious = () => {
        setCurrSlotNumber(Math.max(0, currSlotNumber - 1));
    };

    const handleNext = () => {
        setCurrSlotNumber(Math.min(currSlotNumber + 1, missionSteps));
    };

    // Test button handler
    const handleTest = () => {
        console.log(
            "Testing current instruction:",
            generateDescription(currentInstruction),
        );
        // Add implementation for test functionality here
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
