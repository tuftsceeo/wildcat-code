import React, { useState, useEffect, useCallback, memo } from "react";
import { useBLE } from "./BLEContext";
import styles from "./MotorDash.module.css";

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
                            setShowSpeedInput(true);
                        }}
                    >
                        SET SPEED: {speed}
                    </button>
                    {showSpeedInput && (
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
    const { portStates, lastUpdate } = useBLE();
    const [dismissedPorts, setDismissedPorts] = useState(new Set());

    // Debug logs
    useEffect(() => {
        console.log('MotorDash Update:');
        console.log('- Port States:', portStates);
        console.log('- Configuration:', configuration);
        console.log('- Slot Data:', slotData);
    }, [portStates, configuration, slotData]);

    // Get active and disconnected ports
    const { activeMotors, disconnectedPorts } = React.useMemo(() => {
        console.log('Recalculating motor states...');
        
        // Get active motors
        const active = {};
        Object.entries(portStates).forEach(([port, state]) => {
            if (state && state.type === 0x30) {
                active[port] = state;
            }
        });

        // Get configured but disconnected ports
        const configuredPorts = new Set();
        if (slotData) {
            Object.values(slotData).forEach(slot => {
                if (slot?.type === 'action' && slot?.subtype === 'motor') {
                    if (Array.isArray(slot.configuration)) {
                        slot.configuration.forEach(config => {
                            if (config.port) configuredPorts.add(config.port);
                        });
                    } else if (slot.configuration?.port) {
                        configuredPorts.add(slot.configuration.port);
                    }
                }
            });
        }

        const disconnected = [...configuredPorts].filter(port => 
            !active[port] && !dismissedPorts.has(port)
        );

        console.log('- Active Motors:', active);
        console.log('- Disconnected Ports:', disconnected);

        return { activeMotors: active, disconnectedPorts: disconnected };
    }, [portStates, slotData, dismissedPorts]);

    // Rest of your component remains the same...
    return (
        <div className={styles.motorDashContainer}>
            {/* Connected Motors */}
            {Object.keys(activeMotors).map((port) => (
                <SingleMotorDash
                    key={port}
                    port={port}
                    onUpdate={(config) => onUpdate(config)}
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
                    onUpdate={(config) => onUpdate(config)}
                    configuration={
                        Array.isArray(configuration)
                            ? configuration.find(c => c.port === port)
                            : configuration?.port === port ? configuration : null
                    }
                    isDisconnected={true}
                    onDismiss={() => setDismissedPorts(prev => new Set([...prev, port]))}
                />
            ))}
            
            {Object.keys(activeMotors).length === 0 && disconnectedPorts.length === 0 && (
                <div className={styles.noMotors}>
                    No motors connected. Please connect a motor to continue.
                </div>
            )}
        </div>
    );
};

export default memo(MotorDash);