/**
 * @file BLEContext.js
 * @description Context provider for Bluetooth Low Energy functionality, managing
 * connection state and port data for connected devices including motors and sensors.
 * Updated to properly handle all motor types (Medium, Large, Small) as interchangeable.
 * Enhanced with program execution state tracking and debug logging controls.
 * Added currently executing step tracking for visual feedback during program execution.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { newSpikeBLE } from "../ble_resources/spike_ble";

const BLEContext = createContext();

// Debug logging toggles - set to false to reduce console noise
const DEBUG_DEVICE_NOTIFICATIONS = false;
const DEBUG_PROGRAM_FLOW = true;

// Device type constants - Updated to include all motor types
export const DEVICE_TYPES = {
    MOTOR_MEDIUM: 0x30, // Medium Motor
    MOTOR_LARGE: 0x31, // Large Motor
    MOTOR_SMALL: 0x41, // Small Motor
    FORCE_SENSOR: 0x3c, // Force sensor device type
    COLOR_SENSOR: 0x3d, // Color sensor device type
    DISTANCE_SENSOR: 0x3e, // Distance sensor device type

    // Legacy compatibility - keep MOTOR as Medium for backward compatibility
    MOTOR: 0x30,
};

/**
 * Helper function to check if a device type is any kind of motor
 * @param {number} deviceType - The device type to check
 * @returns {boolean} True if the device type is any motor variant
 */
export const isMotorType = (deviceType) => {
    return (
        deviceType === DEVICE_TYPES.MOTOR_MEDIUM ||
        deviceType === DEVICE_TYPES.MOTOR_LARGE ||
        deviceType === DEVICE_TYPES.MOTOR_SMALL
    );
};

/**
 * Helper function to get the motor family type (normalized to Medium Motor)
 * for compatibility with existing dashboard code
 * @param {number} deviceType - The actual motor device type
 * @returns {number} Normalized motor type (MOTOR_MEDIUM) or original type if not a motor
 */
export const getNormalizedMotorType = (deviceType) => {
    return isMotorType(deviceType) ? DEVICE_TYPES.MOTOR_MEDIUM : deviceType;
};

/**
 * Helper function to get human-readable motor type name
 * @param {number} deviceType - The motor device type
 * @returns {string} Human-readable motor type name
 */
export const getMotorTypeName = (deviceType) => {
    switch (deviceType) {
        case DEVICE_TYPES.MOTOR_MEDIUM:
            return "Medium Motor";
        case DEVICE_TYPES.MOTOR_LARGE:
            return "Large Motor";
        case DEVICE_TYPES.MOTOR_SMALL:
            return "Small Motor";
        default:
            return "Unknown Motor";
    }
};

/**
 * Get expected device type for a slot configuration
 * @param {string} type - Instruction type ('action', 'input', etc.)
 * @param {string} subtype - Instruction subtype ('motor', 'button', etc.)
 * @returns {number|null} Expected device type constant or null if no specific type required
 */
export const getExpectedDeviceType = (type, subtype) => {
    if (type === "action" && subtype === "motor") {
        // For motor instructions, we accept any motor type
        // Return Medium Motor as the "expected" type for compatibility
        return DEVICE_TYPES.MOTOR_MEDIUM;
    }
    if (type === "input" && subtype === "button")
        return DEVICE_TYPES.FORCE_SENSOR;
    if (type === "input" && subtype === "color")
        return DEVICE_TYPES.COLOR_SENSOR;
    if (type === "input" && subtype === "distance")
        return DEVICE_TYPES.DISTANCE_SENSOR;
    return null;
};

/**
 * Check if an actual device type is compatible with the expected device type
 * This handles motor type interchangeability
 * @param {number} expectedType - The expected device type
 * @param {number} actualType - The actual connected device type
 * @returns {boolean} True if the types are compatible
 */
export const isDeviceTypeCompatible = (expectedType, actualType) => {
    // If no expected type, any device is compatible
    if (!expectedType || !actualType) {
        return true;
    }

    // Check if both are motors - if so, they're compatible regardless of specific type
    if (isMotorType(expectedType) && isMotorType(actualType)) {
        if (DEBUG_DEVICE_NOTIFICATIONS) {
            console.log(
                `Motor compatibility check: Expected ${getMotorTypeName(
                    expectedType,
                )}, Got ${getMotorTypeName(actualType)} - Compatible`,
            );
        }
        return true;
    }

    // For non-motor devices, require exact match
    const isExactMatch = expectedType === actualType;
    if (DEBUG_DEVICE_NOTIFICATIONS) {
        console.log(
            `Device type check: Expected ${expectedType}, Got ${actualType} - ${
                isExactMatch ? "Compatible" : "Incompatible"
            }`,
        );
    }
    return isExactMatch;
};

