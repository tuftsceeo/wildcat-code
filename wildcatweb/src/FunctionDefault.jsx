import React, { useState, useEffect, useCallback } from "react";
import styles from "./FunctionDefault.module.css";
import { MotorDash } from "./MotorDash.jsx";
import { TimeDash } from "./TimeDash.jsx";
// Using available icons from lucide-react
import { Check, Plus, Volume2, Zap, Lightbulb, Volume } from "lucide-react";

// Icons for action buttons (using correct icons from lucide-react)
const ActionIcons = {
    speed: <Zap size={20} />,
    hub: <Lightbulb size={20} />,
    sound: <Volume size={20} />,
};

const CONTROL_TYPES = {
    action: {
        motor: {
            name: "Motor Control",
            component: MotorDash,
            icon: ActionIcons.speed,
        },
        hub: {
            name: "Hub",
            component: null, // Will be implemented later
            icon: ActionIcons.hub,
        },
        sound: {
            name: "Sound",
            component: null, // Will be implemented later
            icon: ActionIcons.sound,
        },
    },
    input: {
        time: {
            name: "Wait Time",
            component: TimeDash,
        },
    },
};

export const FunctionDefault = ({ currSlotNumber, onSlotUpdate, slotData }) => {
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

    const handleDashboardUpdate = useCallback((config) => {
        setDashboardConfig(config);
    }, []);

    const handleTypeSelect = (type) => {
        if (type !== selectedType) {
            setSelectedType(type);
            setSelectedSubtype(null);
            setDashboardConfig(null);
            setLastSavedConfig(null);
        }
    };

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

    // Render speed bar visualization when a motor is configured
    const renderMotorVisualization = () => {
        // Only show for motor actions
        if (
            !(
                selectedType === "action" &&
                selectedSubtype === "motor" &&
                dashboardConfig
            )
        ) {
            return null;
        }

        // Create array of bar heights for visualization
        const bars = [70, 85, 60, 40, 20, 35, 50, 75, 90];
        const currentSpeed = dashboardConfig.speed || 5000;
        const speedPercentage = Math.min(currentSpeed / 10000, 1);
        const highlightIndex = Math.floor(speedPercentage * (bars.length - 1));

        return (
            <div className={styles.motorVisualization}>
                <div className={styles.visualizationTitle}>MOTOR A</div>
                <div className={styles.barGraph}>
                    {bars.map((height, index) => (
                        <div
                            key={index}
                            className={`${styles.bar} ${
                                index > 5 ? styles.green : ""
                            } ${
                                index === highlightIndex ? styles.highlight : ""
                            }`}
                            style={{ height: `${height}%` }}
                        ></div>
                    ))}
                </div>
                <div className={styles.speedIcons}>
                    <span className={styles.speedIcon}>🐢</span>
                    <span className={styles.speedIcon}>🐇</span>
                </div>
            </div>
        );
    };

    // Render the subtype selection buttons
    const renderSubtypeSelection = () => {
        return (
            <div className={styles.subtypeSelection}>
                {Object.entries(CONTROL_TYPES[selectedType]).map(
                    ([key, value]) => (
                        <button
                            key={key}
                            onClick={() => handleSubtypeSelect(key)}
                            className={`${styles.subtypeButton} ${
                                selectedSubtype === key ? styles.active : ""
                            }`}
                        >
                            {/* Show icon for action buttons like in FIGMA */}
                            {value.icon && (
                                <span className={styles.icon}>
                                    {value.icon}
                                </span>
                            )}
                            {value.name}
                        </button>
                    ),
                )}
            </div>
        );
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

                {/* Motor visualization bars like in FIGMA */}
                {renderMotorVisualization()}
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

            {/* ACTION/SENSE buttons - selected one shows green, not selected shows blue */}
            <div className={styles.actionSenseButtonGroup}>
                <div className={styles.actionButton}>
                    <button
                        className={`${styles.actionButtonChild} ${
                            selectedType === "action" ? styles.active : ""
                        }`}
                        onClick={() => handleTypeSelect("action")}
                    >
                        ACTION
                    </button>
                </div>
                <div className={styles.senseButton}>
                    <button
                        className={`${styles.actionButtonChild} ${
                            selectedType === "input" ? styles.active : ""
                        }`}
                        onClick={() => handleTypeSelect("input")}
                    >
                        SENSE
                    </button>
                </div>
            </div>

            {/* Content area with two-column layout */}
            {selectedType && (
                <div className={styles.contentContainer}>
                    {/* Left column - ACTION subtype or SENSE dashboard */}
                    <div className={styles.leftColumn}>
                        {selectedType === "action"
                            ? renderSubtypeSelection()
                            : renderDashboard()}
                    </div>

                    {/* Right column - ACTION dashboard or SENSE subtype */}
                    <div className={styles.rightColumn}>
                        {selectedType === "action"
                            ? renderDashboard()
                            : renderSubtypeSelection()}
                    </div>
                </div>
            )}

            {/* Status panel at bottom - white with black text and audio icon */}
            <div className={styles.statusPanel}>
                <div className={styles.statusText}>{statusText}</div>
                <Volume2
                    className={styles.audioIcon}
                    size={20}
                    onClick={handlePlayAudio}
                    role="button"
                    aria-label="Play audio description"
                />
            </div>
        </div>
    );
};
