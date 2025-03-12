/**
 * @file MotorDash.jsx
 * @description Dashboard interface for configuring motor actions with a vertical bar visualization
 * and slider control for speed and direction, designed for students with autism.
 */

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { useBLE } from "../../../../bluetooth/context/BLEContext";
import styles from "../styles/MotorDash.module.css";
import {
    validateSpeed,
    sliderPositionToSpeed,
    speedToSliderPosition,
} from "../utils/motorSpeedUtils";
import {
    BluetoothSearching,
    RefreshCwOff,
    Rabbit,
    Turtle,
    Octagon,
    MoveLeft,
    MoveRight,
} from "lucide-react";

/**
 * Component for a single motor control dashboard
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.port - Motor port (A-F)
 * @param {Function} props.onUpdate - Callback when motor configuration changes
 * @param {Object} props.configuration - Current motor configuration
 * @param {boolean} props.isDisconnected - Whether the motor is disconnected
 * @param {Function} props.onDismiss - Callback to dismiss a disconnected motor
 * @param {boolean} props.showLabels - Whether to show text labels (for accessibility)
 * @returns {JSX.Element} Single motor control dashboard
 */
const SingleMotorDash = memo(
    ({
        port,
        onUpdate,
        configuration,
        isDisconnected,
        onDismiss,
        showLabels = true,
    }) => {
        // Use speed as the main state (includes direction via sign)
        // Extract speed from configuration or use 0 as default
        const [speed, setSpeed] = useState(
            validateSpeed(configuration?.speed) || 0,
        );
        // Track position (0-6) for the UI
        const [sliderPosition, setSliderPosition] = useState(
            speedToSliderPosition(speed),
        );

        // Refs for DOM elements
        const sliderTrackRef = useRef(null);
        const thumbRef = useRef(null);
        const isDragging = useRef(false);

        // Update local state when configuration changes externally
        useEffect(() => {
            if (configuration?.speed !== undefined) {
                const validatedSpeed = validateSpeed(configuration.speed);
                setSpeed(validatedSpeed);
                setSliderPosition(speedToSliderPosition(validatedSpeed));
            }
        }, [configuration]);

        // Define bar properties
        const getBars = () => {
            // Create the 7 bars with their relative heights (3-2-1-0-1-2-3)
            const barHeights = [3, 2, 1, 1.5, 1, 2, 3];

            return barHeights.map((height, index) => {
                // The fourth bar (index 3) should have zero height (invisible)
                const actualHeight = height * 20; // Scale heights

                // Determine if the bar should be highlighted based on slider position
                let isActive = false;

                if (sliderPosition === 0) {
                    // backward-fast
                    isActive = index === 0 || index === 1 || index === 2;
                } else if (sliderPosition === 1) {
                    // backward-medium
                    isActive = index === 1 || index === 2;
                } else if (sliderPosition === 2) {
                    // backward-slow

                    isActive = index === 2;
                } else if (sliderPosition === 3) {
                    // stop

                    isActive =
                        index === 3 && configuration?.speed !== undefined; // No bars highlighted
                } else if (sliderPosition === 4) {
                    // forward-slow
                    isActive = index === 4;
                } else if (sliderPosition === 5) {
                    // forward-medium
                    isActive = index === 4 || index === 5;
                } else if (sliderPosition === 6) {
                    // forward-fast
                    isActive = index === 4 || index === 5 || index === 6;
                }

                // Determine if bar is in backward or forward section
                const isForward = index > 3;
                const isVisible = index !== 3;

                return {
                    index,
                    height: actualHeight,
                    isActive,
                    isForward,
                    isVisible, // Bar 4 isn't visible
                };
            });
        };

        // Handle slider position changes
        const handleSliderChange = useCallback(
            (newPosition) => {
                // Validate position (0-6)
                const validPosition = Math.max(0, Math.min(6, newPosition));

                // Update position state
                setSliderPosition(validPosition);

                // Convert to speed value
                const newSpeed = sliderPositionToSpeed(validPosition);
                setSpeed(newSpeed);

                // Only send updates if onUpdate is provided
                if (onUpdate) {
                    onUpdate({
                        port,
                        speed: newSpeed,
                    });
                }
            },
            [port, onUpdate],
        );

        // Handle clicking on a bar
        const handleBarClick = useCallback(
            (position) => {
                if (isDisconnected) return;

                // Map bar indices to slider positions
                // bar0 = position 0, bar1 = position 1, bar2 = position 2
                // bar4 = position 4, bar5 = position 5, bar6 = position 6
                handleSliderChange(position);
            },
            [handleSliderChange, isDisconnected],
        );

        // Calculate thumb position percentage from slider position
        const getThumbPosition = useCallback(() => {
            return `${(sliderPosition / 6) * 100}%`;
        }, [sliderPosition]);

        // Handle slider track click
        const handleTrackClick = useCallback(
            (e) => {
                if (isDisconnected) return;

                const rect = sliderTrackRef.current.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const trackWidth = rect.width;
                const position = Math.round((clickX / trackWidth) * 6);

                handleSliderChange(position);
            },
            [handleSliderChange, isDisconnected],
        );

        // Mouse events for thumb dragging
        const handleThumbMouseDown = useCallback(
            (e) => {
                if (isDisconnected) return;

                e.preventDefault();
                isDragging.current = true;

                // Add document event listeners for dragging
                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
            },
            [isDisconnected],
        );

        const handleMouseMove = useCallback(
            (e) => {
                if (!isDragging.current) return;

                const rect = sliderTrackRef.current.getBoundingClientRect();
                const trackWidth = rect.width;
                const mouseX = e.clientX - rect.left;

                // Calculate position from mouse position
                let position = Math.round((mouseX / trackWidth) * 6);
                position = Math.max(0, Math.min(6, position)); // Clamp between 0-6

                handleSliderChange(position);
            },
            [handleSliderChange, isDragging],
        );

        const handleMouseUp = useCallback(() => {
            isDragging.current = false;

            // Remove document event listeners
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        }, [handleMouseMove]);

        // Add and remove document event listeners on mount/unmount
        useEffect(() => {
            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }, [handleMouseMove, handleMouseUp]);

        // Get bars for rendering
        const bars = getBars();

        // The icons for each position
        const positionIcons = [
            {
                icon: (
                    <Rabbit
                        className={styles.flippedHorizontally}
                        size={20}
                    />
                ),
                label: "Fast Backward",
            },
            { icon: <MoveLeft size={20} />, label: "Medium Backward" },
            {
                icon: (
                    <Turtle
                        className={styles.flippedHorizontally}
                        size={20}
                    />
                ),
                label: "Slow Backward",
            },
            { icon: <Octagon size={16} />, label: "Stop" },
            { icon: <Turtle size={20} />, label: "Slow Forward" },
            { icon: <MoveRight size={20} />, label: "Medium Forward" },
            { icon: <Rabbit size={20} />, label: "Fast Forward" },
        ];

        return (
            <div
                className={`${styles.singleMotorDash} ${
                    isDisconnected ? styles.disconnected : ""
                }`}
                data-port={port}
            >
                <div className={styles.motorHeader}>
                    <span className={styles.portLabel}>MOTOR {port}</span>
                    {isDisconnected && (
                        <>
                            <span className={styles.disconnectedLabel}>
                                Disconnected
                            </span>
                            <button
                                className={styles.dismissButton}
                                onClick={() => onDismiss?.(port)}
                                aria-label={`Dismiss disconnected Motor ${port}`}
                            >
                                ✕
                            </button>
                        </>
                    )}
                </div>

                <div className={styles.motorControlContainer}>
                    {/* Full-width bar visualization that matches slider width */}
                    <div className={styles.barVisualization}>
                        {bars.map((bar) => (
                            <button
                                key={`bar-${bar.index}`}
                                className={`${styles.bar} 
                                ${
                                    bar.isVisible
                                        ? `${
                                              bar.isForward
                                                  ? styles.forwardBar
                                                  : styles.backwardBar
                                          }`
                                        : styles.stopBar
                                } 
                                
                                ${bar.isActive ? styles.active : ""} 
                                `}
                                style={{ height: `${bar.height}px` }}
                                onClick={() => handleBarClick(bar.index)}
                                disabled={isDisconnected}
                                aria-label={`Set speed to ${
                                    positionIcons[bar.index].label
                                }`}
                            >
                                {bar.height === 30 ? <Octagon /> : ""}
                            </button>
                        ))}
                    </div>

                    {/* Slider control */}
                    <div className={styles.sliderControl}>
                        {/* Direction labels positioned at slider ends */}
                        <div className={styles.sliderWithLabels}>
                            {showLabels && (
                                <div className={styles.backwardLabel}>
                                    BACKWARD
                                </div>
                            )}

                            {/* Interactive slider */}
                            <div
                                ref={sliderTrackRef}
                                className={styles.sliderTrack}
                                onClick={handleTrackClick}
                                role="slider"
                                aria-valuemin={0}
                                aria-valuemax={6}
                                aria-valuenow={sliderPosition}
                                aria-disabled={isDisconnected}
                                tabIndex={isDisconnected ? -1 : 0}
                            >
                                {/* Slider thumb */}
                                <div
                                    ref={thumbRef}
                                    className={styles.sliderThumb}
                                    style={{ left: getThumbPosition() }}
                                    onMouseDown={handleThumbMouseDown}
                                    role="presentation"
                                />
                            </div>

                            {showLabels && (
                                <div className={styles.forwardLabel}>
                                    FORWARD
                                </div>
                            )}
                        </div>

                        {/* Position icons */}
                        <div className={styles.positionIcons}>
                            {positionIcons.map((pos, index) => (
                                <button
                                    key={index}
                                    className={`${styles.positionIcon} ${
                                        sliderPosition === index
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={() => handleSliderChange(index)}
                                    disabled={isDisconnected}
                                    aria-label={pos.label}
                                    aria-pressed={sliderPosition === index}
                                >
                                    {pos.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);

/**
 * Main component for motor dashboard with multiple motors
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onUpdate - Callback when motor configurations change
 * @param {Object|Array} props.configuration - Current configuration for one or more motors
 * @param {Array} props.slotData - Data for all slots
 * @param {boolean} props.showLabels - Whether to show text labels
 * @returns {JSX.Element} Motor dashboard component
 */
export const MotorDash = ({
    onUpdate,
    configuration,
    slotData,
    currSlotNumber,
    showLabels = true,
}) => {
    const { portStates, isConnected } = useBLE();
    const [dismissedPorts, setDismissedPorts] = useState(new Set());

    // Get configured ports from slotData
    const configuredPorts = React.useMemo(() => {
        const configuredSet = new Set();
        if (slotData) {
            console.log(
                `MotorDash: Calculating configuredPorts for slot ${currSlotNumber}`,
                {
                    currentSlot: currSlotNumber,
                },
            );

            Object.values(slotData).forEach((slot, index) => {
                if (slot?.type === "action" && slot?.subtype === "motor") {
                    console.log(
                        `MotorDash: Checking slot ${index} for motor configs`,
                    );
                    if (Array.isArray(slot.configuration)) {
                        slot.configuration.forEach((config) => {
                            if (config?.port) {
                                configuredSet.add(config.port);
                                console.log(
                                    `MotorDash: Added port ${config.port} from slot ${index} array config`,
                                );
                            }
                        });
                    } else if (slot.configuration?.port) {
                        configuredSet.add(slot.configuration.port);
                        console.log(
                            `MotorDash: Added port ${slot.configuration.port} from slot ${index}`,
                        );
                    }
                }
            });
        }
        console.log(
            `MotorDash: Calculated configuredPorts:`,
            Array.from(configuredSet),
        );
        return configuredSet;
    }, [slotData, currSlotNumber]);

    // Get active and disconnected ports
    const { activeMotors, disconnectedPorts } = React.useMemo(() => {
        const active = {};
        let dismissedPortsChanged = false;
        const newDismissedPorts = new Set(dismissedPorts);

        // Get connected motors
        Object.entries(portStates || {}).forEach(([port, state]) => {
            if (state && state.type === 0x30) {
                active[port] = state;

                // If this port was previously dismissed but is now connected,
                // remove it from the dismissed ports set
                if (dismissedPorts.has(port)) {
                    newDismissedPorts.delete(port);
                    dismissedPortsChanged = true;
                    console.log(
                        `MotorDash: Port ${port} reconnected, removing from dismissed list`,
                    );
                }
            }
        });

        // Update dismissedPorts state if needed
        if (dismissedPortsChanged) {
            // Use setTimeout to avoid state updates during render
            setTimeout(() => {
                setDismissedPorts(newDismissedPorts);
            }, 0);
        }

        // Get configured but disconnected ports
        const disconnected = Array.from(configuredPorts).filter(
            (port) => !active[port] && !newDismissedPorts.has(port),
        );

        console.log("MotorDash: Active and disconnected ports calculated", {
            activeMotors: Object.keys(active),
            disconnectedPorts: disconnected,
            dismissedPorts: Array.from(newDismissedPorts),
        });

        return { activeMotors: active, disconnectedPorts: disconnected };
    }, [portStates, configuredPorts, dismissedPorts]);

    // Handle update from a single motor dashboard
    const handleMotorUpdate = useCallback(
        (port, config) => {
            if (!onUpdate) return;

            console.log(
                `MotorDash: handleMotorUpdate called for port ${port}`,
                {
                    hasConfig: !!config,
                    configDetails: config ? JSON.stringify(config) : "null",
                    currentConfig: JSON.stringify(configuration),
                },
            );

            // Get existing configurations
            let currentConfigs = Array.isArray(configuration)
                ? [...configuration]
                : [];

            if (config) {
                // Find and update or add configuration for this port
                const existingIndex = currentConfigs.findIndex(
                    (c) => c.port === port,
                );
                if (existingIndex >= 0) {
                    currentConfigs[existingIndex] = config;
                    console.log(
                        `MotorDash: Updated existing config at index ${existingIndex}`,
                    );
                } else {
                    currentConfigs.push(config);
                    console.log(`MotorDash: Added new config for port ${port}`);
                }
            } else {
                // Remove configuration for this port if it exists
                console.log(`MotorDash: Removing config for port ${port}`);
                currentConfigs = currentConfigs.filter((c) => c.port !== port);
            }

            // Only update if we have at least one configuration
            if (currentConfigs.length > 0) {
                console.log("MotorDash: Calling onUpdate with configs array", {
                    configCount: currentConfigs.length,
                    configs: JSON.stringify(currentConfigs),
                });
                onUpdate(currentConfigs);
            } else {
                console.log(
                    "MotorDash: Calling onUpdate with null (no configs)",
                );
                onUpdate(null);
            }
        },
        [onUpdate, configuration],
    );

    // Handle dismissing a disconnected motor
    const handleDismiss = useCallback(
        (port) => {
            console.log(`MotorDash: Dismissing port ${port}`, {
                currentConfig: JSON.stringify(configuration),
                configType: Array.isArray(configuration) ? "array" : "single",
                currSlotNumber: currSlotNumber,
            });

            // Add to dismissed ports set
            setDismissedPorts((prev) => {
                const newSet = new Set([...prev, port]);
                console.log(
                    "MotorDash: Updated dismissedPorts",
                    Array.from(newSet),
                );
                return newSet;
            });

            // Remove the dismissed port from the configuration
            if (onUpdate) {
                if (Array.isArray(configuration)) {
                    const newConfig = configuration.filter(
                        (c) => c.port !== port,
                    );
                    console.log(`MotorDash: After filtering, new config is`, {
                        newConfig: JSON.stringify(newConfig),
                        isEmpty: newConfig.length === 0,
                    });

                    if (newConfig.length > 0) {
                        console.log(
                            "MotorDash: Calling onUpdate with filtered array config",
                        );
                        onUpdate(newConfig);
                    } else {
                        console.log(
                            "MotorDash: Calling onUpdate with null (empty array)",
                        );
                        onUpdate(null);
                    }
                } else if (configuration?.port === port) {
                    console.log(
                        "MotorDash: Calling onUpdate with null (single port match)",
                    );
                    onUpdate(null);
                } else {
                    console.log("MotorDash: Port not found in configuration", {
                        port,
                        configPort: configuration?.port,
                    });
                }
            }
        },
        [configuration, onUpdate, currSlotNumber],
    );

    return (
        <div className={styles.motorDashContainer}>
            {!isConnected ? (
                <div className={styles.noConnection}>
                    <BluetoothSearching size={24} />
                    <span>Connect robot</span>
                </div>
            ) : Object.keys(activeMotors).length === 0 &&
              disconnectedPorts.length === 0 ? (
                <div className={styles.noMotors}>
                    <RefreshCwOff size={24} />
                    <span>Connect motor</span>
                </div>
            ) : (
                <>
                    {/* Connected Motors */}
                    {Object.keys(activeMotors).map((port) => (
                        <SingleMotorDash
                            key={port}
                            port={port}
                            onUpdate={(config) =>
                                handleMotorUpdate(port, config)
                            }
                            configuration={
                                Array.isArray(configuration)
                                    ? configuration.find((c) => c.port === port)
                                    : configuration?.port === port
                                    ? configuration
                                    : null
                            }
                            isDisconnected={false}
                            showLabels={showLabels}
                        />
                    ))}

                    {/* Disconnected but configured motors */}
                    {disconnectedPorts.map((port) => (
                        <SingleMotorDash
                            key={`disconnected-${port}`}
                            port={port}
                            onUpdate={(config) =>
                                handleMotorUpdate(port, config)
                            }
                            configuration={
                                Array.isArray(configuration)
                                    ? configuration.find((c) => c.port === port)
                                    : configuration?.port === port
                                    ? configuration
                                    : null
                            }
                            isDisconnected={true}
                            onDismiss={handleDismiss}
                            showLabels={showLabels}
                        />
                    ))}
                </>
            )}
        </div>
    );
};

export default memo(MotorDash);
