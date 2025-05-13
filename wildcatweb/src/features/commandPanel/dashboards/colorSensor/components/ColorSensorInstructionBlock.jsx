/**
 * @file ColorSensorInstructionBlock.jsx
 * @description Component that visualizes a color sensor instruction in the coding track.
 * Updated with a realistic sensor appearance.
 */

import React from "react";
import { useBLE } from "../../../../bluetooth/context/BLEContext";
import BaseInstructionBlock from "../../../../codeTrack/components/BaseInstructionBlock";
import styles from "../styles/ColorSensorInstructionBlock.module.css";

// Color mapping for visualization - matching the dashboard colors
const COLOR_MAP = {
    red: "#EB3327",
    green: "#4BA551",
    blue: "#3C90EE",
    yellow: "#FBE376",
    white: "#FFFFFF",
    black: "#000000",
    pink: "#D432A3",
    orange: "#FFA500",
    azure: "#93E6FC",
    purple: "#8A2BE2",
    teal: "#40E0D0",
    unknown: "#FFFFFF",
};

// Unknown icon component
const UnknownIcon = () => (
    <svg
        width="var(--font-size-lg)"
        height="var(--font-size-lg)"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle
            cx="20"
            cy="20"
            r="18"
            stroke="#FF0000"
            strokeWidth="3"
            fill="none"
        />
        <line
            x1="10"
            y1="10"
            x2="30"
            y2="30"
            stroke="#FF0000"
            strokeWidth="3"
        />
    </svg>
);

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

    // Check if the color is "unknown"
    const isUnknown = color === "unknown";

    return (
        <BaseInstructionBlock>
            <div className={styles.colorSensorVisualization}>
                <div className={styles.sensorContainer}>
                    {/* Realistic sensor visualization with nested structure */}
                    <div className={styles.sensorBody}>
                        <div className={styles.sensorFrame}>
                            <div className={styles.sensorLens}>
                                {isUnknown ? (
                                    <div className={styles.unknownIndicator}>
                                        <UnknownIcon />
                                    </div>
                                ) : (
                                    <div
                                        className={styles.sensorColor}
                                        style={{ backgroundColor: COLOR_MAP[color] || "#CCCCCC" }}
                                    ></div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.sensorLabel}>{`COLOR SENSOR ${port}`}</div>
                </div>
                <div className={styles.waitLabel}>WAIT FOR {color?.toUpperCase() || "COLOR"}</div>
            </div>
        </BaseInstructionBlock>
    );
};

export default ColorSensorInstructionBlock;
