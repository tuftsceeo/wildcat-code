/**
 * @file BLEContext.js
 * @description Context provider for Bluetooth Low Energy functionality, managing
 * connection state and port data for connected devices including motors and sensors.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { newSpikeBLE } from "../ble_resources/spike_ble";

const BLEContext = createContext();

// Device type constants
export const DEVICE_TYPES = {
    MOTOR: 0x30, // Motor device type
    FORCE_SENSOR: 0x3c, // Force sensor device type
    COLOR_SENSOR: 0x3d, // Color sensor device type
    DISTANCE_SENSOR: 0x3e, // Distance sensor device type
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
                    newPortStates[portLetter] = {
                        deviceType: DEVICE_TYPES.MOTOR,
                        type: DEVICE_TYPES.MOTOR, // Keep both for compatibility
                        connected: true,
                        ...msg.values,
                    };
                    console.log(
                        `BLEContext: Detected Motor on port ${portLetter}`,
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

    const value = {
        ble,
        isConnected,
        setIsConnected,
        portStates,
        DEVICE_TYPES,
    };

    return <BLEContext.Provider value={value}>{children}</BLEContext.Provider>;
};
