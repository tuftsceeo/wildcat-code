/**
 * @file ButtonInstructionBlock.jsx
 * @description Block for visualizing button instructions in the code track.
 * Updated with child-friendly terminology.
 */

import React from "react";
import BaseInstructionBlock from "../../../../codeTrack/components/BaseInstructionBlock";
import styles from "../../../../codeTrack/styles/CodingTrack.module.css";
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
        <BaseInstructionBlock>
            <div className={styles.buttonVisualization}>
                {/* Large button visualization for the command (as coded) */}
                <div className={styles.buttonVisualContainer}>
                    <div className={styles.sensorContainer}>
                        <div className={styles.sensorBody}></div>
                        <div
                            className={`${styles.sensorButton} ${
                                waitCondition === "pressed"
                                    ? styles.pressed
                                    : ""
                            }`}
                        ></div>
                        <div className={styles.sensorMask}></div>
                        <div
                            className={`${styles.arrowIndicator} ${
                                waitCondition === "pressed"
                                    ? styles.arrowDown
                                    : styles.arrowUp
                            }`}
                        ></div>
                    </div>

                    <div className={styles.buttonStatus}>
                        {waitCondition === "pressed" ? "PRESSED" : "RELEASED"}
                    </div>
                    <div className={styles.motorLabel}>
                        {`BUTTON ${port} `}
                    </div>
                </div>
                {/* Visual representation of button state */}
                {/*<div className={styles.buttonStateVisual}>
                    <div
                        className={`${styles.buttonStateCircle} ${
                            waitCondition === "pressed"
                                ? styles.buttonPressed
                                : styles.buttonReleased
                        }`}
                    >
                        <div className={styles.buttonStateInner}></div>
                    </div>
                </div>*/}
            </div>
        </BaseInstructionBlock>
    );
};

export default ButtonInstructionBlock;
