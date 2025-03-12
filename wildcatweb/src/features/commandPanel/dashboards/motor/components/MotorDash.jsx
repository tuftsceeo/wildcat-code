/**
 * @file MotorDash.jsx
 * @description Dashboard interface for configuring motor actions with a vertical bar visualization
 * and slider control for speed and direction, designed for students with autism.
 * Updated to handle slot-specific dismissals and proper component reinitialization.
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
        // Track if this motor has been initialized with a command
        const [isInitialized, setIsInitialized] = useState(
            configuration?.speed !== undefined,
        );

        // Use speed as the main state with undefined for uninitialized state
        // Extract speed from configuration or use undefined as default for uninitialized
        const [speed, setSpeed] = useState(
            configuration?.speed !== undefined
                ? validateSpeed(configuration.speed)
                : undefined,
        );

        // Track position (0-6) for the UI, using center (3) as visual default for uninitialized
        const [sliderPosition, setSliderPosition] = useState(
            configuration?.speed !== undefined
                ? speedToSliderPosition(speed || 0)
                : 3,
        );

        // Refs for DOM elements
        const sliderTrackRef = useRef(null);
        const thumbRef = useRef(null);
        const isDragging = useRef(false);

        // Update local state when configuration changes externally
        useEffect(() => {
            console.log(`SingleMotorDash: Config changed for port ${port}`, {
                configExists: !!configuration,
                speedDefined: configuration?.speed !== undefined,
                speed: configuration?.speed,
            });

            if (configuration?.speed !== undefined) {
                // Motor has been configured with a speed
                const validatedSpeed = validateSpeed(configuration.speed);
                setSpeed(validatedSpeed);
                setSliderPosition(speedToSliderPosition(validatedSpeed));
                setIsInitialized(true);
            } else {
                // Motor is uninitialized - no configuration or no speed set
                setSpeed(undefined);
                setSliderPosition(3); // Center position visually
                setIsInitialized(false);
            }
        }, [configuration, port]);

        // Define bar properties
        const getBars = () => {
            // Create the 7 bars with their relative heights (3-2-1-0-1-2-3)
            const barHeights = [3, 2, 1, 1.5, 1, 2, 3];

            return barHeights.map((height, index) => {
                // The fourth bar (index 3) should have zero height (invisible)
                const actualHeight = height * 20; // Scale heights

                // Determine if the bar should be highlighted based on slider position
                // For uninitialized motors, no bars should be active
                let isActive = false;

                if (isInitialized) {
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
                        isActive = index === 3 && speed !== undefined;
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

                // Mark as initialized since user has set a speed
                setIsInitialized(true);

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
                data-initialized={isInitialized}
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
                                        sliderPosition === index &&
                                        isInitialized
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={() => handleSliderChange(index)}
                                    disabled={isDisconnected}
                                    aria-label={pos.label}
                                    aria-pressed={
                                        sliderPosition === index &&
                                        isInitialized
                                    }
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

    // Track dismissed ports by slot number
    const [dismissedPortsBySlot, setDismissedPortsBySlot] = useState(new Map());

    // Get dismissed ports for the current slot only
    const dismissedPortsForCurrentSlot = React.useMemo(() => {
        return dismissedPortsBySlot.get(currSlotNumber) || new Set();
    }, [dismissedPortsBySlot, currSlotNumber]);

    // When slot changes, log the change and ensure clean state
    useEffect(() => {
        console.log(`MotorDash: Slot changed to ${currSlotNumber}`, {
            dismissedForThisSlot: Array.from(
                dismissedPortsForCurrentSlot || [],
            ),
        });
    }, [currSlotNumber, dismissedPortsForCurrentSlot]);

    // Get configured ports from the current slot's configuration
    const configuredPortsForCurrentSlot = React.useMemo(() => {
        const configuredSet = new Set();

        // Extract configured ports for the current slot only
        const slotConfig = slotData?.[currSlotNumber];
        if (slotConfig?.type === "action" && slotConfig?.subtype === "motor") {
            if (Array.isArray(slotConfig.configuration)) {
                slotConfig.configuration.forEach((config) => {
                    if (config?.port) {
                        configuredSet.add(config.port);
                    }
                });
            } else if (slotConfig.configuration?.port) {
                configuredSet.add(slotConfig.configuration.port);
            }
        }

        console.log(
            `MotorDash: Configured ports for slot ${currSlotNumber}:`,
            Array.from(configuredSet),
        );
        return configuredSet;
    }, [slotData, currSlotNumber]);

    // Get active and disconnected ports
    const { activeMotors, disconnectedPorts } = React.useMemo(() => {
        const active = {};

        // Get connected motors
        Object.entries(portStates || {}).forEach(([port, state]) => {
            if (state && state.type === 0x30) {
                active[port] = state;
            }
        });

        // Only show disconnected ports that:
        // 1. Are configured for the CURRENT slot AND
        // 2. Are not currently connected AND
        // 3. Have not been dismissed for THIS slot
        const disconnected = Array.from(configuredPortsForCurrentSlot).filter(
            (port) => !active[port] && !dismissedPortsForCurrentSlot.has(port),
        );

        console.log(`MotorDash: Slot ${currSlotNumber} status:`, {
            activeMotors: Object.keys(active),
            disconnectedPorts: disconnected,
            dismissedForThisSlot: Array.from(dismissedPortsForCurrentSlot),
        });

        return { activeMotors: active, disconnectedPorts: disconnected };
    }, [
        portStates,
        configuredPortsForCurrentSlot,
        dismissedPortsForCurrentSlot,
    ]);

    // Handle update from a single motor dashboard
    const handleMotorUpdate = useCallback(
        (port, config) => {
            if (!onUpdate) return;

            console.log(
                `MotorDash: handleMotorUpdate called for port ${port} in slot ${currSlotNumber}`,
                {
                    hasConfig: !!config,
                    configDetails: config ? JSON.stringify(config) : "null",
                    currentConfig: JSON.stringify(configuration),
                },
            );

            // Get existing configurations
            let currentConfigs = Array.isArray(configuration)
                ? [...configuration]
                : configuration
                ? [configuration]
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
                console.log(
                    `MotorDash: Calling onUpdate with configs array for slot ${currSlotNumber}`,
                    {
                        configCount: currentConfigs.length,
                        configs: JSON.stringify(currentConfigs),
                    },
                );

                // If there's only one config, don't wrap in array to maintain backward compatibility
                if (currentConfigs.length === 1) {
                    onUpdate(currentConfigs[0]);
                } else {
                    onUpdate(currentConfigs);
                }
            } else {
                console.log(
                    `MotorDash: Calling onUpdate with null (no configs) for slot ${currSlotNumber}`,
                );
                onUpdate(null);
            }
        },
        [onUpdate, configuration, currSlotNumber],
    );

    // Handle dismissing a disconnected motor - now slot-specific
    const handleDismiss = useCallback(
        (port) => {
            console.log(
                `MotorDash: Dismissing port ${port} from slot ${currSlotNumber}`,
                {
                    currentConfig: JSON.stringify(configuration),
                    configType: Array.isArray(configuration)
                        ? "array"
                        : "single",
                },
            );

            // Add to dismissed ports ONLY for the current slot
            setDismissedPortsBySlot((prev) => {
                const newMap = new Map(prev);
                const slotDismissed = new Set(newMap.get(currSlotNumber) || []);
                slotDismissed.add(port);
                newMap.set(currSlotNumber, slotDismissed);

                console.log(
                    `MotorDash: Updated dismissedPortsBySlot for slot ${currSlotNumber}`,
                    {
                        dismissedForThisSlot: Array.from(slotDismissed),
                    },
                );

                return newMap;
            });

            // Remove the dismissed port from the configuration FOR THIS SLOT ONLY
            if (onUpdate) {
                if (Array.isArray(configuration)) {
                    const newConfig = configuration.filter(
                        (c) => c.port !== port,
                    );

                    if (newConfig.length > 0) {
                        console.log(
                            `MotorDash: Calling onUpdate with filtered array config for slot ${currSlotNumber}`,
                        );
                        onUpdate(newConfig);
                    } else {
                        console.log(
                            `MotorDash: Calling onUpdate with null (empty array) for slot ${currSlotNumber}`,
                        );
                        onUpdate(null);
                    }
                } else if (configuration?.port === port) {
                    console.log(
                        `MotorDash: Calling onUpdate with null (single port match) for slot ${currSlotNumber}`,
                    );
                    onUpdate(null);
                } else {
                    console.log(
                        `MotorDash: Port not found in configuration for slot ${currSlotNumber}`,
                        {
                            port,
                            configPort: configuration?.port,
                        },
                    );
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
                    {Object.keys(activeMotors).map((port) => {
                        // Check if this port is configured for the current slot
                        const isConfiguredForCurrentSlot =
                            configuredPortsForCurrentSlot.has(port);

                        // Find the configuration for this port (if any)
                        const config = Array.isArray(configuration)
                            ? configuration.find((c) => c.port === port)
                            : configuration?.port === port
                            ? configuration
                            : null;

                        // Generate a key that forces remount when slot changes or config status changes
                        const componentKey = `port-${port}-slot-${currSlotNumber}-${
                            isConfiguredForCurrentSlot ? "configured" : "new"
                        }`;

                        console.log(
                            `MotorDash: Rendering motor ${port} for slot ${currSlotNumber}`,
                            {
                                isConfiguredForSlot: isConfiguredForCurrentSlot,
                                hasConfig: !!config,
                                key: componentKey,
                            },
                        );

                        return (
                            <SingleMotorDash
                                key={componentKey}
                                port={port}
                                onUpdate={(newConfig) =>
                                    handleMotorUpdate(port, newConfig)
                                }
                                configuration={config}
                                isDisconnected={false}
                                showLabels={showLabels}
                            />
                        );
                    })}

                    {/* Disconnected but configured motors - only for the current slot */}
                    {disconnectedPorts.map((port) => (
                        <SingleMotorDash
                            key={`disconnected-${port}-slot${currSlotNumber}`}
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
