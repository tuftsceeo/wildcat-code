/**
 * @file ColorSensorDash.jsx
 * @description Dashboard component for configuring color sensor instructions.
 * Allows selecting a port and color to wait for.
 */

import React, { useState, useEffect, useRef } from "react";
import { useBLE } from "../../../../bluetooth/context/BLEContext";
import styles from "../styles/ColorSensorDash.module.css";

// Color options with their display names and values
const COLOR_OPTIONS = [
    { value: "black", label: "Black" },
    { value: "magenta", label: "Magenta" },
    { value: "purple", label: "Purple" },
    { value: "blue", label: "Blue" },
    { value: "azure", label: "Azure" },
    { value: "turquoise", label: "Turquoise" },
    { value: "green", label: "Green" },
    { value: "yellow", label: "Yellow" },
    { value: "orange", label: "Orange" },
    { value: "red", label: "Red" },
    { value: "white", label: "White" },
];

/**
 * Individual color sensor control component
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.port - Port letter (A-F)
 * @param {Function} props.onUpdate - Callback when configuration changes
 * @param {Object} props.configuration - Current configuration
 * @returns {JSX.Element} Color sensor control
 */
const ColorSensorControl = ({ port, onUpdate, configuration }) => {
    const { portStates, DEVICE_TYPES } = useBLE();
    const [selectedColor, setSelectedColor] = useState(configuration?.color || "black");
    const [isConnected, setIsConnected] = useState(false);

    // Update connection state when port state changes
    useEffect(() => {
        const portState = portStates?.[port];
        setIsConnected(portState?.deviceType === DEVICE_TYPES.COLOR_SENSOR || portState?.type === DEVICE_TYPES.COLOR_SENSOR);
    }, [portStates, port, DEVICE_TYPES.COLOR_SENSOR]);

    // Get the current color reading from the port state
    const currentColorReading = portStates?.[port]?.displayValue || "No reading";

    // Handle color selection
    const handleColorChange = (event) => {
        const newColor = event.target.value;
        setSelectedColor(newColor);
        if (onUpdate) {
            console.log("ColorSensorControl: Color changed to", newColor);
            onUpdate(port, { color: newColor });
        }
    };

    return (
        <div className={styles.colorSensorControl}>
            <div className={styles.portLabel}>Port {port}</div>
            <div className={styles.connectionStatus}>{isConnected ? "Connected" : "Not Connected"}</div>
            {isConnected && (
                <div className={styles.liveReading}>
                    <span>Current Color: </span>
                    <span className={styles.colorValue}>{currentColorReading}</span>
                </div>
            )}
            <select
                value={selectedColor}
                onChange={handleColorChange}
                className={styles.colorSelect}
                disabled={!isConnected}
            >
                {COLOR_OPTIONS.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

/**
 * Main color sensor dashboard component
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onUpdate - Callback when configuration changes
 * @param {Object} props.configuration - Current configuration
 * @param {Array} props.slotData - All slot data for finding configured sensors
 * @param {number} props.currSlotNumber - Current slot number
 * @returns {JSX.Element} Color sensor dashboard
 */
export const ColorSensorDash = ({ onUpdate, configuration, slotData, currSlotNumber }) => {
    const { portStates, DEVICE_TYPES } = useBLE();
    const [dismissedPorts, setDismissedPorts] = useState(new Set());

    // Find all ports with configured color sensors from slotData
    const configuredPorts = React.useMemo(() => {
        const configuredSet = new Set();
        if (slotData) {
            slotData.forEach((slot, index) => {
                if (index !== currSlotNumber && slot?.type === "input" && slot?.subtype === "color") {
                    const port = slot.configuration?.port;
                    if (port) configuredSet.add(port);
                }
            });
        }
        return configuredSet;
    }, [slotData, currSlotNumber]);

    // Handle configuration updates
    const handleConfigUpdate = (port, newConfig) => {
        if (onUpdate) {
            // Ensure we're passing both port and color in the configuration
            const config = {
                port: port,
                color: newConfig.color || "black", // Default to black if not specified
                ...newConfig
            };
            console.log("ColorSensorDash: Updating configuration", config);
            onUpdate(config);
        }
    };

    // Get available ports (those with color sensors)
    const availablePorts = React.useMemo(() => {
        return Object.entries(portStates)
            .filter(([port, state]) => {
                if (!state) return false;
                if (dismissedPorts.has(port)) return false;
                return state.deviceType === DEVICE_TYPES.COLOR_SENSOR || state.type === DEVICE_TYPES.COLOR_SENSOR;
            })
            .map(([port]) => port);
    }, [portStates, dismissedPorts, DEVICE_TYPES.COLOR_SENSOR]);

    // Handle dismissing a port
    const handleDismissPort = (port) => {
        setDismissedPorts((prev) => new Set([...prev, port]));
    };

    return (
        <div className={styles.colorSensorDash}>
            <div className={styles.header}>
                <h3>Color Sensor</h3>
                <p>Select a color to wait for</p>
            </div>

            <div className={styles.sensorsContainer}>
                {availablePorts.map((port) => (
                    <ColorSensorControl
                        key={port}
                        port={port}
                        onUpdate={handleConfigUpdate}
                        configuration={configuration}
                    />
                ))}
            </div>

            {availablePorts.length === 0 && <div className={styles.noSensors}>No color sensors detected. Please connect a color sensor and try again.</div>}
        </div>
    );
};
