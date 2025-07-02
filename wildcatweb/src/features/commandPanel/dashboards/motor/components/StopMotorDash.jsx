/**
 * @file StopMotorDash.jsx
 * @description Dashboard component for configuring motors to stop.
 * Provides a simplified interface where users select motors to stop - no speed controls needed.
 * Part of the motor action decomposition to reduce cognitive load for autistic users.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

import React, { useState, useEffect, useCallback, memo } from "react";
import { useBLE } from "../../../bluetooth/context/BLEContext";
import { CircleStop, CircleAlert } from "lucide-react";
import styles from "../styles/SpinMotorDash.module.css";

const FilledCircleStop = (props) => {
    return React.cloneElement(<CircleStop />, {
        fill: "#EB3327",
        stroke: "white",
        ...props,
    });
};

/**
 * Component for a single motor control in stop motor dashboard
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.port - Motor port (A-F)
 * @param {boolean} props.isSelected - Whether this motor is selected
 * @param {boolean} props.isConnected - Whether the motor is connected
 * @param {Function} props.onToggleSelection - Callback when motor selection is toggled
 * @returns {JSX.Element} Single motor control dash
 */
const SingleMotorDash = memo(({ 
    port, 
    isSelected, 
    isConnected, 
    onToggleSelection
}) => {

    const handleMotorClick = () => {
        if (isConnected) {
            onToggleSelection(port);
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

            {/* Stop indicator - only show when selected */}
            {isSelected && (
                <div className={styles.stopIndicator}>
                    <FilledCircleStop className={styles.stopIcon} />
                    <div className={styles.stopLabel}>Stop</div>
                </div>
            )}

            {/* Motor animation - always stopped */}
            <div className={`${styles.motorAnimation} ${!isSelected ? styles.unknown : ''}`}>
                <div className={styles.motorRotor}>
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
 * Main dashboard component for configuring motor stopping
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onUpdate - Callback when motor configurations change
 * @param {Object|Array} props.configuration - Current configuration for motors
 * @param {Array} props.slotData - Data for all slots (unused but maintained for interface compatibility)
 * @param {number} props.currSlotNumber - Current active slot number (unused but maintained for interface compatibility)
 * @param {boolean} props.isMissionMode - Whether currently in mission mode
 * @param {Function} props.dispatchTaskEvent - Function to dispatch mission task events
 * @returns {JSX.Element} Stop motor dashboard
 */
export const StopMotorDash = ({ 
    onUpdate, 
    configuration, 
    slotData, 
    currSlotNumber, 
    isMissionMode = false, 
    dispatchTaskEvent = null 
}) => {
    const { portStates, isConnected } = useBLE();
    
    // Local state for motor selections (just boolean for stop motors)
    const [selectedMotors, setSelectedMotors] = useState(new Set());
    
    // Get connected motors
    const connectedMotors = Object.entries(portStates || {}).filter(([port, state]) => 
        state && (state.type === 0x30 || state.type === 0x31 || state.type === 0x41) // All motor types
    );

    // Initialize selected motors from existing configuration
    useEffect(() => {
        const newSelection = new Set();
        
        if (configuration) {
            const configs = Array.isArray(configuration) ? configuration : [configuration];
            configs.forEach(config => {
                if (config && config.port && config.speed === 0) { // Only stop configurations
                    newSelection.add(config.port);
                }
            });
        }
        
        setSelectedMotors(newSelection);
    }, [configuration]);

    /**
     * Handle toggling motor selection
     * @param {string} port - Motor port to toggle
     */
    const handleToggleSelection = useCallback((port) => {
        setSelectedMotors(prev => {
            const newSelection = new Set(prev);
            
            if (newSelection.has(port)) {
                // Deselect motor
                newSelection.delete(port);
            } else {
                // Select motor
                newSelection.add(port);
            }
            
            // Update parent component
            updateConfiguration(newSelection);
            
            return newSelection;
        });
        
        // Dispatch mission event if applicable
        if (isMissionMode && dispatchTaskEvent) {
            dispatchTaskEvent('MOTOR_SELECTION_CHANGED', {
                port: port,
                direction: 'stop',
                currentSlot: currSlotNumber,
            });
        }
    }, [isMissionMode, dispatchTaskEvent, currSlotNumber]);

    /**
     * Update parent component with current configuration
     * @param {Set} selection - Currently selected motor ports
     */
    const updateConfiguration = (selection) => {
        if (!onUpdate) return;
        
        const configArray = Array.from(selection).map(port => ({
            port: port,
            speed: 0 // Always 0 for stop motors
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
    const hasSelectedMotors = selectedMotors.size > 0;
    const promptText = hasSelectedMotors ? "Motors to Stop:" : "Choose Motors:";

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
            <div className={styles.dashboardTitle}>Stop Motors</div>
            
            <div className={styles.promptText}>{promptText}</div>
            
            <div className={styles.motorsContainer}>
                {connectedMotors.map(([port, state]) => {
                    const isSelected = selectedMotors.has(port);
                    
                    return (
                        <SingleMotorDash
                            key={port}
                            port={port}
                            isSelected={isSelected}
                            isConnected={true}
                            onToggleSelection={handleToggleSelection}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default memo(StopMotorDash);