/**
 * @file App.js
 * @description Main application component with support for reading level.
 */

import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CommandPanel } from "./CommandPanel.jsx";
import { RunMenu } from "./RunMenu.jsx";
import { BluetoothUI } from "./BluetoothUI.jsx";
import { KnobProvider } from "./KnobContext.js";
import { BLEProvider } from "./BLEContext.js";
import {
    CustomizationProvider,
    useCustomization,
} from "./CustomizationContext";
import CustomizationPage from "./CustomizationPage.jsx";
import CodeTrack from "./CodeTrack.jsx";
import "./App.css";

/**
 * Main application wrapper that provides context providers and applies settings
 *
 * @returns {JSX.Element} Main application component
 */
function AppWithCustomizationContext() {
    // Get customization settings
    const { readingLevel, language } = useCustomization();

    // Apply reading level to body data attribute
    useEffect(() => {
        document.body.dataset.readingLevel = readingLevel;
        document.body.dataset.language = language;
    }, [readingLevel, language]);

    return <AppContent />;
}

/**
 * Main application content
 */
function AppContent() {
    const [pyCode, setPyCode] = useState("");
    const [canRun, setCanRun] = useState(false);
    const [currSlotNumber, setCurrSlotNumber] = useState(0);
    const [missionSteps, setStepCount] = useState(2);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Log when missionSteps change
    useEffect(() => {
        console.log("App.js: missionSteps changed to", missionSteps);
    }, [missionSteps]);

    // Define interface for slot data
    const createEmptySlot = () => ({
        type: null, // 'action' or 'input'
        subtype: null, // 'motor', 'time', etc.
        configuration: [], // Array of configurations for this slot
    });

    // Initialize slot data array with empty slots
    const [slotData, setSlotData] = useState(
        Array(missionSteps)
            .fill(null)
            .map(() => createEmptySlot()),
    );

    // Update slotData when missionSteps changes
    useEffect(() => {
        console.log(
            "App.js: Updating slotData based on missionSteps",
            missionSteps,
        );
        setSlotData((prev) => {
            // Only update if the length needs to change
            if (prev.length !== missionSteps) {
                console.log(
                    "App.js: Adjusting slotData length from",
                    prev.length,
                    "to",
                    missionSteps,
                );

                // If expanding, add new empty slots
                if (prev.length < missionSteps) {
                    const additionalSlots = Array(missionSteps - prev.length)
                        .fill(null)
                        .map(() => createEmptySlot());
                    return [...prev, ...additionalSlots];
                }

                // If contracting, trim the array
                return prev.slice(0, missionSteps);
            }

            // Length is already correct
            return prev;
        });
    }, [missionSteps]);

    // Update Python code whenever slot data changes
    useEffect(() => {
        const newPyCode = generatePythonCode(slotData);
        setPyCode(newPyCode);
        console.log("App.js: Generated Python Code: ", newPyCode);
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
                        openSettings={() => setIsSettingsOpen(true)}
                    />
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
                    slotData={slotData}
                    updateMissionSteps={setStepCount}
                />
            )}
        </div>
    );
}

/**
 * Top-level App component with all providers
 */
function App() {
    return (
        <CustomizationProvider
            onStepCountChange={(newStepCount) => {
                console.log("App: onStepCountChange called with", newStepCount);
                // This is handled in AppContent
            }}
        >
            <BLEProvider>
                <KnobProvider>
                    <DndProvider backend={HTML5Backend}>
                        <AppWithCustomizationContext />
                    </DndProvider>
                </KnobProvider>
            </BLEProvider>
        </CustomizationProvider>
    );
}

export default App;
