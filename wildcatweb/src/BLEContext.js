import React, { createContext, useContext, useState, useEffect } from 'react';
import { newSpikeBLE } from "./ble_resources/spike_ble";

const BLEContext = createContext();

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

    // Track the current message batch
    const [messageCount, setMessageCount] = useState(0);
    const [currentCycleMotors, setCurrentCycleMotors] = useState({});

    const handleDeviceMessage = (event) => {
        const { name, values } = event.detail;
        
        // When we get a message that isn't a Motor message, increment the count
        if (name !== 'Motor') {
            setMessageCount(prev => prev + 1);
            return;
        }
        
        // For Motor messages, both update the motors and increment count
        const portLetter = String.fromCharCode(65 + values.port);
        setCurrentCycleMotors(prev => ({
            ...prev,
            [portLetter]: {
                type: values.deviceType,
                connected: true,
                ...values
            }
        }));
        setMessageCount(prev => prev + 1);
    };

    // Process complete cycles
    useEffect(() => {
        if (messageCount >= 5) {  // We've received all messages in this cycle
            console.log('Processing complete device cycle');
            console.log('Connected motors:', Object.keys(currentCycleMotors));

            // Reset all ports and only set the ones we currently see
            setPortStates({
                'A': null,
                'B': null,
                'C': null,
                'D': null,
                'E': null,
                'F': null,
                ...currentCycleMotors
            });

            // Reset for next cycle
            setMessageCount(0);
            setCurrentCycleMotors({});
        }
    }, [messageCount, currentCycleMotors]);

    useEffect(() => {
        window.addEventListener('deviceMessage', handleDeviceMessage);
        return () => {
            window.removeEventListener('deviceMessage', handleDeviceMessage);
            setMessageCount(0);
            setCurrentCycleMotors({});
        };
    }, []);

    // Reset everything when connection is lost
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
            setMessageCount(0);
            setCurrentCycleMotors({});
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