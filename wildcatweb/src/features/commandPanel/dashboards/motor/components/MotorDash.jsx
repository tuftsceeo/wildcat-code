/**
 * @file MotorDash.jsx
 * @description Dashboard interface for configuring motor actions with circular visualization
 * and horizontal bars for speed and direction control, designed for students with autism.
 * Updated to match the screenshot layout with bars on left, motor on right.
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
 * @param {boolean} props.showLabels - Whether to show text labels (for accessibility)
 * @returns {JSX.Element} Single motor control dashboard
 */
const SingleMotorDash = memo(({
    port,
    onUpdate,
    configuration,
    isDisconnected,
    onDismiss,
}) => {
    // Track if this motor has been initialized with a command
    const [isInitialized, setIsInitialized] = useState(
        configuration?.speed !== undefined
    );

    // Use speed as the main state with undefined for uninitialized state
    const [speed, setSpeed] = useState(
        configuration?.speed !== undefined
            ? validateSpeed(configuration.speed)
            : undefined
    );

    // Track position (0-6) for the UI, using center (3) as visual default for uninitialized
    const [sliderPosition, setSliderPosition] = useState(
        configuration?.speed !== undefined
            ? speedToSliderPosition(speed || 0)
            : 3
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

    // Handle clicking on a bar
    const handleBarClick = useCallback((position) => {
        if (isDisconnected) return;
        handleSpeedChange(position);
    }, [isDisconnected]);

    // Update speed based on position
    const handleSpeedChange = useCallback((newPosition) => {
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
    }, [port, onUpdate]);

    // Configuration for the 7 position bars with varied widths
    const barConfigs = [
        // Fast CCW - position 0
        {
            position: 6,
            width: '100%',
            type: 'clockwise',
            icon: <Rabbit size={10} />,
            label: "Fast clockwise"
        },
        // Medium CCW - position 1
        {
            position: 5,
            width: '70%',
            type: 'clockwise',
            icon: <MoveRight size={10} />,
            label: "Medium clockwise"
        },
        // Slow CCW - position 2
        {
            position: 4,
            width: '50%',
            type: 'clockwise',
            icon: <Turtle size={10} />,
            label: "Slow clockwise"
        },
        // Stop - position 3
        {
            position: 3,
            width: '33%',
            type: 'stop',
            icon: <FilledOctagon size={10} />,
            label: "Stop"
        },
        // Slow CW - position 4
        {
            position: 2,
            width: '50%',
            type: 'counterclockwise',
            icon: <Turtle size={10} />,
            label: "Slow Counterclockwise"
        },
        // Medium CW - position 5
        {
            position: 1,
            width: '70%',
            type: 'counterclockwise',
            icon: <MoveRight size={10} />,
            label: "Medium Counterclockwise"
        },
        // Fast CW - position 6
        {
            position: 0,
            width: '100%',
            type: 'counterclockwise',
            icon: <Rabbit size={10} />,
            label: "Fast Counterclockwise"
        }
    ];

    return (
        <div
            className={`${styles.singleMotorDash} ${
                isDisconnected ? styles.disconnected : ""
            }`}
            data-port={port}
            data-initialized={isInitialized}
        >
            {/* Header with port information */}
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

            {/* Main control layout with left-aligned bars and right-side animation */}
            <div className={styles.motorControlContainer}>
                {/* Bars container - positioned on the left */}
                <div className={styles.barsContainer}>
                    {/* Render the 7 position bars */}
                    {barConfigs.map((bar) => (
                        <button
                            key={`bar-${bar.position}`}
                            className={`${styles.horizontalBar} 
                                ${styles[`${bar.type}Bar`]} 
                                ${sliderPosition === bar.position && isInitialized ? styles.active : ""}`}
                            onClick={() => handleBarClick(bar.position)}
                            disabled={isDisconnected}
                            aria-label={bar.label}
                            style={{ width: bar.width }}
                        >
                            <div className={styles.barIconContainer}>
                                {bar.icon}
                            </div>
                        </button>
                    ))}
                </div>
                
                {/* Motor animation on the right side */}
                <div className={styles.motorAnimationWrapper}>
                    <DashMotorAnimation
                        speed={speed || 0}
                        active={!isDisconnected}
                        port={port}
                    />
                </div>
            </div>

        </div>
    );
});

/**
 * Main component for motor dashboard with multiple motors
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onUpdate - Callback when motor configurations change
 * @param {Object|Array} props.configuration - Current configuration for one or more motors
 * @param {Array} props.slotData - Data for all slots
 * @param {number} props.currSlotNumber - Current active slot number
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
    const { portStates, isConnected, DEVICE_TYPES } = useBLE();

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
            if (state && (state.type === 0x30 || state.deviceType === DEVICE_TYPES.MOTOR)) {
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
        DEVICE_TYPES
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
                    (c) => c.port === port
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
        [onUpdate, configuration]
    );

    // Handle dismissing a disconnected motor - slot-specific
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
        [configuration, onUpdate, currSlotNumber]
    );

    // Calculate grid layout based on number of motors to display
    const totalMotors = Object.keys(activeMotors).length + disconnectedPorts.length;
    const useGridLayout = totalMotors > 2;
    
    return (
        <div className={`${styles.motorDashContainer} ${useGridLayout ? styles.gridLayout : ''}`}>
            {!isConnected ? (
                <div className={styles.noConnection}>
                    <span>Connect robot</span>
                </div>
            ) : Object.keys(activeMotors).length === 0 &&
              disconnectedPorts.length === 0 ? (
                <div className={styles.noMotors}>
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