import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FunctionDefault } from "./FunctionDefault.jsx";
import { RunMenu } from "./RunMenu.jsx";
import { BluetoothUI } from "./BluetoothUI.jsx";
import { KnobProvider } from "./KnobContext.js";
import { BLEProvider } from "./BLEContext.js";
import CodingTrack from "./CodingTrack.jsx";
import "./App.css"; // Import the updated CSS

// Define interface for slot data
const createEmptySlot = () => ({
    type: null, // 'action' or 'input'
    subtype: null, // 'motor', 'time', etc.
    configuration: [], // Array of configurations for this slot
});

function App() {
    const [pyCode, setPyCode] = useState("");
    const [canRun, setCanRun] = useState(false);
    const [currSlotNumber, setCurrSlotNumber] = useState(0);
    const missionSteps = 2;

    // Initialize slot data array with empty slots
    const [slotData, setSlotData] = useState(
        Array(missionSteps + 1)
            .fill(null)
            .map(() => createEmptySlot()),
    );

    // Update Python code whenever slot data changes
    useEffect(() => {
        const newPyCode = generatePythonCode(slotData);
        setPyCode(newPyCode);

        // Enable run if all slots have configurations
        const isComplete = slotData.every(
            (slot) => slot.type && slot.subtype && slot.configuration,
        );
        setCanRun(isComplete);
    }, [slotData]);

    // Handle updates to slot configuration
    const handleSlotUpdate = (slotConfig) => {
        setSlotData((prevData) => {
            const newData = [...prevData];
            newData[currSlotNumber] = {
                ...slotConfig,
                isConfigured: true, // Mark as configured for visual indicator
            };
            return newData;
        });
    };

    // Generate Python code from slot configurations
    const generatePythonCode = (slots) => {
        let code = [];
        slots.forEach((slot, index) => {
            if (slot.type === "action" && slot.subtype === "motor") {
                const { buttonType, knobAngle, port } =
                    slot.configuration || {};
                if (buttonType === "GO") {
                    code.push(`motor.run(port.${port}, ${knobAngle})`);
                } else if (buttonType === "STOP") {
                    code.push(`motor.stop(port.${port})`);
                }
            } else if (slot.type === "input" && slot.subtype === "time") {
                const { seconds } = slot.configuration || {};
                if (seconds) {
                    code.push(`time.sleep(${seconds})`);
                }
            }
        });
        return code.join("\n");
    };

    return (
        <BLEProvider>
            <KnobProvider>
                <DndProvider backend={HTML5Backend}>
                    <div className="app-container">
                        {/* Left column - RunMenu */}
                        <div className="step-column">
                            <RunMenu
                                pyCode={pyCode}
                                canRun={canRun}
                                currSlotNumber={currSlotNumber}
                                missionSteps={missionSteps}
                                slotData={slotData}
                            />
                        </div>

                        {/* Middle column - CodingTrack */}
                        <div className="center-column">
                            <CodingTrack
                                setPyCode={setPyCode}
                                setCanRun={setCanRun}
                                currSlotNumber={currSlotNumber}
                                setCurrSlotNumber={setCurrSlotNumber}
                                missionSteps={missionSteps}
                                slotData={slotData}
                            />
                        </div>

                        {/* Right column - FunctionDefault */}
                        <div className="control-column">
                            <FunctionDefault
                                currSlotNumber={currSlotNumber}
                                onSlotUpdate={handleSlotUpdate}
                                slotData={slotData}
                            />
                        </div>

                        {/* Bluetooth UI positioned at top right */}
                        <div className="bluetooth-menu">
                            <BluetoothUI
                                currSlotNumber={currSlotNumber}
                                missionSteps={missionSteps}
                            />
                        </div>
                    </div>
                </DndProvider>
            </KnobProvider>
        </BLEProvider>
    );
}

export default App;
