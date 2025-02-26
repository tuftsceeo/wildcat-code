/**
 * @file CommandPanel.jsx
 * @description Primary interface for creating and configuring code actions, 
 * providing action type selection and parameter configuration.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

// CommandPanel.jsx
import React, { useState, useEffect, useCallback } from "react";
import styles from "./FunctionDefault.module.css"; // Reusing the CSS initially
import { MotorDash } from "./MotorDash.jsx";
import { TimeDash } from "./TimeDash.jsx";
import { Check, Plus, Zap, Lightbulb, Volume } from "lucide-react";

// Import our new components
import TypeSelector from "./TypeSelector";
import StatusPanel from "./StatusPanel";
import MotorVisualization from "./MotorVisualization";
import SubtypeSelector from "./SubtypeSelector";

// Define the control types and their configurations (moved from FunctionDefault)
const CONTROL_TYPES = {
    action: {
        motor: {
            name: "Motor Control",
            component: MotorDash,
            icon: <Zap size={20} />,
        },
        hub: {
            name: "Hub",
            component: null, // Will be implemented later
            icon: <Lightbulb size={20} />,
        },
        sound: {
            name: "Sound",
            component: null, // Will be implemented later
            icon: <Volume size={20} />,
        },
    },
    input: {
        time: {
            name: "Wait Time",
            component: TimeDash,
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
    const [statusText, setStatusText] = useState(
        "Select an action or sensor...",
    );

    // Reset state when slot number changes
    useEffect(() => {
        const currentSlotData = slotData?.[currSlotNumber];
        if (currentSlotData && currentSlotData.type) {
            setSelectedType(currentSlotData.type);
            setSelectedSubtype(currentSlotData.subtype);
            setDashboardConfig(currentSlotData.configuration);
            setLastSavedConfig(currentSlotData.configuration);

            // Update status text based on configuration
            updateStatusText(currentSlotData);
        } else {
            // Reset everything when there's no valid slot data
            setSelectedType(null);
            setSelectedSubtype(null);
            setDashboardConfig(null);
            setLastSavedConfig(null);
            setStatusText("Select an action or sensor...");
        }
    }, [currSlotNumber, slotData]);

    // Update status text based on configuration
    const updateStatusText = (slotData) => {
        if (!slotData || !slotData.type) {
            setStatusText("Select an action or sensor...");
            return;
        }

        if (slotData.type === "action" && slotData.subtype === "motor") {
            const config = slotData.configuration;
            if (!config) {
                setStatusText("Configure motor action...");
                return;
            }

            if (Array.isArray(config) && config.length > 0) {
                const motorConfig = config[0];
                const port = motorConfig.port || "A";
                const direction =
                    motorConfig.direction === "backward"
                        ? "backward"
                        : "forward";
                const speed = getSpeedText(motorConfig.speed);

                setStatusText(`Motor ${port} spins ${direction} ${speed}.`);
            } else if (config.port) {
                const port = config.port;
                const direction =
                    config.direction === "backward" ? "backward" : "forward";
                const speed = getSpeedText(config.speed);

                setStatusText(`Motor ${port} spins ${direction} ${speed}.`);
            }
        } else if (slotData.type === "input" && slotData.subtype === "time") {
            const seconds = slotData.configuration?.seconds || 0;
            setStatusText(`Wait ${seconds} seconds.`);
        }
    };

    // Helper to convert speed value to text
    const getSpeedText = (speed) => {
        if (!speed) return "medium";
        if (speed < 3000) return "slow";
        if (speed > 7000) return "fast";
        return "medium";
    };

    // Auto-save when configuration changes
    useEffect(() => {
        if (!dashboardConfig) return;

        // Check if the configuration has actually changed
        if (
            JSON.stringify(dashboardConfig) !== JSON.stringify(lastSavedConfig)
        ) {
            console.log("Configuration changed, auto-saving...");

            if (selectedType && selectedSubtype) {
                onSlotUpdate({
                    type: selectedType,
                    subtype: selectedSubtype,
                    configuration: dashboardConfig,
                });
                setLastSavedConfig(dashboardConfig);

                // Update status text
                updateStatusText({
                    type: selectedType,
                    subtype: selectedSubtype,
                    configuration: dashboardConfig,
                });
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
        }
    };

    // Handle subtype selection
    const handleSubtypeSelect = (subtype) => {
        setSelectedSubtype(subtype);
        setDashboardConfig(null);
        setLastSavedConfig(null);
    };

    // Play the audio description
    const handlePlayAudio = () => {
        // Use browser's speech synthesis
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(statusText);
            utterance.rate = 0.9; // Slightly slower for clarity
            window.speechSynthesis.speak(utterance);
        }
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
            <img
                className={styles.outline}
                src={require("./assets/outline-function-hub.png")}
                alt="Function Hub outline"
            />

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

            {/* Motor visualization when appropriate */}
            {selectedType === "action" &&
                selectedSubtype === "motor" &&
                dashboardConfig && (
                    <MotorVisualization configuration={dashboardConfig} />
                )}

            {/* Status panel at bottom */}
            <StatusPanel
                statusText={statusText}
                onPlayAudio={handlePlayAudio}
            />
        </div>
    );
};
