/**
 * @file ColorSensorDash.jsx
 * @description Dashboard component for configuring color sensor instructions.
 * Allows selecting a port and color to wait for.
 */

import React, { useState, useEffect, useRef } from "react";
import { useBLE } from "../../../../bluetooth/context/BLEContext";
import { XCircle } from "lucide-react";
import styles from "../styles/ColorSensorDash.module.css";

// Color options with their display names, values, and hex colors
const COLOR_OPTIONS = [
    { value: "black", label: "Black", hex: "#000000" },
    { value: "magenta", label: "Magenta", hex: "#D432A3" },
    { value: "purple", label: "Purple", hex: "#8A2BE2" },
    { value: "blue", label: "Blue", hex: "#3C90EE" },
    { value: "azure", label: "Azure", hex: "#93E6FC" },
    { value: "turquoise", label: "Turquoise", hex: "#40E0D0" },
    { value: "green", label: "Green", hex: "#4BA551" },
    { value: "yellow", label: "Yellow", hex: "#FBE376" },
    { value: "orange", label: "Orange", hex: "#FFA500" },
    { value: "red", label: "Red", hex: "#EB3327" },
    { value: "white", label: "White", hex: "#FFFFFF" },
    { value: "unknown", label: "Unknown", hex: "#FFFFFF", isUnknown: true }
];

const UnknownIcon = () => (
  <svg width="var(--font-size-2xl)" height="var(--font-size-2xl)" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" stroke="#FF0000" strokeWidth="3" fill="none"/>
    <line x1="10" y1="10" x2="30" y2="30" stroke="#FF0000" strokeWidth="3"/>
  </svg>
);

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
    
    // Get the hex color for the current reading
    const getCurrentColorHex = () => {
        if (currentColorReading === "Unknown" || currentColorReading === "No reading") {
            return "#FFFFFF"; // White background for unknown
        }
        
        const colorOption = COLOR_OPTIONS.find(
            option => option.label.toLowerCase() === currentColorReading.toLowerCase()
        );
        
        return colorOption ? colorOption.hex : "#FFFFFF";
    };

    // Check if the current reading is unknown
    const isCurrentReadingUnknown = () => {
        return currentColorReading === "Unknown" || currentColorReading === "No reading";
    };

    // Handle color selection
    const handleColorSelect = (colorValue) => {
        setSelectedColor(colorValue);
        if (onUpdate) {
            console.log("ColorSensorControl: Color changed to", colorValue);
            onUpdate(port, { color: colorValue });
        }
    };

    return (
        <div className={styles.colorSensorControl}>
            <div className={styles.portLabel}>Port {port}</div>
            <div className={styles.connectionStatus}>{isConnected ? "Connected" : "Not Connected"}</div>
            
            {/* Live sensor reading */}
            {isConnected && (
                <div className={styles.liveReading}>
                    <div className={styles.sensorVisual}>
                        <div className={styles.sensorBody}>
                            {isCurrentReadingUnknown() ? (
                                <div className={styles.unknownIndicator}>
                                    <UnknownIcon />
                                </div>
                            ) : (
                                <div 
                                    className={styles.sensorColor} 
                                    style={{ backgroundColor: getCurrentColorHex() }}
                                ></div>
                            )}
                        </div>
                    </div>
                    <div className={styles.readingLabel}>
                        <span>Current Color: </span>
                        <span className={styles.colorValue}>{currentColorReading}</span>
                    </div>
                </div>
            )}
            
            {/* Color palette */}
            <div className={styles.colorPalette}>
                <div className={styles.paletteLabel}>Select a color to wait for:</div>
                <div className={styles.colorCircles}>
                    {COLOR_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            className={`${styles.colorCircle} ${selectedColor === option.value ? styles.selected : ''}`}
                            style={{ backgroundColor: option.hex }}
                            onClick={() => handleColorSelect(option.value)}
                            disabled={!isConnected}
                            aria-label={`Select ${option.label} color`}
                        >
                            {option.isUnknown && <UnknownIcon />}
                            {selectedColor === option.value && (
                                <div className={styles.selectedIndicator}></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
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
