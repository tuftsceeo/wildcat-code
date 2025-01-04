import React, { createContext, useContext, useState } from 'react';
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

    const value = {
        ble,
        isConnected,
        setIsConnected
    };

    return (
        <BLEContext.Provider value={value}>
            {children}
        </BLEContext.Provider>
    );
};