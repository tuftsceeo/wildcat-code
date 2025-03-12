/**
 * @file CommandPanel.jsx
 * @description Primary interface for creating and configuring code actions,
 * providing action type selection and parameter configuration.
 * Updated to use the InstructionDescriptionPanel for multilingual support.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
    Check,
    RefreshCcwDot,
    Plus,
    Zap,
    Disc,
    Lightbulb,
    RotateCw,
    Volume,
    TimerReset,
    Clock9,
} from "lucide-react";

import styles from "../styles/FunctionDefault.module.css";
import { MotorDash } from "../dashboards/motor/components/MotorDash.jsx";
import { TimeDash } from "../dashboards/timer/components/TimeDash.jsx";
import { ButtonDash } from "../dashboards/button/components/ButtonDash.jsx";
import TypeSelector from "./TypeSelector";
import InstructionDescriptionPanel from "../instructions/components/InstructionDescriptionPanel";
import SubtypeSelector from "./SubtypeSelector";
import { useCustomization } from "../../../context/CustomizationContext";
import { speakWithRobotVoice } from "../../../common/utils/speechUtils";

// Define the control types and their configurations
const CONTROL_TYPES = {
    action: {
        motor: {
            name: "Motor Control",
            component: MotorDash,
            icon: <RotateCw size={32} />,
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
            icon: <Clock9 size={32} />,
        },
        button: {
            // Updated - Kept subtype name but changed display name
            name: "Button", // Changed from "Force Sensor" to "Button"
            component: ButtonDash,
            icon: <Disc size={32} />, // Using Disc icon for button
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
        console.log(`CommandPanel: Slot changed to ${currSlotNumber}`, {
            hasSlotData: !!slotData?.[currSlotNumber],
            slotData: JSON.stringify(slotData?.[currSlotNumber]),
        });

        const currentSlotData = slotData?.[currSlotNumber];
        if (currentSlotData && currentSlotData.type) {
            console.log(`CommandPanel: Loading slot ${currSlotNumber} data`, {
                type: currentSlotData.type,
                subtype: currentSlotData.subtype,
                config: JSON.stringify(currentSlotData.configuration),
            });

            setSelectedType(currentSlotData.type);
            setSelectedSubtype(currentSlotData.subtype);
            setDashboardConfig(currentSlotData.configuration);
            setLastSavedConfig(currentSlotData.configuration);

            // Set current instruction for description
            setCurrentInstruction(currentSlotData);
        } else {
            // Reset everything when there's no valid slot data
            console.log(
                `CommandPanel: No valid data for slot ${currSlotNumber}, resetting state`,
            );

            setSelectedType(null);
            setSelectedSubtype(null);
            setDashboardConfig(null);
            setLastSavedConfig(null);
            setCurrentInstruction(null);
        }
    }, [currSlotNumber, slotData]);

    // Auto-save when configuration changes
    useEffect(() => {
        console.log("CommandPanel: dashboardConfig effect triggered", {
            hasConfig: !!dashboardConfig,
            currentSlot: currSlotNumber,
        });

        if (!dashboardConfig) {
            console.log(
                "CommandPanel: No dashboard config, checking if we need to update",
            );

            // If we had a previous config but it was nullified, we should update the slot
            if (lastSavedConfig) {
                console.log(
                    "CommandPanel: Config was cleared, updating slot to null",
                );

                if (selectedType && selectedSubtype) {
                    // Create an instruction with null configuration
                    const instruction = {
                        type: selectedType,
                        subtype: selectedSubtype,
                        configuration: null,
                    };
                    onSlotUpdate(instruction);
                    setLastSavedConfig(null);
                    setCurrentInstruction(instruction);
                } else {
                    // If no type/subtype, clear the slot entirely
                    onSlotUpdate(null);
                    setLastSavedConfig(null);
                    setCurrentInstruction(null);
                }
            }
            return;
        }

        // Check if the configuration has actually changed
        if (
            JSON.stringify(dashboardConfig) !== JSON.stringify(lastSavedConfig)
        ) {
            console.log("CommandPanel: Configuration changed, auto-saving...", {
                from: JSON.stringify(lastSavedConfig),
                to: JSON.stringify(dashboardConfig),
            });

            if (selectedType && selectedSubtype) {
                // Create the instruction
                const instruction = {
                    type: selectedType,
                    subtype: selectedSubtype,
                    configuration: dashboardConfig,
                };

                // Update slot and set current instruction
                console.log(
                    "CommandPanel: Calling onSlotUpdate with instruction",
                    {
                        instruction: JSON.stringify(instruction),
                        slot: currSlotNumber,
                    },
                );

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
        currSlotNumber,
    ]);

    // Handle updates from the dashboard components
    const handleDashboardUpdate = useCallback(
        (config) => {
            console.log("CommandPanel: Dashboard update received", {
                config: JSON.stringify(config),
                previousConfig: JSON.stringify(dashboardConfig),
                selectedType,
                selectedSubtype,
            });

            setDashboardConfig(config);
        },
        [dashboardConfig, selectedType, selectedSubtype],
    );

    // Handle type selection
    const handleTypeSelect = (type) => {
        if (type !== selectedType) {
            console.log(
                `CommandPanel: Type changed from ${selectedType} to ${type}`,
            );

            setSelectedType(type);
            setSelectedSubtype(null);
            setDashboardConfig(null);
            setLastSavedConfig(null);
            setCurrentInstruction(null);
        }
    };

    // Handle subtype selection
    const handleSubtypeSelect = (subtype) => {
        console.log(
            `CommandPanel: Subtype changed from ${selectedSubtype} to ${subtype}`,
        );

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
                            currSlotNumber: currSlotNumber,
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
                                    color="var(--color-secondary-main)"
                                />
                            </div>
                        ) : (
                            <div className={styles.unsavedState}>
                                <Plus
                                    className={styles.plusIcon}
                                    size={24}
                                    color="var(--color-gray-subtle)"
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
