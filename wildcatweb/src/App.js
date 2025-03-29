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
    const [currSlotNumber, setCurrSlotNumber] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFirstLaunch, setIsFirstLaunch] = useState(false);

    // Log when missionSteps change for debugging
    useEffect(() => {
        console.log("App.js: missionSteps changed to", missionSteps);
    }, [missionSteps]);

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

    // Initialize slot data array with empty slots
    // Use a default of 3 if missionSteps is undefined
    const [slotData, setSlotData] = useState(
        Array(missionSteps || 3)
            .fill(null)
            .map((_, index) => {
                // Make the last slot a stop instruction
                if (index === (missionSteps || 3) - 1) {
                    return createStopInstruction();
                }
                return createEmptySlot();
            }),
    );

    // Update slotData when missionSteps changes
    useEffect(() => {
        // Guard against undefined missionSteps
        if (!missionSteps) {
            console.warn("App.js: missionSteps is undefined, using default value");
            return;
        }

        console.log(
            "App.js: Updating slotData based on missionSteps",
            missionSteps
        );
        
        setSlotData((prev) => {
            // Only update if the length needs to change
            if (prev.length !== missionSteps) {
                console.log(
                    "App.js: Adjusting slotData length from",
                    prev.length,
                    "to",
                    missionSteps
                );

                // If expanding, add new empty slots
                if (prev.length < missionSteps) {
                    // Keep all existing slots except the last one (which may be the stop instruction)
                    const regularSlots = prev.slice(0, prev.length - 1);

                    // Calculate how many new empty slots to add
                    const additionalSlotsCount = missionSteps - prev.length;

                    // Create new empty slots
                    const additionalSlots = Array(additionalSlotsCount)
                        .fill(null)
                        .map(() => createEmptySlot());

                    // Add a stop instruction at the end
                    return [
                        ...regularSlots,
                        ...additionalSlots,
                        createStopInstruction(),
                    ];
                }

                // If contracting, trim the array but preserve the stop instruction
                // Get all slots up to the new length minus 1 (to leave room for stop)
                const trimmedSlots = prev.slice(0, missionSteps - 1);

                // Add the stop instruction at the end
                return [...trimmedSlots, createStopInstruction()];
            }

            // Ensure the last slot is always the stop instruction
            const result = [...prev];
            if (!result[result.length - 1]?.isStopInstruction) {
                result[result.length - 1] = createStopInstruction();
            }

            // Length is already correct
            return result;
        });
    }, [missionSteps]);

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