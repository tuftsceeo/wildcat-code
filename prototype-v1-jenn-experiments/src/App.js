import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FunctionDefault } from "./FunctionDefault.jsx";
import { RunMenu } from "./RunMenu.jsx";
import { BluetoothUI } from "./BluetoothUI.jsx";
import { KnobProvider } from "./KnobContext.js";
import CodingTrack from "./CodingTrack.jsx";
import { CustomizationPage } from "./CustomizationPage.jsx";

// Main App component
function App() {
    const [pyCode, setPyCode] = useState(""); // Stores Python code written in the app
    const [canRun, setCanRun] = useState(false); // Controls if the code is ready to run
    // Lifted currSlot state to track the currently selected slot
    const [currSlotNumber, setCurrSlotNumber] = useState(0);
    const missionSteps = 2; // Sets the maximum index of slots (total of 3 slots: 0, 1, and 2)

    return (
        <KnobProvider>
            <DndProvider backend={HTML5Backend}>
                <>
                    <RunMenu
                        pyCode={pyCode}
                        canRun={canRun}
                        currSlotNumber={currSlotNumber}
                        missionSteps={missionSteps}
                    />
                    {/* Pass currSlot and setCurrSlot to CodingTrack */}
                    <CodingTrack
                        setPyCode={setPyCode}
                        setCanRun={setCanRun}
                        currSlotNumber={currSlotNumber}
                        setCurrSlotNumber={setCurrSlotNumber}
                        missionSteps={missionSteps}
                    />
                    <FunctionDefault />
                    {/* Pass currSlot to BluetoothUI to access in HelpDialog */}
                    <BluetoothUI
                        currSlotNumber={currSlotNumber}
                        missionSteps={missionSteps}
                    />
                </>
            </DndProvider>
        </KnobProvider>
    );
}

export default App;
