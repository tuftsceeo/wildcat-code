/**
 * @file ColorSensorInstructionBlock.jsx
 * @description Component that visualizes a color sensor instruction in the coding track.
 */

import React from "react";
import { useBLE } from "../../../../bluetooth/context/BLEContext";
import BaseInstructionBlock from "../../../instructions/components/BaseInstructionBlock";
import styles from "../styles/ColorSensorInstructionBlock.module.css";

// Color mapping for visualization
const COLOR_MAP = {
    red: "#FF0000",
    green: "#00FF00",
    blue: "#0000FF",
    yellow: "#FFFF00",
    white: "#FFFFFF",
    black: "#000000",
    magenta: "#FF00FF",
    orange: "#FFA500",
    azure: "#007ACC",
};

/**
 * Component that visualizes a color sensor instruction
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.configuration - Color sensor configuration
 * @returns {JSX.Element} Color sensor instruction block
 */
const ColorSensorInstructionBlock = ({ configuration }) => {
    const { portStates, DEVICE_TYPES } = useBLE();
    const { port, color } = configuration || {};

    // Check if sensor is connected
    const isConnected = port && portStates?.[port]?.deviceType === DEVICE_TYPES.COLOR_SENSOR;

    return (
        <BaseInstructionBlock>
            <div className={styles.colorSensorVisualization}>
                <div className={styles.sensorContainer}>
                    <div className={styles.sensorBody}>
                        <div
                            className={styles.colorIndicator}
                            style={{
                                backgroundColor: COLOR_MAP[color] || "#CCCCCC",
                                opacity: isConnected ? 1 : 0.5,
                            }}
                        />
                    </div>
                    <div className={styles.sensorLabel}>{`COLOR SENSOR ${port}`}</div>
                </div>
                <div className={styles.waitLabel}>WAIT FOR {color?.toUpperCase() || "COLOR"}</div>
            </div>
        </BaseInstructionBlock>
    );
};

export default ColorSensorInstructionBlock;
