/**
 * @file SpinClockwiseDash.jsx
 * @description Dashboard component for configuring motors to spin clockwise at selected speeds.
 * Provides a simplified interface where users select motors and choose speed levels.
 * Part of the motor action decomposition to reduce cognitive load for autistic users.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

import React, { useState, useEffect, useCallback, memo } from "react";
import { useBLE } from "../../../bluetooth/context/BLEContext";
import { Snail, Turtle, Rabbit, CircleAlert } from "lucide-react";
import styles from "../styles/SpinMotorDash.module.css";

// Speed constants matching existing motor speed utilities
const SPEED_VALUES = {
    slow: 330,
    medium: 660,
    fast: 1000
};

/**
 * Component for a single motor control in clockwise spin dashboard
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.port - Motor port (A-F)
 * @param {boolean} props.isSelected - Whether this motor is selected
 * @param {string} props.selectedSpeed - Currently selected speed level
 * @param {boolean} props.isConnected - Whether the motor is connected
 * @param {Function} props.onToggleSelection - Callback when motor selection is toggled
 * @param {Function} props.onSpeedChange - Callback when speed is changed
 * @returns {JSX.Element} Single motor control dash
 */
const SingleMotorDash = memo(({ 
    port, 
    isSelected, 
    selectedSpeed, 
    isConnected, 
    onToggleSelection, 
    onSpeedChange 
}) => {
    const speedOptions = [
        { key: 'slow', icon: <Snail className={styles.speedIcon} />, label: 'Slow' },
        { key: 'medium', icon: <Turtle className={styles.speedIcon} />, label: 'Medium' },
        { key: 'fast', icon: <Rabbit className={styles.speedIcon} />, label: 'Fast' }
    ];

    const handleMotorClick = () => {
        if (isConnected) {
            onToggleSelection(port);
        }
    };

    const handleSpeedClick = (speed) => {
        if (isSelected && isConnected) {
            onSpeedChange(port, speed);
        }
    };

    return (
        <div 
            className={`${styles.motorDash} ${isSelected ? styles.selected : ''} ${!isConnected ? styles.disconnected : ''}`}
            onClick={handleMotorClick}
        >
            {/* Selection toggle */}
            <div className={`${styles.selectionToggle} ${isSelected ? styles.selected : ''}`}>
                {isSelected && <span className={styles.checkMark}>✓</span>}
            </div>

            {/* Port label */}
            <div className={styles.portLabel}>Motor {port}</div>

            {/* Disconnection warning */}
            {!isConnected && (
                <div className={styles.disconnectedWarning}>
                    <CircleAlert size={12} />
                    Disconnected
                </div>
            )}

            {/* Speed controls - only show when selected */}
            {isSelected && (
                <div className={styles.speedControls}>
                    {speedOptions.map(({ key, icon, label }) => (
                        <button
                            key={key}
                            className={`${styles.speedButton} ${styles[key]} ${selectedSpeed === key ? styles.selectedSpeed : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSpeedClick(key);
                            }}
                            disabled={!isConnected}
                            aria-label={`Set speed to ${label}`}
                        >
                            <div className={styles.speedIconContainer}>
                                {icon}
                            </div>
                            <div className={styles.speedLabel}>{label}</div>
                        </button>
                    ))}
                </div>
            )}

            {/* Motor animation */}
            <div className={`${styles.motorAnimation} ${!isSelected ? styles.unknown : ''}`}>
                <div 
                    className={`${styles.motorRotor} ${isSelected && isConnected ? styles.spinning : ''}`}
                    style={{
                        animationDuration: isSelected ? 
                            (selectedSpeed === 'slow' ? '3s' : selectedSpeed === 'medium' ? '2s' : '1s') : 
                            undefined
                    }}
                >
                    <div className={styles.motorPattern}>
                        <div className={`${styles.patternDot} ${styles.top}`}></div>
                        <div className={`${styles.patternDot} ${styles.right}`}></div>
                        <div className={`${styles.patternDot} ${styles.bottom}`}></div>
                        <div className={`${styles.patternDot} ${styles.left}`}></div>
                        <div className={`${styles.patternDot} ${styles.center}`}></div>
                    </div>
                </div>
                
                {/* Question mark overlay for unselected motors */}
                {!isSelected && (
                    <div className={styles.questionMarkOverlay}>?</div>
                )}
            </div>
        </div>
    );
});

/**
 * Main dashboard component for configuring clockwise motor spinning
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onUpdate - Callback when motor configurations change
 * @param {Object|Array} props.configuration - Current configuration for motors
 * @param {Array} props.slotData - Data for all slots (unused but maintained for interface compatibility)
 * @param {number} props.currSlotNumber - Current active slot number (unused but maintained for interface compatibility)
 * @param {boolean} props.isMissionMode - Whether currently in mission mode
 * @param {Function} props.dispatchTaskEvent - Function to dispatch mission task events
 * @returns {JSX.Element} Clockwise motor spin dashboard
 */
export const SpinClockwiseDash = ({ 
    onUpdate, 
    configuration, 
    slotData, 
    currSlotNumber, 
    isMissionMode = false, 
    dispatchTaskEvent = null 
}) => {
    const { portStates, isConnected } = useBLE();
    
    // Local state for motor configurations
    const [motorConfigs, setMotorConfigs] = useState(new Map());
    
    // Get connected motors
    const connectedMotors = Object.entries(portStates || {}).filter(([port, state]) => 
        state && (state.type === 0x30 || state.type === 0x31 || state.type === 0x41) // All motor types
    );

    // Initialize motor configs from existing configuration
    useEffect(() => {
        const newConfigs = new Map();
        
        if (configuration) {
            const configs = Array.isArray(configuration) ? configuration : [configuration];
            configs.forEach(config => {
                if (config && config.port && config.speed > 0) { // Only positive speeds for clockwise
                    // Determine speed level from numeric value
                    let speedLevel = 'fast'; // default
                    if (config.speed <= 330) speedLevel = 'slow';
                    else if (config.speed <= 660) speedLevel = 'medium';
                    
                    newConfigs.set(config.port, {
                        port: config.port,
                        speed: speedLevel,
                        selected: true
                    });
                }
            });
        }
        
        setMotorConfigs(newConfigs);
    }, [configuration]);

    /**
     * Handle toggling motor selection
     * @param {string} port - Motor port to toggle
     */
    const handleToggleSelection = useCallback((port) => {
        setMotorConfigs(prev => {
            const newConfigs = new Map(prev);
            
            if (newConfigs.has(port)) {
                // Deselect motor
                newConfigs.delete(port);
            } else {
                // Select motor with default speed
                newConfigs.set(port, {
                    port: port,
                    speed: 'fast', // Default to fast speed
                    selected: true
                });
            }
            
            // Update parent component
            updateConfiguration(newConfigs);
            
            return newConfigs;
        });
        
        // Dispatch mission event if applicable
        if (isMissionMode && dispatchTaskEvent) {
            dispatchTaskEvent('MOTOR_SELECTION_CHANGED', {
                port: port,
                direction: 'clockwise',
                currentSlot: currSlotNumber,
            });
        }
    }, [isMissionMode, dispatchTaskEvent, currSlotNumber]);

    /**
     * Handle speed change for a motor
     * @param {string} port - Motor port
     * @param {string} speed - Speed level (slow/medium/fast)
     */
    const handleSpeedChange = useCallback((port, speed) => {
        setMotorConfigs(prev => {
            const newConfigs = new Map(prev);
            
            if (newConfigs.has(port)) {
                newConfigs.set(port, {
                    ...newConfigs.get(port),
                    speed: speed
                });
                
                // Update parent component
                updateConfiguration(newConfigs);
            }
            
            return newConfigs;
        });
        
        // Dispatch mission event if applicable
        if (isMissionMode && dispatchTaskEvent) {
            dispatchTaskEvent('MOTOR_SPEED_CHANGED', {
                port: port,
                speed: speed,
                direction: 'clockwise',
                currentSlot: currSlotNumber,
            });
        }
    }, [isMissionMode, dispatchTaskEvent, currSlotNumber]);

    /**
     * Update parent component with current configuration
     * @param {Map} configs - Current motor configurations
     */
    const updateConfiguration = (configs) => {
        if (!onUpdate) return;
        
        const configArray = Array.from(configs.values()).map(config => ({
            port: config.port,
            speed: SPEED_VALUES[config.speed] // Convert to numeric value
        }));
        
        if (configArray.length === 0) {
            onUpdate(null);
        } else if (configArray.length === 1) {
            onUpdate(configArray[0]);
        } else {
            onUpdate(configArray);
        }
    };

    // Determine prompt text
    const hasSelectedMotors = motorConfigs.size > 0;
    const promptText = hasSelectedMotors ? "Choose Speeds:" : "Choose Motors:";

    if (!isConnected) {
        return (
            <div className={styles.dashboardContainer}>
                <div className={styles.noConnection}>
                    <CircleAlert size={24} />
                    <span>Connect robot to configure motors</span>
                </div>
            </div>
        );
    }

    if (connectedMotors.length === 0) {
        return (
            <div className={styles.dashboardContainer}>
                <div className={styles.noMotors}>
                    <CircleAlert size={24} />
                    <span>No motors connected</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.dashboardTitle}>Spin Clockwise</div>
            
            <div className={styles.promptText}>{promptText}</div>
            
            <div className={styles.motorsContainer}>
                {connectedMotors.map(([port, state]) => {
                    const motorConfig = motorConfigs.get(port);
                    const isSelected = motorConfig?.selected || false;
                    const selectedSpeed = motorConfig?.speed || 'fast';
                    
                    return (
                        <SingleMotorDash
                            key={port}
                            port={port}
                            isSelected={isSelected}
                            selectedSpeed={selectedSpeed}
                            isConnected={true}
                            onToggleSelection={handleToggleSelection}
                            onSpeedChange={handleSpeedChange}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default memo(SpinClockwiseDash);