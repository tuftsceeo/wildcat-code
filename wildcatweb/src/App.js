/**
 * @file App.js
 * @description Main application component with support for reading level, step count, and missions.
 * Updated to include MissionProvider and handle first-time setup.
 */

import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CommandPanel } from "./features/commandPanel/components/CommandPanel.jsx";
import { RunMenu } from "./features/runMenu/components/RunMenu.jsx";
import { BluetoothUI } from "./features/bluetooth/components/BluetoothUI.jsx";
import { KnobProvider } from "./context/KnobContext.js";
import { BLEProvider } from "./features/bluetooth/context/BLEContext.js";
import { MissionProvider, useMission } from "./context/MissionContext.js";
import HintSystem from "./features/missions/components/HintSystem";
import "./common/styles/App.css";
import CodeTrack from "./features/codeTrack/components/CodeTrack.jsx";
import CustomizationPage from "./features/settings/components/CustomizationPage.jsx";
import MissionSelector from "./features/missions/components/MissionSelector.jsx";
import MissionOverlay from "./features/missions/components/MissionOverlay.jsx";

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
 *
 * @returns {JSX.Element} Main application component
 */
function App() {
    return (
        <CustomizationProvider>
            <BLEProvider>
                <KnobProvider>
                    <MissionProvider>
                        <DndProvider backend={HTML5Backend}>
                            <AppWithCustomizationContext />
                        </DndProvider>
                    </MissionProvider>
                </KnobProvider>
            </BLEProvider>
        </CustomizationProvider>
    );
}

/**
 * Main application wrapper that provides context providers and applies settings
 *
 * @returns {JSX.Element} Main application content component
 */
function AppWithCustomizationContext() {
    // Get customization settings
    const { readingLevel, language } = useCustomization();
    const { activeHint } = useMission();
  
    // Apply reading level to body data attribute
    useEffect(() => {
        document.body.dataset.readingLevel = readingLevel;
        document.body.dataset.language = language;
    }, [readingLevel, language]);
  
    return (
        <>
            <AppContent />
            {/* Add the HintSystem component to apply visual hints */}
            <HintSystem activeHint={activeHint} />
        </>
    );
}

/**
 * Main application content
 *
 * @returns {JSX.Element} Application UI components
 */
function AppContent() {
    // Get step count directly from CustomizationContext
    const { stepCount: missionSteps } = useCustomization();
    
    const [pyCode, setPyCode] = useState("");
    const [canRun, setCanRun] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFirstLaunch, setIsFirstLaunch] = useState(false);

    // Get currSlotNumber from MissionContext
    const { currSlotNumber, setCurrSlotNumber } = useMission();

    // Define interface for slot data
    const createEmptySlot = () => ({
        type: null, // 'action' or 'input'
        subtype: null, // 'motor', 'time', etc.
        configuration: [], // Array of configurations for this slot
    });

    /**
     * Creates a special stop instruction for the end slot
     * @returns {Object} Stop instruction data
     */
    const createStopInstruction = () => ({
        type: "special",
        subtype: "stop",
        configuration: { isEnd: true },
        isStopInstruction: true, // Flag to identify this as a stop instruction
    });

    // Initialize slot data with empty slots
    const [slotData, setSlotData] = useState(() => {
        const slots = [];
        for (let i = 0; i < missionSteps; i++) {
            slots.push(createEmptySlot());
        }
        slots.push(createStopInstruction());
        return slots;
    });

    // Log when missionSteps change for debugging
    useEffect(() => {
        console.log("App.js: missionSteps changed to", missionSteps);
    }, [missionSteps]);

    // Listen for slot data updates from mission context
    useEffect(() => {
        const handleSlotDataUpdate = (event) => {
            const { slotData: newSlotData } = event.detail;
            console.log("App.js: Received slot data update:", newSlotData);
            setSlotData(newSlotData);
        };

        window.addEventListener('updateSlotData', handleSlotDataUpdate);
        return () => {
            window.removeEventListener('updateSlotData', handleSlotDataUpdate);
        };
    }, []);

    // Check if this is the first app launch
    useEffect(() => {
        // Check localStorage for a first launch flag
        const hasLaunched = localStorage.getItem("hasLaunched");
        if (!hasLaunched) {
            setIsFirstLaunch(true);
            // Set the flag for future launches
            localStorage.setItem("hasLaunched", "true");
        }
    }, []);

    // Update Python code whenever slot data changes
    useEffect(() => {
        const newPyCode = generatePythonCode(slotData);
        setPyCode(newPyCode);
        console.log("App.js: Generated Python Code: ", newPyCode);

        // Enable run if AT LEAST ONE regular slot has a complete configuration
        // (excluding the stop step which is always at the end)
        const hasAtLeastOneInstruction = slotData
            .slice(0, -1) // Exclude the stop step
            .some((slot) => slot?.type && slot?.subtype && slot?.configuration);
        
        setCanRun(hasAtLeastOneInstruction);
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

        // Process all slots except the stop instruction
        slots.forEach((slot, index) => {
            // Skip the stop step which would be at the end
            if (slot?.isStopInstruction) return;

            if (slot?.type === "action" && slot?.subtype === "motor") {
                const { buttonType, knobAngle, port } =
                    slot.configuration || {};
                if (buttonType === "GO") {
                    code.push(`motor.run(port.${port}, ${knobAngle})`);
                } else if (buttonType === "STOP") {
                    code.push(`motor.stop(port.${port})`);
                }
            } else if (slot?.type === "input" && slot?.subtype === "time") {
                const { seconds } = slot.configuration || {};
                if (seconds) {
                    code.push(`time.sleep(${seconds})`);
                }
            }
        });

        // Add explicit stop commands at the end
        code.push("# Stop all motors");
        code.push("for p in [port.A, port.B, port.C, port.D, port.E, port.F]:");
        code.push("    try:");
        code.push("        motor.stop(p)");
        code.push("    except:");
        code.push("        pass");

        return code.join("\n");
    };

    /**
     * Handler for closing the first launch mission selector
     */
    const handleCloseFirstLaunch = () => {
        setIsFirstLaunch(false);
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
                    missionSteps={missionSteps}
                />
            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <CustomizationPage
                    close={() => setIsSettingsOpen(false)}
                    slotData={slotData}
                    onUpdateMissionSteps={(newStepCount) => {
                        console.log(
                            "CustomizationPage requested update to",
                            newStepCount,
                        );
                    }}
                />
            )}

            {/* First launch mission selector */}
            {isFirstLaunch && (
                <MissionSelector 
                    isOpen={true} 
                    onClose={handleCloseFirstLaunch} 
                    initialSetup={true}
                />
            )}

            {/* Mission overlay component for instructions, success messages, etc. */}
            <MissionOverlay />
        </div>
    );
}

export default App;