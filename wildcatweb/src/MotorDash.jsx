/**
 * @file MotorDash.jsx
 * @description Dashboard interface for configuring motor actions with support for
 * multiple motors and disconnected state handling.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

import React, { useState, useEffect, useCallback, memo } from "react";
import { useBLE } from "./BLEContext";
import styles from "./MotorDash.module.css";
import { BluetoothSearching, RefreshCwOff} from 'lucide-react';  // Import Lucide icons

const SingleMotorDash = memo(({ port, onUpdate, configuration, isDisconnected, onDismiss }) => {
    const [command, setCommand] = useState(configuration?.command || null);
    const [speed, setSpeed] = useState(configuration?.speed || 1000);
    const [showSpeedInput, setShowSpeedInput] = useState(false);

    // Debug logging
    useEffect(() => {
        console.log(`SingleMotorDash Port ${port} - isDisconnected:`, isDisconnected);
    }, [port, isDisconnected]);

    // Memoize the update handler
    const handleUpdate = useCallback((newCommand, newSpeed) => {
        if (!onUpdate) return;

        if (!newCommand) {
            onUpdate(null);
            return;
        }

        onUpdate({
            port,
            command: newCommand,
            speed: newCommand === 'SET_SPEED' ? newSpeed : undefined
        });
    }, [port, onUpdate]);

    const handleCommandClick = useCallback((newCommand) => {
        if (command === newCommand) {
            setCommand(null);
            handleUpdate(null);
        } else {
            setCommand(newCommand);
            handleUpdate(newCommand, speed);
        }
    }, [command, speed, handleUpdate]);

    const handleSpeedChange = useCallback((event) => {
        const newSpeed = parseInt(event.target.value);
        if (!isNaN(newSpeed)) {
            setSpeed(newSpeed);
            if (command === 'SET_SPEED') {
                handleUpdate('SET_SPEED', newSpeed);
            }
        }
    }, [command, handleUpdate]);

    return (
        <div 
        className={`${styles.singleMotorDash} ${isDisconnected ? styles.disconnected : ''}`}
        data-port={port}
        data-config={JSON.stringify({
            port,
            command,
            speed,
            isDisconnected
        })}
    >
            <div className={styles.motorHeader}>
                <span className={styles.portLabel}>Motor {port}</span>
                {isDisconnected && (
                    <>
                        <span className={styles.disconnectedLabel}>Disconnected</span>
                        <button 
                            className={styles.dismissButton}
                            onClick={() => onDismiss?.(port)}
                        >
                            ✕
                        </button>
                    </>
                )}
            </div>
            
            <div className={styles.controls}>
                <button
                    className={`${styles.controlButton} ${command === "GO" ? styles.active : ""}`}
                    onClick={() => handleCommandClick("GO")}
                >
                    GO
                </button>
                
                <button
                    className={`${styles.controlButton} ${command === "STOP" ? styles.active : ""}`}
                    onClick={() => handleCommandClick("STOP")}
                >
                    STOP
                </button>

                <div className={styles.speedControl}>
                    <button
                        className={`${styles.speedButton} ${command === "SET_SPEED" ? styles.active : ""}`}
                        onClick={() => {
                            handleCommandClick("SET_SPEED");
                            if (!command || command !== "SET_SPEED") {  // Only show input when activating
                                setShowSpeedInput(true);
                            }
                        }}
                    >
                        SET SPEED: {speed}
                    </button>
                    {showSpeedInput && command === "SET_SPEED" && (  // Only show input when active
                        <input
                            type="number"
                            value={speed}
                            onChange={handleSpeedChange}
                            onBlur={() => setShowSpeedInput(false)}
                            className={styles.speedInput}
                            min="0"
                            max="10000"
                            autoFocus
                        />
                    )}
                </div>
            </div>
        </div>
    );
});

export const MotorDash = ({ onUpdate, configuration, slotData }) => {
    const { portStates, isConnected } = useBLE();  // Add isConnected
    const [dismissedPorts, setDismissedPorts] = useState(new Set());

    // Get configured ports from slotData
    const configuredPorts = React.useMemo(() => {
        const configuredSet = new Set();
        if (slotData) {
            Object.values(slotData).forEach(slot => {
                if (slot?.type === 'action' && slot?.subtype === 'motor') {
                    if (Array.isArray(slot.configuration)) {
                        slot.configuration.forEach(config => {
                            if (config.port) configuredSet.add(config.port);
                        });
                    } else if (slot.configuration?.port) {
                        configuredSet.add(slot.configuration.port);
                    }
                }
            });
        }
        return configuredSet;
    }, [slotData]);

    // Get active and disconnected ports
    const { activeMotors, disconnectedPorts } = React.useMemo(() => {
        const active = {};
        
        // Get connected motors
        Object.entries(portStates).forEach(([port, state]) => {
            if (state && state.type === 0x30) {
                active[port] = state;
            }
        });

        // Get configured but disconnected ports
        const disconnected = [...configuredPorts].filter(port => 
            !active[port] && !dismissedPorts.has(port)
        );

        return { activeMotors: active, disconnectedPorts: disconnected };
    }, [portStates, configuredPorts, dismissedPorts]);

    // Handle update from a single motor dashboard
    const handleMotorUpdate = useCallback((port, config) => {
        if (!onUpdate) return;

        // Get existing configurations
        let currentConfigs = Array.isArray(configuration) ? [...configuration] : [];
        
        if (config) {
            // Find and update or add configuration for this port
            const existingIndex = currentConfigs.findIndex(c => c.port === port);
            if (existingIndex >= 0) {
                currentConfigs[existingIndex] = config;
            } else {
                currentConfigs.push(config);
            }
        } else {
            // Remove configuration for this port if it exists
            currentConfigs = currentConfigs.filter(c => c.port !== port);
        }

        // Only update if we have at least one configuration
        if (currentConfigs.length > 0) {
            onUpdate(currentConfigs);
        } else {
            onUpdate(null);
        }
    }, [onUpdate, configuration]);

    const handleDismiss = useCallback((port) => {
        // Add to dismissed ports set
        setDismissedPorts(prev => new Set([...prev, port]));

        // Remove the dismissed port from the configuration
        if (Array.isArray(configuration)) {
            const newConfig = configuration.filter(c => c.port !== port);
            if (newConfig.length > 0) {
                onUpdate(newConfig);
            } else {
                onUpdate(null); // If no configurations left, clear the slot
            }
        } else if (configuration?.port === port) {
            onUpdate(null);
        }
    }, [configuration, onUpdate]);

    return (
        <div className={styles.motorDashContainer}>
            {!isConnected ? (
                <div className={styles.noConnection}>
                    <BluetoothSearching size={24} color="#EF5350"/>
                    <span>Connect robot first</span>
                </div>
            ) : Object.keys(activeMotors).length === 0 && disconnectedPorts.length === 0 ? (
                <div className={styles.noMotors}>
                    <RefreshCwOff  size={24} color="#FFB74D"/>
                    <span>Connect a motor</span>
                </div>
            ) : (
                <>
                    {/* Connected Motors */}
                    {Object.keys(activeMotors).map((port) => (
                        <SingleMotorDash
                            key={port}
                            port={port}
                            onUpdate={(config) => handleMotorUpdate(port, config)}
                            configuration={
                                Array.isArray(configuration) 
                                    ? configuration.find(c => c.port === port)
                                    : configuration?.port === port ? configuration : null
                            }
                            isDisconnected={false}
                        />
                    ))}
                    
                    {/* Disconnected but configured motors */}
                    {disconnectedPorts.map((port) => (
                        <SingleMotorDash
                            key={`disconnected-${port}`}
                            port={port}
                            onUpdate={(config) => handleMotorUpdate(port, config)}
                            configuration={
                                Array.isArray(configuration)
                                    ? configuration.find(c => c.port === port)
                                    : configuration?.port === port ? configuration : null
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