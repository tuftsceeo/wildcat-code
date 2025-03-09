/**
 * @file App.js
 * @description Main application component with support for reading level and step count.
 * Fixed to properly propagate step count changes to child components.
 */

import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CommandPanel } from "./features/commandPanel/components/CommandPanel.jsx";
import { RunMenu } from "./features/runMenu/components/RunMenu.jsx";
import { BluetoothUI } from "./features/bluetooth/components/BluetoothUI.jsx";
import { KnobProvider } from "./context/KnobContext.js";
import { BLEProvider } from "./features/bluetooth/context/BLEContext.js";
import "./common/styles/App.css";
import CodeTrack from "./features/codeTrack/components/CodeTrack.jsx";
import CustomizationPage from "./features/settings/components/CustomizationPage.jsx";

import {
    CustomizationProvider,
    useCustomization,
} from "./context/CustomizationContext";
import { preloadVoices } from "./common/utils/speechUtils";
import logo from "./assets/images/logo.svg";
import "./common/styles/App.css";
import reportWebVitals from "./common/utils/reportWebVitals";
/**
 * The top-level App component with all providers
 * Manages the missionSteps state and handles changes from CustomizationContext
 *
 * @returns {JSX.Element} Main application component
 */
function App() {
    // Move missionSteps state to the top level component
    const [missionSteps, setMissionSteps] = useState(2);

    return (
        <CustomizationProvider
            onStepCountChange={(newStepCount) => {
                console.log("App: onStepCountChange called with", newStepCount);
                // Directly update missionSteps state here so it propagates to all components
                setMissionSteps(newStepCount);
            }}
        >
            <BLEProvider>
                <KnobProvider>
                    <DndProvider backend={HTML5Backend}>
                        {/* Pass missionSteps as a prop to the AppWithCustomizationContext */}
                        <AppWithCustomizationContext
                            missionSteps={missionSteps}
                        />
                    </DndProvider>
                </KnobProvider>
            </BLEProvider>
        </CustomizationProvider>
    );
}

/**
 * Main application wrapper that provides context providers and applies settings
 *
 * @param {Object} props - Component props
 * @param {number} props.missionSteps - Number of mission steps passed from parent
 * @returns {JSX.Element} Main application content component
 */
function AppWithCustomizationContext({ missionSteps }) {
    // Get customization settings
    const { readingLevel, language } = useCustomization();

    // Apply reading level to body data attribute
    useEffect(() => {
        document.body.dataset.readingLevel = readingLevel;
        document.body.dataset.language = language;
    }, [readingLevel, language]);

    return <AppContent missionSteps={missionSteps} />;
}

/**
 * Main application content
 *
 * @param {Object} props - Component props
 * @param {number} props.missionSteps - Number of mission steps passed from parent
 * @returns {JSX.Element} Application UI components
 */
function AppContent({ missionSteps }) {
    const [pyCode, setPyCode] = useState("");
    const [canRun, setCanRun] = useState(false);
    const [currSlotNumber, setCurrSlotNumber] = useState(0);
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
            <div className="code-column">
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
                    updateMissionSteps={(newStepCount) => {
                        console.log(
                            "CustomizationPage requested update to",
                            newStepCount,
                        );
                        // This is redundant now as the actual update happens via context
                    }}
                />
            )}
        </div>
    );
}

export default App;
