/**
 * @file ButtonInstructionBlock.jsx
 * @description Block for visualizing button instructions in the code track.
 * Updated with child-friendly terminology.
 */

import React from "react";
import BaseInstructionBlock from "./BaseInstructionBlock";
import styles from "./CodingTrack.module.css";
import { Disc } from "lucide-react";

/**
 * Block for visualizing button instructions
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.configuration - Button configuration
 * @returns {JSX.Element} Visualization of button instruction
 */
const ButtonInstructionBlock = ({ configuration }) => {
    // Handle empty configuration
    if (!configuration) {
        return (
            <BaseInstructionBlock>
                <div className={styles.emptyInstruction}>
                    <p className={styles.emptyText}>No button configured</p>
                </div>
            </BaseInstructionBlock>
        );
    }

    const { port = "A", waitCondition = "pressed" } = configuration;

    return (
        <BaseInstructionBlock title={`WAIT FOR BUTTON ${port}`}>
            <div className={styles.buttonVisualization}>
                <div className={styles.buttonIcon}>
                    <Disc size={48} color="var(--color-sensor-main)" />
                </div>
                <div className={`${styles.buttonCondition} ${
                    waitCondition === "pressed" ? styles.pressedCondition : styles.releasedCondition
                }`}>
                    {waitCondition === "pressed" ? "UNTIL PRESSED" : "UNTIL RELEASED"}
                </div>
                
                {/* Visual representation of button state */}
                <div className={styles.buttonStateVisual}>
                    <div className={`${styles.buttonStateCircle} ${
                        waitCondition === "pressed" ? styles.buttonPressed : styles.buttonReleased
                    }`}>
                        <div className={styles.buttonStateInner}></div>
                    </div>
                </div>
            </div>
        </BaseInstructionBlock>
    );
};

export default ButtonInstructionBlock;