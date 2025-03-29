/*
 * @file MotorDash.jsx
 * @description Dashboard interface for configuring motor actions with a vertical bar visualization
 * for speed and direction, designed for students with autism.
 * Updated to include motor animation above the bars.
 */

import React, { useState, useEffect, useCallback, memo } from "react";
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
import DashMotorAnimation from "./DashMotorAnimation";


const FilledOctagon = (props) => {
  return React.cloneElement(<Octagon />, { fill: "currentColor", ...props });
};

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
 * @returns {JSX.Element} Single motor control dashboard
 */
const SingleMotorDash = memo(
    ({
        port,
        onUpdate,
        configuration,
        isDisconnected,
        onDismiss
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

        // Update local state when configuration changes externally
        useEffect(() => {
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
                const actualHeight = 90; // height * 30; // Scale heights

                // Determine which bars should be active based on the slider position
                let isActive = false;

                if (isInitialized) {
                    if (sliderPosition === 0) {
                        // Visual activation on left side when clicked
                        isActive = index === 6 || index === 5 || index === 4;
                    } else if (sliderPosition === 1) {
                        // Visual activation on left side when clicked
                        isActive = index === 5 || index === 4;
                    } else if (sliderPosition === 2) {
                        // Visual activation on left side when clicked
                        isActive = index === 4;
                    } else if (sliderPosition === 3) {
                        // stop (center)
                        isActive = index === 3 && speed !== undefined;
                    } else if (sliderPosition === 4) {
                        // Visual activation on right side when clicked
                        isActive = index === 2;
                    } else if (sliderPosition === 5) {
                        // Visual activation on right side when clicked
                        isActive = index === 2 || index === 1;
                    } else if (sliderPosition === 6) {
                        // Visual activation on right side when clicked
                        isActive = index === 0 || index === 1 || index === 2;
                    }
                }

                // Keep the visual appearance of forward/backward the same
                const isForward = index > 3; // Right side is still visually forward
                const isVisible = index !== 3;

                return {
                    index,
                    height: actualHeight,
                    isActive,
                    isForward,
                    isVisible,
                };
            });
        };

        // Handle position changes
        const handlePositionChange = useCallback(
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

                // Reverse the bar position to get the expected speed
                // This way, position 0 (left-most bar) will produce the speed that 
                // position 6 (right-most bar) used to produce, and vice versa
                const reversedPosition = position === 3 ? 3 : (6 - position);
                
                handlePositionChange(reversedPosition);
            },
            [handlePositionChange, isDisconnected],
        );

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
            { icon: <FilledOctagon size={16} />, label: "Stop" },
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
                    {/* Motor Animation added above the bars */}
                    <div className={styles.motorAnimationWrapper}>
                        <DashMotorAnimation
                            speed={speed || 0}
                            active={!isDisconnected}
                            port={port}
                        />
                    </div>
                    
                    {/* Bar visualization */}
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
                                <div className={styles.barIcon}>
                                    {positionIcons[bar.index].icon}
                                </div>
                            </button>
                        ))}
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
 * @param {number} props.currSlotNumber - Current active slot number
 * @returns {JSX.Element} Motor dashboard component
 */
export const MotorDash = ({
    onUpdate,
    configuration,
    slotData,
    currSlotNumber,
    isMissionMode = false,
    dispatchTaskEvent = null
}) => {
    const { portStates, isConnected } = useBLE();

    // Track dismissed ports by slot number
    const [dismissedPortsBySlot, setDismissedPortsBySlot] = useState(new Map());

    // Get dismissed ports for the current slot only
    const dismissedPortsForCurrentSlot = React.useMemo(() => {
        return dismissedPortsBySlot.get(currSlotNumber) || new Set();
    }, [dismissedPortsBySlot, currSlotNumber]);

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
                } else {
                    currentConfigs.push(config);
                }
            } else {
                // Remove configuration for this port if it exists
                currentConfigs = currentConfigs.filter((c) => c.port !== port);
            }

            // Only update if we have at least one configuration
            if (currentConfigs.length > 0) {
                // If there's only one config, don't wrap in array to maintain backward compatibility
                if (currentConfigs.length === 1) {
                    onUpdate(currentConfigs[0]);
                } else {
                    onUpdate(currentConfigs);
                }
            } else {
                onUpdate(null);
            }
        },
        [onUpdate, configuration],
    );

    // Handle dismissing a disconnected motor - now slot-specific
    const handleDismiss = useCallback(
        (port) => {
            // Add to dismissed ports ONLY for the current slot
            setDismissedPortsBySlot((prev) => {
                const newMap = new Map(prev);
                const slotDismissed = new Set(newMap.get(currSlotNumber) || []);
                slotDismissed.add(port);
                newMap.set(currSlotNumber, slotDismissed);

                return newMap;
            });

            // Remove the dismissed port from the configuration FOR THIS SLOT ONLY
            if (onUpdate) {
                if (Array.isArray(configuration)) {
                    const newConfig = configuration.filter(
                        (c) => c.port !== port,
                    );

                    if (newConfig.length > 0) {
                        onUpdate(newConfig);
                    } else {
                        onUpdate(null);
                    }
                } else if (configuration?.port === port) {
                    onUpdate(null);
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
                        // Find the configuration for this port (if any)
                        const config = Array.isArray(configuration)
                            ? configuration.find((c) => c.port === port)
                            : configuration?.port === port
                            ? configuration
                            : null;

                        // Generate a key that forces remount when slot changes
                        const componentKey = `port-${port}-slot-${currSlotNumber}`;

                        return (
                            <SingleMotorDash
                                key={componentKey}
                                port={port}
                                onUpdate={(newConfig) =>
                                    handleMotorUpdate(port, newConfig)
                                }
                                configuration={config}
                                isDisconnected={false}
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
                        />
                    ))}
                </>
            )}
        </div>
    );
};

export default memo(MotorDash);