/**
 * @file InstructionVisualizer.jsx
 * @description Component that determines and renders the appropriate instruction block
 * based on the type and configuration of the instruction.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

// InstructionVisualizer.jsx
import React from "react";
import styles from "../styles/CodingTrack.module.css"; // Still using the original CSS
import MotorInstructionBlock from "../../commandPanel/dashboards/motor/components/MotorInstructionBlock";
import TimerInstructionBlock from "../../commandPanel/dashboards/timer/components/TimerInstructionBlock";
import ButtonInstructionBlock from "../../commandPanel/dashboards/button/components/ButtonInstructionBlock";

/**
 * Component that determines and renders the appropriate instruction block
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.instruction - Instruction configuration
 * @returns {JSX.Element} The appropriate instruction block
 */
const InstructionVisualizer = ({ instruction }) => {
    if (!instruction || !instruction.type) {
        return (
            <div className={styles.emptyInstruction}>
                <p className={styles.emptyText}>No instruction configured</p>
            </div>
        );
    }

    if (instruction.type === "action" && instruction.subtype === "motor") {
        return (
            <MotorInstructionBlock configuration={instruction.configuration} />
        );
    }

    if (instruction.type === "input" && instruction.subtype === "time") {
        return (
            <TimerInstructionBlock configuration={instruction.configuration} />
        );
    }

    if (instruction.type === "input" && instruction.subtype === "button") {
        return (
            <ButtonInstructionBlock configuration={instruction.configuration} />
        );
    }

    // Default case for unknown instruction types
    return (
        <div className={styles.unknownInstruction}>
            <p className={styles.unknownText}>
                Unknown instruction type: {instruction.type} -{" "}
                {instruction.subtype}
            </p>
        </div>
    );
};

export default InstructionVisualizer;
