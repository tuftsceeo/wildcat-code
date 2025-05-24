/**
 * @file App.js
 * @description Main application component with support for reading level, step count, missions,
 * and new editing mode functionality. Updated to include editing mode state management
 * and feature flag for mission disable during development.
 * Updated for Option B: Stop step is real in slotData.
 * Enhanced with Edit button support in CommandPanel.
 * @author Jennifer Cross with support from Claude
 * @updated February 2025
 */

import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CommandPanel } from "./features/commandPanel/components/CommandPanel.jsx";
import { RunMenu } from "./features/runMenu/components/RunMenu.jsx";
import { BluetoothUI } from "./features/bluetooth/components/BluetoothUI.jsx";
import { KnobProvider } from "./context/KnobContext.js";
import {
    BLEProvider,
    useBLE,
} from "./features/bluetooth/context/BLEContext.js";
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

// Feature flag for temporarily disabling mission mode during editing mode development
export const ENABLE_MISSION_MODE = false;

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
    const { readingLevel, language, highContrast, customColors } =
        useCustomization();

    // Always call useMission hook (Rules of Hooks), but use feature flag to control behavior
    const missionContext = useMission();
    const { activeHint } = ENABLE_MISSION_MODE
        ? missionContext
        : { activeHint: null };

    // Apply reading level to body data attribute
    useEffect(() => {
        document.body.dataset.readingLevel = readingLevel;
        document.body.dataset.language = language;
    }, [readingLevel, language]);

    // Effect to handle high contrast mode and custom colors at app level
    useEffect(() => {
        // Handle high contrast mode
        if (highContrast) {
            document.body.classList.add("high-contrast");
        } else {
            document.body.classList.remove("high-contrast");
        }

        // Handle custom colors
        if (highContrast && Object.keys(customColors).length > 0) {
            // Create or update style element for custom colors
            let styleElement = document.getElementById("app-custom-theme-vars");
            if (!styleElement) {
                styleElement = document.createElement("style");
                styleElement.id = "app-custom-theme-vars";
                document.head.appendChild(styleElement);
            }

            // Generate CSS rules for all custom colors
            const cssRules = Object.entries(customColors)
                .map(([colorType, value]) => {
                    // Convert hex to RGB for rgba support
                    const r = parseInt(value.slice(1, 3), 16);
                    const g = parseInt(value.slice(3, 5), 16);
                    const b = parseInt(value.slice(5, 7), 16);

                    // Calculate relative luminance to determine contrast color
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    const contrastColor =
                        luminance > 0.5 ? "#1E1E1E" : "#FFFFFF";

                    let rules = `
                    :root {
                        --color-${colorType}-main: ${value};
                        --color-${colorType}-high: ${value};
                        --color-${colorType}-low: ${value};
                        --color-${colorType}-main-rgb: ${r}, ${g}, ${b};
                        --color-${colorType}-contrast: ${contrastColor};
                    }

                    body.high-contrast {
                        --color-${colorType}-main: ${value};
                        --color-${colorType}-high: ${value};
                        --color-${colorType}-low: ${value};
                        --color-${colorType}-contrast: ${contrastColor};
                    }
                `;

                    // Add component-specific variables based on color type
                    if (colorType === "primary") {
                        rules += `
                        body.high-contrast {
                            /* Default button states (outlined) */
                            --button-default-bg: transparent;
                            --button-default-border: ${value};
                            --button-default-text: ${value};
                            
                            /* Default contained button states */
                            --button-contained-default-bg: ${value};
                            --button-contained-default-border: ${value};
                            --button-contained-default-text: ${contrastColor};
                            
                            /* Default input states */
                            --input-default-border: ${value};
                            --input-focus-border: ${value};
                            
                            /* Default panel states */
                            --panel-border: ${value};
                            
                            /* Default focus states */
                            --focus-ring-color: ${value};
                            
                            /* Default motor states */
                            --color-motor-clockwise: ${value};
                            --color-timer-main: ${value};
                        }
                    `;
                    } else if (colorType === "secondary") {
                        rules += `
                        body.high-contrast {
                            /* Selected/Active button states (outlined) */
                            --button-selected-bg: transparent;
                            --button-selected-border: ${value};
                            --button-selected-text: ${value};
                            
                            /* Selected contained button states */
                            --button-contained-selected-bg: ${value};
                            --button-contained-selected-border: ${value};
                            --button-contained-selected-text: ${contrastColor};
                            
                            /* Active state variables */
                            --state-active-bg: ${value};
                            --state-active-border: ${value};
                            --state-active-text: ${contrastColor};
                            
                            /* Active panel states */
                            --panel-active-border: ${value};
                            
                            /* Active motor states */
                            --color-motor-countercw: ${value};
                            --color-sensor-main: ${value};
                        }
                    `;
                    } else if (colorType === "accent") {
                        rules += `
                        body.high-contrast {
                            /* Warning states */
                            --color-warning-main: ${value};
                            --color-warning-high: ${value};
                            --color-warning-low: ${value};
                            --color-warning-contrast: ${contrastColor};
                            
                            /* Info states */
                            --color-info-main: ${value};
                            --color-info-high: ${value};
                            --color-info-low: ${value};
                            --color-info-contrast: ${contrastColor};
                            
                            /* Success states */
                            --color-success-main: ${value};
                            --color-success-high: ${value};
                            --color-success-low: ${value};
                            --color-success-contrast: ${contrastColor};
                            
                            /* Error states */
                            --color-error-main: ${value};
                            --color-error-high: ${value};
                            --color-error-low: ${value};
                            --color-error-contrast: ${contrastColor};
                            
                            /* Important UI states */
                            --color-motor-stopped: ${value};
                            --state-important-bg: ${value};
                            --state-important-border: ${value};
                            --state-important-text: ${contrastColor};
                        }
                    `;
                    }

                    // Add disabled states with a fixed color (white with opacity)
                    if (colorType === "primary") {
                        rules += `
                        body.high-contrast {
                            /* Disabled states */
                            --button-disabled-bg: rgba(255, 255, 255, 0.3);
                            --button-disabled-border: rgba(255, 255, 255, 0.3);
                            --button-disabled-text: rgba(255, 255, 255, 0.5);
                            --button-contained-disabled-bg: rgba(255, 255, 255, 0.3);
                            --button-contained-disabled-border: rgba(255, 255, 255, 0.3);
                            --button-contained-disabled-text: rgba(255, 255, 255, 0.5);
                            --input-disabled-bg: rgba(255, 255, 255, 0.3);
                            --input-disabled-border: rgba(255, 255, 255, 0.3);
                            --input-disabled-text: rgba(255, 255, 255, 0.5);
                        }
                    `;
                    }

                    return rules;
                })
                .join("\n");

            styleElement.textContent = cssRules;
        } else {
            // Remove custom theme styles if high contrast is off or no custom colors
            const styleElement = document.getElementById(
                "app-custom-theme-vars",
            );
            if (styleElement) {
                styleElement.remove();
            }
        }

        // Cleanup function
        return () => {
            const styleElement = document.getElementById(
                "app-custom-theme-vars",
            );
            if (styleElement) {
                styleElement.remove();
            }
        };
    }, [highContrast, customColors]);

    return (
        <>
            <AppContent />
            {/* Add the HintSystem component to apply visual hints - only if missions enabled */}
            {ENABLE_MISSION_MODE && <HintSystem activeHint={activeHint} />}
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

    // Get BLE context for error detection
    const { portStates } = useBLE();

    const [pyCode, setPyCode] = useState("");
    const [canRun, setCanRun] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFirstLaunch, setIsFirstLaunch] = useState(false);

    // Editing Mode State Management
    // Always get mission context (Rules of Hooks), but use feature flag to control usage
    const missionContext = useMission();

    // Local state for non-mission mode
    const [localCurrSlotNumber, setLocalCurrSlotNumber] = useState(0);
    const [isEditingMode, setIsEditingMode] = useState(true); // Start in editing mode

    // Choose which slot state to use based on mission mode
    const currSlotNumber = ENABLE_MISSION_MODE
        ? missionContext.currSlotNumber
        : localCurrSlotNumber;
    const setCurrSlotNumber = ENABLE_MISSION_MODE
        ? missionContext.setCurrSlotNumber
        : setLocalCurrSlotNumber;

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

    // Initialize slot data with empty slots INCLUDING the stop step
    const [slotData, setSlotData] = useState(() => {
        const slots = [];
        // Create N-1 slots for configurable steps
        for (let i = 0; i < missionSteps - 1; i++) {
            slots.push(createEmptySlot());
        }
        // Add the stop step as the last element
        slots.push(createStopInstruction());
        return slots;
    });

    // Synchronize slotData with missionSteps changes
    useEffect(() => {
        console.log("App.js: Synchronizing slotData with missionSteps", {
            missionSteps,
            currentSlotDataLength: slotData.length,
            expectedLength: missionSteps,
        });

        if (slotData.length !== missionSteps) {
            const newSlotData = [];

            // Copy existing slots or create new ones (excluding the stop step for now)
            for (let i = 0; i < missionSteps - 1; i++) {
                if (slotData[i] && slotData[i].type !== "special") {
                    // Keep existing configurable slot data
                    newSlotData[i] = slotData[i];
                } else {
                    // Create new empty slot
                    newSlotData[i] = createEmptySlot();
                }
            }

            // Always add the stop step as the last element
            newSlotData[missionSteps - 1] = createStopInstruction();

            // STOP STEP PROTECTION: Handle current slot position
            // If current slot would be removed or is now pointing to the stop step inappropriately
            if (currSlotNumber >= missionSteps - 1) {
                // Move to the last configurable slot
                const lastConfigurableSlot = missionSteps - 2;
                if (lastConfigurableSlot >= 0) {
                    console.log(
                        `App.js: Moving currSlotNumber from ${currSlotNumber} to ${lastConfigurableSlot} (last configurable)`,
                    );
                    setCurrSlotNumber(lastConfigurableSlot);
                    // Exit editing mode since we're force-moving
                    setIsEditingMode(false);
                }
            }

            console.log("App.js: Updating slotData", {
                from: slotData.length,
                to: newSlotData.length,
                preservedStopStep: true,
            });

            setSlotData(newSlotData);
        }
    }, [missionSteps, currSlotNumber, setCurrSlotNumber, setIsEditingMode]); // Added dependencies

    // Log when missionSteps change for debugging
    useEffect(() => {
        console.log("App.js: missionSteps changed to", missionSteps);
    }, [missionSteps]);

    // Handle slot data updates from RunMenu
    useEffect(() => {
        const handleSlotDataUpdate = (event) => {
            const { slotData: newSlotData } = event.detail;
            setSlotData(newSlotData);
        };

        window.addEventListener("updateSlotData", handleSlotDataUpdate);
        return () => {
            window.removeEventListener("updateSlotData", handleSlotDataUpdate);
        };
    }, []);

    // Check if this is the first app launch
    useEffect(() => {
        // Check localStorage for a first launch flag
        const hasLaunched = localStorage.getItem("hasLaunched");
        if (!hasLaunched && ENABLE_MISSION_MODE) {
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

        // Enable run if AT LEAST ONE configurable slot has a complete configuration
        // (excluding special steps like stop)
        const hasAtLeastOneInstruction = slotData
            .filter((slot) => slot?.type !== "special") // Exclude special steps
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

    /**
     * Handle editing mode transitions
     * @param {number} slotIndex - Target slot index
     * @param {boolean} editingMode - Whether to enter editing mode
     */
    const handleEditingModeChange = (slotIndex, editingMode) => {
        console.log(
            `App.js: Changing to slot ${slotIndex}, editing mode: ${editingMode}`,
        );

        // Update slot if different
        if (slotIndex !== currSlotNumber) {
            setCurrSlotNumber(slotIndex);
        }

        // Update editing mode
        setIsEditingMode(editingMode);
    };

    /**
     * Check for disconnected motors in configurations
     * @param {Array} slots - Slot configurations to check
     * @returns {Array} Array of disconnected port objects
     */
    const checkDisconnectedMotors = (slots) => {
        const disconnectedPorts = [];
        slots.forEach((slot, index) => {
            if (slot?.type === "action" && slot?.subtype === "motor") {
                const configs = Array.isArray(slot.configuration)
                    ? slot.configuration
                    : [slot.configuration];

                configs.forEach((config) => {
                    if (config?.port && !portStates[config.port]) {
                        disconnectedPorts.push({
                            slot: index + 1,
                            port: config.port,
                        });
                    }
                });
            }
        });
        return disconnectedPorts;
    };

    /**
     * Handle step clicks from RunMenu
     * Implements the five-state logic for step button behavior
     * @param {number} stepIndex - Index of clicked step
     */
    const handleStepClick = (stepIndex) => {
        console.log(`App.js: Step ${stepIndex} clicked`);

        // Check if step is the stop step
        if (slotData[stepIndex]?.type === "special") {
            // Stop step: Enter viewing mode (non-editable)
            handleEditingModeChange(stepIndex, false);
            return;
        }

        // Check if step is configured
        const isStepConfigured = !!(
            slotData[stepIndex]?.type && slotData[stepIndex]?.subtype
        );

        if (isStepConfigured) {
            // Check if this configured step has errors/warnings
            const stepErrors = checkDisconnectedMotors([slotData[stepIndex]]);
            const hasErrors = stepErrors.length > 0;

            if (hasErrors) {
                // Step has errors: Go straight to editing mode to fix issues
                console.log(
                    `App.js: Step ${stepIndex} has errors, entering editing mode`,
                );
                handleEditingModeChange(stepIndex, true);
            } else {
                // Configured step without errors: Enter viewing mode
                handleEditingModeChange(stepIndex, false);
            }
        } else {
            // Empty step: Enter editing mode automatically
            handleEditingModeChange(stepIndex, true);
        }
    };

    /**
     * Handle entering editing mode from CommandPanel "Edit Step" button
     */
    const handleEnterEditingMode = () => {
        console.log(
            `App.js: Entering editing mode for current slot ${currSlotNumber}`,
        );
        setIsEditingMode(true);
    };

    /**
     * Handle saving and exiting editing mode from CommandPanel
     * @param {Object} slotConfig - Configuration to save
     * @param {boolean} shouldProgress - Whether to progress to next empty slot
     */
    const handleSaveAndExit = (slotConfig, shouldProgress = false) => {
        console.log(
            `App.js: Saving slot ${currSlotNumber}, progress: ${shouldProgress}`,
        );

        // Save the configuration
        if (slotConfig) {
            handleSlotUpdate(slotConfig);
        }

        if (shouldProgress) {
            // Calculate next slot based on current slot + 1
            const nextSlotIndex = currSlotNumber + 1;

            // Check if next slot exists and is not a special step (like stop)
            if (
                nextSlotIndex < slotData.length &&
                slotData[nextSlotIndex]?.type !== "special"
            ) {
                // Progress to next configurable slot in editing mode
                handleEditingModeChange(nextSlotIndex, true);
            } else {
                // No more configurable slots, exit editing mode
                setIsEditingMode(false);
                // TODO: Add celebration/completion logic here for UX
                console.log(
                    "App.js: Reached end of configurable slots - program complete!",
                );
            }
        } else {
            // Just exit editing mode, stay on current slot
            setIsEditingMode(false);
        }
    };

    // Generate Python code from slot configurations
    const generatePythonCode = (slots) => {
        let code = [];

        // Process all slots, skipping special ones like stop
        slots.forEach((slot, index) => {
            // Skip special steps (like stop)
            if (slot?.type === "special") return;

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
                    isEditingMode={isEditingMode}
                    onStepClick={handleStepClick}
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
                    isEditingMode={isEditingMode}
                    onEnterEditingMode={handleEnterEditingMode}
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
                    isEditingMode={isEditingMode}
                    onSaveAndExit={handleSaveAndExit}
                    onEnterEditingMode={handleEnterEditingMode}
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

            {/* First launch mission selector - only if missions enabled */}
            {isFirstLaunch && ENABLE_MISSION_MODE && (
                <MissionSelector
                    isOpen={true}
                    onClose={handleCloseFirstLaunch}
                    initialSetup={true}
                />
            )}

            {/* Mission overlay component - only if missions enabled */}
            {ENABLE_MISSION_MODE && <MissionOverlay />}
        </div>
    );
}

export default App;
