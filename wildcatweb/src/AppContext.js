// AppContext.js
import React, { createContext, useState } from "react";

// Create the context
const AppContext = createContext();

// Create the provider component
const AppProvider = ({ children }) => {
    // Define the shared state
    const [currSlotNumber, setCurrSlotNumber] = useState(0); // Current slot number
    const [missionSteps, setMissionSteps] = useState(2); // Number of steps (you can make it dynamic later)
    const [pyCode, setPyCode] = useState(""); // Python code
    const [canRun, setCanRun] = useState(false); // Controls if the code is ready to run

    return (
        <AppContext.Provider
            value={{
                currSlotNumber,
                setCurrSlotNumber,
                missionSteps,
                setMissionSteps,
                pyCode,
                setPyCode,
                canRun,
                setCanRun,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
