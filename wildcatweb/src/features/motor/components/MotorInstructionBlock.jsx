/**
 * @file MotorInstructionBlock.jsx
 * @description Block for visualizing motor instructions in the code track,
 * supporting both single and multiple motor configurations.
 */

import React from "react";
import BaseInstructionBlock from "./BaseInstructionBlock";
import MotorAnimation from "./MotorAnimation";
Replace: import styles from "../styles/CodingTrack.module.css";

/**
 * Block for visualizing motor instructions
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object|Array} props.configuration - Motor configuration
 * @returns {JSX.Element} Visualization of motor instruction
 */
const MotorInstructionBlock = ({ configuration }) => {
    // Handle empty configuration
    if (!configuration) {
        return (
            <BaseInstructionBlock>
                <div className={styles.emptyInstruction}>
                    <p className={styles.emptyText}>No motor configured</p>
                </div>
            </BaseInstructionBlock>
        );
    }

    // Handle multiple motors if present
    if (Array.isArray(configuration) && configuration.length > 0) {
        // If there are multiple motors, render them together
        if (configuration.length > 1) {
            return (
                <BaseInstructionBlock>
                    <div className={styles.multiMotorContainer}>
                        {configuration.map((config, index) => (
                            <div
                                key={`motor-${config.port || index}`}
                                className={styles.motorContainer}
                            >
                                <MotorAnimation
                                    speed={config.speed || 0}
                                    active={true}
                                    port={config.port || "A"}
                                />
                                <div className={styles.motorLabel}>
                                    MOTOR {config.port || "A"}
                                </div>
                            </div>
                        ))}
                    </div>
                </BaseInstructionBlock>
            );
        }

        // If there's just one motor in the array
        const config = configuration[0];
        return (
            <BaseInstructionBlock>
                <MotorAnimation
                    speed={config.speed || 0}
                    active={true}
                    port={config.port || "A"}
                />
                <div className={styles.motorLabel}>
                    MOTOR {config.port || "A"}
                </div>
            </BaseInstructionBlock>
        );
    }

    // Single motor configuration (not in an array)
    return (
        <BaseInstructionBlock>
            <MotorAnimation
                speed={configuration.speed || 0}
                active={true}
                port={configuration.port || "A"}
            />
            <div className={styles.motorLabel}>
                MOTOR {configuration.port || "A"}
            </div>
        </BaseInstructionBlock>
    );
};

export default MotorInstructionBlock;
