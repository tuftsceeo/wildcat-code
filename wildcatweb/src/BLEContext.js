import React, { createContext, useContext, useState, useEffect } from 'react';
import { newSpikeBLE } from "./ble_resources/spike_ble";
import { struct, u8, u16, s16, seq, s8, s32 } from "buffer-layout";

const BLEContext = createContext();

// Copy of DEVICE_MESSAGE_MAP for processing device states
const DEVICE_MESSAGE_MAP = {
    0x00: ["Battery", struct([u8("batteryLevel")])],
    0x01: [
        "IMU",
        struct([
            u8("faceUp"), // Hub Face pointing up
            u8("yawFace"), // Hub Face configured as yaw face
            s16("yaw"), // Yaw value
            s16("pitch"), // Pitch value
            s16("roll"), // Roll value
            s16("accelX"), // Accelerometer reading in X
            s16("accelY"), // Accelerometer reading in Y
            s16("accelZ"), // Accelerometer reading in Z
            s16("gyroX"), // Gyroscope reading in X
            s16("gyroY"), // Gyroscope reading in Y
            s16("gyroZ"), // Gyroscope reading in Z
        ]),
    ],
    0x02: ["5x5", struct([seq(u8(), 25, "pixels")])],
    0x0a: [
        "Motor",
        struct([
            u8("port"), // Hub Port the motor is connected to
            u8("deviceType"), // Motor Device Type
            s16("absolutePos"), // Absolute position in degrees
            s16("power"), // Power applied to the motor
            s8("speed"), // Speed of the motor
            s32("position"), // Position of the motor
        ]),
    ],
    // Add other device types as needed
};

export const useBLE = () => {
    const context = useContext(BLEContext);
    if (!context) {
        throw new Error('useBLE must be used within a BLEProvider');
    }
    return context;
};

export const BLEProvider = ({ children }) => {
    const [ble] = useState(() => newSpikeBLE());
    const [isConnected, setIsConnected] = useState(false);
    const [portStates, setPortStates] = useState({
        'A': null,
        'B': null,
        'C': null,
        'D': null,
        'E': null,
        'F': null
    });

    // Handle device disconnections
    useEffect(() => {
        const handleDisconnect = () => {
            console.log('BLEContext: Handling unexpected disconnection');
            setIsConnected(false);
        };

        window.addEventListener('spikeDisconnected', handleDisconnect);
        
        return () => {
            window.removeEventListener('spikeDisconnected', handleDisconnect);
        };
    }, []);

    // Handle device notification events
    useEffect(() => {
        const handleDeviceNotification = (event) => {
            const message = event.detail;
            console.log('Processing device notification:', message);

            // Reset port states for new notification
            const newPortStates = {
                'A': null,
                'B': null,
                'C': null,
                'D': null,
                'E': null,
                'F': null
            };

            // Process each message in the notification
            message.messages.forEach(msg => {
                if (msg.name === 'Motor') {
                    const portLetter = String.fromCharCode(65 + msg.values.port);
                    newPortStates[portLetter] = {
                        type: msg.values.deviceType,
                        connected: true,
                        ...msg.values
                    };
                }
            });

            // Update port states
            setPortStates(newPortStates);
        };

        window.addEventListener('spikeDeviceNotification', handleDeviceNotification);
        
        return () => {
            window.removeEventListener('spikeDeviceNotification', handleDeviceNotification);
        };
    }, []);

    // Reset when disconnected
    useEffect(() => {
        if (!isConnected) {
            setPortStates({
                'A': null,
                'B': null,
                'C': null,
                'D': null,
                'E': null,
                'F': null
            });
        }
    }, [isConnected]);

    const value = {
        ble,
        isConnected,
        setIsConnected,
        portStates
    };

    return (
        <BLEContext.Provider value={value}>
            {children}
        </BLEContext.Provider>
    );
};