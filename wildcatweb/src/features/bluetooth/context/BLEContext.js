/**
 * @file BLEContext.js
 * @description Context provider for Bluetooth Low Energy functionality, managing
 * connection state and port data for connected devices including motors and sensors.
 * Updated to properly handle all motor types (Medium, Large, Small) as interchangeable.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { newSpikeBLE } from "../ble_resources/spike_ble";

const BLEContext = createContext();

// Device type constants - Updated to include all motor types
export const DEVICE_TYPES = {
    MOTOR_MEDIUM: 0x30, // Medium Motor
    MOTOR_LARGE: 0x31,  // Large Motor
    MOTOR_SMALL: 0x41,  // Small Motor
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
    return deviceType === DEVICE_TYPES.MOTOR_MEDIUM || 
           deviceType === DEVICE_TYPES.MOTOR_LARGE || 
           deviceType === DEVICE_TYPES.MOTOR_SMALL;
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
        console.log(`Motor compatibility check: Expected ${getMotorTypeName(expectedType)}, Got ${getMotorTypeName(actualType)} - Compatible`);
        return true;
    }

    // For non-motor devices, require exact match
    const isExactMatch = expectedType === actualType;
    console.log(`Device type check: Expected ${expectedType}, Got ${actualType} - ${isExactMatch ? 'Compatible' : 'Incompatible'}`);
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
    const [portStates, setPortStates] = useState({
        A: null,
        B: null,
        C: null,
        D: null,
        E: null,
        F: null,
    });

    // Handle device disconnections
    useEffect(() => {
        const handleDisconnect = () => {
            console.log("BLEContext: Handling unexpected disconnection");
            setIsConnected(false);
        };

        window.addEventListener("spikeDisconnected", handleDisconnect);

        return () => {
            window.removeEventListener("spikeDisconnected", handleDisconnect);
        };
    }, []);

    // Handle device notification events
    useEffect(() => {
        const handleDeviceNotification = (event) => {
            const message = event.detail;
            console.log("Processing device notification:", message);

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
                    const actualDeviceType = msg.values.deviceType || DEVICE_TYPES.MOTOR_MEDIUM;
                    
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
                    console.log(
                        `BLEContext: Detected ${getMotorTypeName(actualDeviceType)} on port ${portLetter}`,
                        msg.values,
                    );
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
                    console.log(
                        `BLEContext: Detected Force Sensor on port ${portLetter}`,
                        msg.values,
                    );
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
                    console.log(
                        `BLEContext: Detected Color Sensor on port ${portLetter}`,
                        msg.values,
                    );
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

    // Reset when disconnected
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
                if (!isDeviceTypeCompatible(expectedDeviceType, actualDeviceType)) {
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