/**
 * @file CommandPanel.jsx
 * @description Primary interface for creating and configuring code actions,
 * providing action type selection and parameter configuration.
 * Updated to use the InstructionDescriptionPanel for multilingual support.
 */

import React, { useState, useEffect, useCallback } from "react";
import styles from "./FunctionDefault.module.css"; // Reusing the CSS initially
import { MotorDash } from "./MotorDash.jsx";
import { TimeDash } from "./TimeDash.jsx";
import { Check, Plus, Zap, Lightbulb, Volume } from "lucide-react";
import { Disc } from "lucide-react"; // Import an appropriate icon
import ButtonDash from "./ButtonDash.jsx"; // Import the button component
import { speakWithRobotVoice } from "./utils/speechUtils";


// Import our components
import TypeSelector from "./TypeSelector";
import InstructionDescriptionPanel from "./InstructionDescriptionPanel"; // New component
import SubtypeSelector from "./SubtypeSelector";
import { useCustomization } from "./CustomizationContext"; // Get language and complexity

// Define the control types and their configurations
const CONTROL_TYPES = {
    action: {
        motor: {
            name: "Motor Control",
            component: MotorDash,
            icon: <Zap size={20} />,
        },
        // hub: {
        //     name: "Hub",
        //     component: null, // Will be implemented later
        //     icon: <Lightbulb size={20} />,
        // },
        // sound: {
        //     name: "Sound",
        //     component: null, // Will be implemented later
        //     icon: <Volume size={20} />,
        // },
    },
    input: {
        time: {
            name: "Wait Time",
            component: TimeDash,
        },
        button: {  // Updated - Kept subtype name but changed display name
            name: "Button",  // Changed from "Force Sensor" to "Button"
            component: ButtonDash,
            icon: <Disc size={20} />, // Using Disc icon for button
        },
    },
};

/**
 * CommandPanel provides the interface for creating code actions
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.currSlotNumber - Current active slot number
 * @param {Function} props.onSlotUpdate - Callback function when slot configuration changes
 * @param {Array} props.slotData - Array of slot configurations
 * @returns {JSX.Element} Complete command panel interface
 */
export const CommandPanel = ({ currSlotNumber, onSlotUpdate, slotData }) => {
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSubtype, setSelectedSubtype] = useState(null);
    const [dashboardConfig, setDashboardConfig] = useState(null);
    const [lastSavedConfig, setLastSavedConfig] = useState(null);

    // Current instruction for the description panel
    const [currentInstruction, setCurrentInstruction] = useState(null);

    // Reset state when slot number changes
    useEffect(() => {
        const currentSlotData = slotData?.[currSlotNumber];
        if (currentSlotData && currentSlotData.type) {
            setSelectedType(currentSlotData.type);
            setSelectedSubtype(currentSlotData.subtype);
            setDashboardConfig(currentSlotData.configuration);
            setLastSavedConfig(currentSlotData.configuration);

            // Set current instruction for description
            setCurrentInstruction(currentSlotData);
        } else {
            // Reset everything when there's no valid slot data
            setSelectedType(null);
            setSelectedSubtype(null);
            setDashboardConfig(null);
            setLastSavedConfig(null);
            setCurrentInstruction(null);
        }
    }, [currSlotNumber, slotData]);

    // Auto-save when configuration changes
    useEffect(() => {
        if (!dashboardConfig) return;

        // Check if the configuration has actually changed
        if (
            JSON.stringify(dashboardConfig) !== JSON.stringify(lastSavedConfig)
        ) {
            console.log("Configuration changed, auto-saving...");

            if (selectedType && selectedSubtype) {
                // Create the instruction
                const instruction = {
                    type: selectedType,
                    subtype: selectedSubtype,
                    configuration: dashboardConfig,
                };

                // Update slot and set current instruction
                onSlotUpdate(instruction);
                setLastSavedConfig(dashboardConfig);
                setCurrentInstruction(instruction);
            }
        }
    }, [
        dashboardConfig,
        lastSavedConfig,
        selectedType,
        selectedSubtype,
        onSlotUpdate,
    ]);

    // Handle updates from the dashboard components
    const handleDashboardUpdate = useCallback((config) => {
        setDashboardConfig(config);
    }, []);

    // Handle type selection
    const handleTypeSelect = (type) => {
        if (type !== selectedType) {
            setSelectedType(type);
            setSelectedSubtype(null);
            setDashboardConfig(null);
            setLastSavedConfig(null);
            setCurrentInstruction(null);
        }
    };

    // Handle subtype selection
    const handleSubtypeSelect = (subtype) => {
        setSelectedSubtype(subtype);
        setDashboardConfig(null);
        setLastSavedConfig(null);
        setCurrentInstruction(null);
    };

    // Get voice settings from context
    const { language, voice, volume } = useCustomization();
    
    // Play the audio description with the selected robot voice
    const handlePlayAudio = (text) => {
        const languageCode = language === "es" ? "es-ES" : "en-US";
        speakWithRobotVoice(text, voice, volume, languageCode);
    };

    // Render the dashboard based on selected subtype
    const renderDashboard = () => {
        if (!selectedSubtype) {
            return <div className={styles.dashboardPlaceholder}></div>;
        }

        return (
            <div
                className={styles.dashboardContainer}
                data-control-type={selectedSubtype || "default"}
            >
                {CONTROL_TYPES[selectedType][selectedSubtype].component &&
                    React.createElement(
                        CONTROL_TYPES[selectedType][selectedSubtype].component,
                        {
                            onUpdate: handleDashboardUpdate,
                            configuration: dashboardConfig,
                            slotData: slotData,
                        },
                    )}
                <div className={styles.saveIndicator}>
                    {dashboardConfig &&
                        (JSON.stringify(dashboardConfig) ===
                        JSON.stringify(lastSavedConfig) ? (
                            <div className={styles.savedState}>
                                <Check
                                    className={styles.checkIcon}
                                    size={24}
                                    color="var(--color-neon-green)"
                                />
                            </div>
                        ) : (
                            <div className={styles.unsavedState}>
                                <Plus
                                    className={styles.plusIcon}
                                    size={24}
                                    color="var(--color-gray-400)"
                                />
                            </div>
                        ))}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.hubTopBackground}>
            {/* Type Selector (ACTION/SENSE) */}
            <TypeSelector
                selectedType={selectedType}
                onTypeChange={handleTypeSelect}
            />

            {/* Content area with two-column layout */}
            {selectedType && (
                <div className={styles.contentContainer}>
                    {/* Left column - ACTION subtype or SENSE dashboard */}
                    <div className={styles.leftColumn}>
                        {selectedType === "action" ? (
                            <SubtypeSelector
                                controlTypes={CONTROL_TYPES}
                                selectedType={selectedType}
                                selectedSubtype={selectedSubtype}
                                onSubtypeSelect={handleSubtypeSelect}
                            />
                        ) : (
                            renderDashboard()
                        )}
                    </div>

                    {/* Right column - ACTION dashboard or SENSE subtype */}
                    <div className={styles.rightColumn}>
                        {selectedType === "action" ? (
                            renderDashboard()
                        ) : (
                            <SubtypeSelector
                                controlTypes={CONTROL_TYPES}
                                selectedType={selectedType}
                                selectedSubtype={selectedSubtype}
                                onSubtypeSelect={handleSubtypeSelect}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Instruction Description Panel at bottom - Now passing the currSlotNumber */}
            <InstructionDescriptionPanel
                instruction={currentInstruction}
                onPlayAudio={handlePlayAudio}
                slotNumber={currSlotNumber}
            />
        </div>
    );
};

export default CommandPanel;