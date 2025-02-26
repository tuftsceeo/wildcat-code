// MotorInstructionBlock.jsx
import React from "react";
import BaseInstructionBlock from "./BaseInstructionBlock";
import MotorAnimation from "./MotorAnimation";
import styles from "./CodingTrack.module.css"; // Still using the original CSS

/**
 * Block for visualizing motor instructions
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object|Array} props.configuration - Motor configuration
 * @returns {JSX.Element} Visualization of motor instruction
 */
const MotorInstructionBlock = ({ configuration }) => {
    // Handle multiple motors if present
    if (Array.isArray(configuration) && configuration.length > 0) {
        // If there are multiple motors, render them together
        if (configuration.length > 1) {
            return (
                <div className={styles.multiMotorContainer}>
                    {configuration.map((config, index) => (
                        <BaseInstructionBlock
                            key={index}
                            title={`MOTOR ${config.port || "A"}`}
                        >
                            <MotorAnimation
                                direction={config.direction || "forward"}
                                speed={config.speed || 5000}
                                active={true}
                                port={config.port || "A"}
                            />
                        </BaseInstructionBlock>
                    ))}
                </div>
            );
        }

        // If there's just one motor in the array
        const config = configuration[0];
        return (
            <BaseInstructionBlock title={`MOTOR ${config.port || "A"}`}>
                <MotorAnimation
                    direction={config.direction || "forward"}
                    speed={config.speed || 5000}
                    active={true}
                    port={config.port || "A"}
                />
            </BaseInstructionBlock>
        );
    }

    // Single motor configuration (not in an array)
    const config = configuration || {};
    return (
        <BaseInstructionBlock title={`MOTOR ${config.port || "A"}`}>
            <MotorAnimation
                direction={config.direction || "forward"}
                speed={config.speed || 5000}
                active={true}
                port={config.port || "A"}
            />
        </BaseInstructionBlock>
    );
};

export default MotorInstructionBlock;
