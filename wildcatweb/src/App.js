/**
 * @file App.js
 * @description Example of how to integrate the CustomizationProvider and
 * CustomizationPage into the main application.
 */

import React, { useState } from "react";
import { Settings2 } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CommandPanel } from "./CommandPanel.jsx";
import { RunMenu } from "./RunMenu.jsx";
import { BluetoothUI } from "./BluetoothUI.jsx";
import { KnobProvider } from "./KnobContext.js";
import { BLEProvider } from "./BLEContext.js";
import { CustomizationProvider } from "./CustomizationContext";
import CustomizationPage from "./CustomizationPage.jsx";
import CodeTrack from "./CodeTrack.jsx";
import "./App.css";

function App() {
    const [pyCode, setPyCode] = useState("");
    const [canRun, setCanRun] = useState(false);
    const [currSlotNumber, setCurrSlotNumber] = useState(0);
    const missionSteps = 2;
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Define interface for slot data
    const createEmptySlot = () => ({
        type: null, // 'action' or 'input'
        subtype: null, // 'motor', 'time', etc.
        configuration: [], // Array of configurations for this slot
    });

    // Initialize slot data array with empty slots
    const [slotData, setSlotData] = useState(
        Array(missionSteps + 1)
            .fill(null)
            .map(() => createEmptySlot()),
    );

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

    return (
        <CustomizationProvider>
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
                                    setCurrSlotNumber={setCurrSlotNumber}
                                    missionSteps={missionSteps}
                                    slotData={slotData}
                                />
                            </div>

                            {/* Middle column - CodingTrack */}
                            <div className="center-column">
                                <CodeTrack
                                    setPyCode={setPyCode}
                                    setCanRun={setCanRun}
                                    currSlotNumber={currSlotNumber}
                                    setCurrSlotNumber={setCurrSlotNumber}
                                    missionSteps={missionSteps}
                                    slotData={slotData}
                                />
                            </div>

                            {/* Right column - Function Default & Bluetooth UI */}
                            <div className="control-column">
                                <div className="bluetooth-menu">
                                    <BluetoothUI
                                        currSlotNumber={currSlotNumber}
                                        missionSteps={missionSteps}
                                    />

                                    {/* We'll use the existing settings button in BluetoothUI to open the settings panel */}
                                </div>

                                <CommandPanel
                                    currSlotNumber={currSlotNumber}
                                    onSlotUpdate={handleSlotUpdate}
                                    slotData={slotData}
                                />
                            </div>

                            {/* Settings Modal */}
                            {isSettingsOpen && (
                                <CustomizationPage
                                    close={() => setIsSettingsOpen(false)}
                                />
                            )}
                        </div>
                    </DndProvider>
                </KnobProvider>
            </BLEProvider>
        </CustomizationProvider>
    );
}

export default App;