/**
 * Get human-readable device name for UI display
 * @param {string} type - Instruction type
 * @param {string} subtype - Instruction subtype
 * @returns {string} Human-readable device name
 */
export const getDeviceName = (type, subtype) => {
    if (type === "action" && subtype === "motor") return "Motor";
    if (type === "input" && subtype === "button") return "Force Sensor";
    if (type === "input" && subtype === "color") return "Color Sensor";
    if (type === "input" && subtype === "distance") return "Distance Sensor";
    return "Device";
};

export const useBLE = () => {
    const context = useContext(BLEContext);
    if (!context) {
        throw new Error("useBLE must be used within a BLEProvider");
    }
    return context;
};

export const BLEProvider = ({ children }) => {
    const [ble] = useState(() => newSpikeBLE());
    const [isConnected, setIsConnected] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [currentlyExecutingStep, setCurrentlyExecutingStep] = useState(null);
    const [portStates, setPortStates] = useState({
        A: null,
        B: null,
        C: null,
        D: null,
        E: null,
        F: null,
    });

    /**
     * Stop any currently running program on the robot
     * @param {number} slot - Program slot to stop (defaults to 0)
     * @returns {Promise<boolean>} Success status
     */
    const stopRunningProgram = async (slot = 0) => {
        try {
            if (DEBUG_PROGRAM_FLOW) {
                console.log(
                    `BLEContext: Attempting to stop program in slot ${slot}`,
                );
            }

            if (!isConnected) {
                console.warn(
                    "BLEContext: Cannot stop program - not connected to robot",
                );
                return false;
            }

            // Send stop command to robot
            await ble.stopProgram(slot);

            if (DEBUG_PROGRAM_FLOW) {
                console.log(`BLEContext: Stop command sent for slot ${slot}`);
            }

            return true;
        } catch (error) {
            console.error("BLEContext: Error stopping program:", error);
            // Don't change isRunning state on error - wait for actual notification
            return false;
        }
    };

    /**
     * Send initial stop command to ensure clean state on connection
     */
    const ensureStoppedState = async () => {
        try {
            if (DEBUG_PROGRAM_FLOW) {
                console.log(
                    "BLEContext: Sending initial stop command to ensure clean state",
                );
            }
            await stopRunningProgram(0);
        } catch (error) {
            console.warn("BLEContext: Initial stop command failed:", error);
        }
    };

    // Handle device disconnections
    useEffect(() => {
        const handleDisconnect = () => {
            console.log("BLEContext: Handling unexpected disconnection");
            setIsConnected(false);
            setIsRunning(false); // Reset running state on disconnect
        };

        window.addEventListener("spikeDisconnected", handleDisconnect);

        return () => {
            window.removeEventListener("spikeDisconnected", handleDisconnect);
        };
    }, []);

    // Handle program flow notification events
    useEffect(() => {
        const handleProgramFlowNotification = (event) => {
            const message = event.detail;

            if (DEBUG_PROGRAM_FLOW) {
                console.log(
                    "BLEContext: Program flow notification received:",
                    message,
                );
            }

            // Update running state based on the stop flag
            const wasRunning = isRunning;
            const nowRunning = !message.stop; // stop: false means running, stop: true means stopped

            setIsRunning(nowRunning);

            if (DEBUG_PROGRAM_FLOW) {
                console.log(
                    `BLEContext: Program state changed from ${
                        wasRunning ? "running" : "stopped"
                    } to ${nowRunning ? "running" : "stopped"}`,
                );
            }
        };

        window.addEventListener(
            "spikeProgramFlowNotification",
            handleProgramFlowNotification,
        );

        return () => {
            window.removeEventListener(
                "spikeProgramFlowNotification",
                handleProgramFlowNotification,
            );
        };
    }, [isRunning]);

    // Handle console notification events for step tracking
    useEffect(() => {
        const handleConsoleNotification = (event) => {
            const message = event.detail;

            if (DEBUG_PROGRAM_FLOW) {
                console.log(
                    "BLEContext: Console notification received:",
                    message,
                );
            }

            // Check if this is an ORBITSlot message
            if (message.text && message.text.startsWith("ORBITSlot_")) {
                // Extract step number (convert from 1-based to 0-based)
                const stepNumberStr = message.text.replace("ORBITSlot_", "");
                const stepNumber = parseInt(stepNumberStr, 10) - 1; // Convert to 0-based

                if (!isNaN(stepNumber) && stepNumber >= 0) {
                    if (DEBUG_PROGRAM_FLOW) {
                        console.log(
                            `BLEContext: Executing step ${stepNumber} (was ${stepNumberStr} in message)`,
                        );
                    }
                    setCurrentlyExecutingStep(stepNumber);
                } else {
                    console.warn(
                        `BLEContext: Invalid step number in console message: ${message.text}`,
                    );
                }
            }
        };

        window.addEventListener(
            "spikeConsoleNotification",
            handleConsoleNotification,
        );

        return () => {
            window.removeEventListener(
                "spikeConsoleNotification",
                handleConsoleNotification,
            );
        };
    }, []);

    // Reset executing step when program stops
    useEffect(() => {
        if (!isRunning) {
            if (DEBUG_PROGRAM_FLOW) {
                console.log(
                    "BLEContext: Program stopped, resetting currently executing step",
                );
            }
            setCurrentlyExecutingStep(null);
        }
    }, [isRunning]);

    // Handle device notification events
    useEffect(() => {
        const handleDeviceNotification = (event) => {
            const message = event.detail;

            if (DEBUG_DEVICE_NOTIFICATIONS) {
                console.log(
                    "BLEContext: Processing device notification:",
                    message,
                );
            }

            // Reset port states for new notification
            const newPortStates = {
                A: null,
                B: null,
                C: null,
                D: null,
                E: null,
                F: null,
            };

            // Process each message in the notification
            message.messages.forEach((msg) => {
                // Handle different device types
                if (msg.name === "Motor") {
                    const portLetter = String.fromCharCode(
                        65 + msg.values.port,
                    );

                    // Store the actual device type but also provide normalized type
                    const actualDeviceType =
                        msg.values.deviceType || DEVICE_TYPES.MOTOR_MEDIUM;

                    newPortStates[portLetter] = {
                        // Store actual device type for accurate reporting
                        deviceType: actualDeviceType,
                        actualMotorType: actualDeviceType,
                        // Provide normalized type for backward compatibility
                        type: getNormalizedMotorType(actualDeviceType),
                        connected: true,
                        // Add motor type information for UI display
                        motorTypeName: getMotorTypeName(actualDeviceType),
                        isMotor: true,
                        ...msg.values,
                    };

                    if (DEBUG_DEVICE_NOTIFICATIONS) {
                        console.log(
                            `BLEContext: Detected ${getMotorTypeName(
                                actualDeviceType,
                            )} on port ${portLetter}`,
                            msg.values,
                        );
                    }
                } else if (msg.name === "Force") {
                    const portLetter = String.fromCharCode(
                        65 + msg.values.port,
                    );
                    newPortStates[portLetter] = {
                        deviceType: DEVICE_TYPES.FORCE_SENSOR,
                        type: DEVICE_TYPES.FORCE_SENSOR, // Keep both for compatibility
                        connected: true,
                        pressureDetected: msg.values.pressureDetected === 1,
                        measuredValue: msg.values.measuredValue,
                        isMotor: false,
                        ...msg.values,
                    };

                    if (DEBUG_DEVICE_NOTIFICATIONS) {
                        console.log(
                            `BLEContext: Detected Force Sensor on port ${portLetter}`,
                            msg.values,
                        );
                    }
                } else if (msg.name === "Color") {
                    const portLetter = String.fromCharCode(
                        65 + msg.values.port,
                    );

                    // Map color value to a readable name based on LEGO SPIKE Prime color constants
                    let colorName = "Unknown";
                    switch (msg.values.color) {
                        case 0:
                            colorName = "Black";
                            break;
                        case 1:
                            colorName = "Pink";
                            break;
                        case 2:
                            colorName = "Purple";
                            break;
                        case 3:
                            colorName = "Blue";
                            break;
                        case 4:
                            colorName = "Light Blue";
                            break;
                        case 5:
                            colorName = "Teal";
                            break;
                        case 6:
                            colorName = "Green";
                            break;
                        case 7:
                            colorName = "Yellow";
                            break;
                        case 8:
                            colorName = "Orange";
                            break;
                        case 9:
                            colorName = "Red";
                            break;
                        case 10:
                            colorName = "White";
                            break;
                        case -1:
                            colorName = "Unknown";
                            break;
                        default:
                            colorName = "Unknown";
                            break;
                    }

                    newPortStates[portLetter] = {
                        deviceType: DEVICE_TYPES.COLOR_SENSOR,
                        type: DEVICE_TYPES.COLOR_SENSOR,
                        connected: true,
                        color: msg.values.color,
                        colorName: colorName,
                        displayValue: colorName,
                        // Scale raw values to 0-1023 range
                        rawRed: Math.round(msg.values.rawRed / 64),
                        rawGreen: Math.round(msg.values.rawGreen / 64),
                        rawBlue: Math.round(msg.values.rawBlue / 64),
                        // Keep original values for reference
                        rawRedOriginal: msg.values.rawRed,
                        rawGreenOriginal: msg.values.rawGreen,
                        rawBlueOriginal: msg.values.rawBlue,
                        extraField: msg.values.extraField,
                        isMotor: false,
                        ...msg.values,
                    };

                    if (DEBUG_DEVICE_NOTIFICATIONS) {
                        console.log(
                            `BLEContext: Detected Color Sensor on port ${portLetter}`,
                            msg.values,
                        );
                    }
                }
                // Handle other device types as needed...
            });

            // Replace port states entirely instead of merging
            setPortStates(newPortStates);
        };

        window.addEventListener(
            "spikeDeviceNotification",
            handleDeviceNotification,
        );

        return () => {
            window.removeEventListener(
                "spikeDeviceNotification",
                handleDeviceNotification,
            );
        };
    }, []);

    // Reset states when disconnected
    useEffect(() => {
        if (!isConnected) {
            setPortStates({
                A: null,
                B: null,
                C: null,
                D: null,
                E: null,
                F: null,
            });
            setIsRunning(false);
            setCurrentlyExecutingStep(null);
        } else {
            // Send stop command when newly connected to ensure clean state
            ensureStoppedState();
        }
    }, [isConnected]);

    // Define the function inside the provider so it has access to current portStates
    const checkDisconnectedDevices = (slots) => {
        const disconnectedDevices = [];

        slots.forEach((slot, index) => {
            if (!slot?.type || !slot?.subtype || !slot?.configuration) return;

            const configs = Array.isArray(slot.configuration)
                ? slot.configuration
                : [slot.configuration];

            configs.forEach((config) => {
                if (!config?.port) return;

                const portState = portStates[config.port];
                const isConnected =
                    portState?.connected ||
                    portState?.deviceType ||
                    portState?.type;

                if (!isConnected) {
                    disconnectedDevices.push({
                        slot: index + 1,
                        port: config.port,
                        type: slot.type,
                        subtype: slot.subtype,
                        deviceName: getDeviceName(slot.type, slot.subtype),
                    });
                    return;
                }

                // Check if the connected device matches the expected type
                const expectedDeviceType = getExpectedDeviceType(
                    slot.type,
                    slot.subtype,
                );
                const actualDeviceType = portState.deviceType || portState.type;

                // Use centralized device compatibility checking
                if (
                    !isDeviceTypeCompatible(
                        expectedDeviceType,
                        actualDeviceType,
                    )
                ) {
                    disconnectedDevices.push({
                        slot: index + 1,
                        port: config.port,
                        type: slot.type,
                        subtype: slot.subtype,
                        deviceName: getDeviceName(slot.type, slot.subtype),
                        mismatch: true,
                        expected: expectedDeviceType,
                        actual: actualDeviceType,
                        // Add helpful info for motor mismatches
                        expectedMotorName: isMotorType(expectedDeviceType)
                            ? getMotorTypeName(expectedDeviceType)
                            : null,
                        actualMotorName: isMotorType(actualDeviceType)
                            ? getMotorTypeName(actualDeviceType)
                            : null,
                    });
                }
            });
        });

        return disconnectedDevices;
    };

    const value = {
        ble,
        isConnected,
        setIsConnected,
        isRunning,
        currentlyExecutingStep,
        stopRunningProgram,
        portStates,
        DEVICE_TYPES,
        // Export helper functions for use by other components
        isMotorType,
        getNormalizedMotorType,
        getMotorTypeName,
        getExpectedDeviceType,
        isDeviceTypeCompatible,
        getDeviceName,
        checkDisconnectedDevices,
    };

    return <BLEContext.Provider value={value}>{children}</BLEContext.Provider>;
};
