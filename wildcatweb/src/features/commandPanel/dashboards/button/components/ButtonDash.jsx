/**
 * @file ButtonDash.jsx
 * @description Dashboard interface for configuring button instructions (force sensors)
 * with separate visualizations for programmed condition and live sensor state.
 */

import React, { useState, useEffect, useCallback, memo } from "react";
import { useBLE } from "../../../../bluetooth/context/BLEContext";
import { Disc, RefreshCwOff, BluetoothSearching } from "lucide-react";
import styles from "../styles/ButtonDash.module.css";

/**
 * Single button dashboard component with dual state visualization
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.port - Button port (A-F)
 * @param {Function} props.onUpdate - Callback when configuration changes
 * @param {Object} props.configuration - Current configuration for this button
 * @param {boolean} props.isDisconnected - Whether the button is disconnected
 * @param {Function} props.onDismiss - Callback to dismiss a disconnected button
 * @returns {JSX.Element} Single button dashboard
 */
const SingleButtonDash = memo(
    ({ port, onUpdate, configuration, isDisconnected, onDismiss }) => {
        // Initialize state from props or defaults
        const [waitCondition, setWaitCondition] = useState(
            configuration?.waitCondition || "pressed",
        );

        // Get BLE context to access live button state
        const { portStates, DEVICE_TYPES } = useBLE();

        // Update configuration when parameters change
        useEffect(() => {
            if (onUpdate && port) {
                onUpdate({ port, waitCondition });
            }
        }, [port, waitCondition, onUpdate]);

        /**
         * Handle changing the wait condition
         */
        const handleWaitConditionChange = () => {
            setWaitCondition(
                waitCondition === "pressed" ? "released" : "pressed",
            );
        };

        // Get current sensor state if connected
        const getSensorState = () => {
            if (
                isDisconnected ||
                !portStates ||
                !portStates[port] ||
                portStates[port].deviceType !== DEVICE_TYPES.FORCE_SENSOR
            ) {
                return null;
            }

            return portStates[port];
        };

        // Get current sensor state
        const sensorState = getSensorState();
        const isCurrentlyPressed = sensorState?.pressureDetected;

        return (
            <div
                className={`${styles.singleButtonDash} ${
                    isDisconnected ? styles.disconnected : ""
                }`}
                data-port={port}
            >
                {/* Button header */}
                <div className={styles.buttonHeader}>
                    <span className={styles.portLabel}>BUTTON {port}</span>
                    {isDisconnected && (
                        <>
                            <span className={styles.disconnectedLabel}>
                                Disconnected
                            </span>
                            <button
                                className={styles.dismissButton}
                                onClick={() => onDismiss?.(port)}
                                aria-label={`Dismiss disconnected Button ${port}`}
                            >
                                ✕
                            </button>
                        </>
                    )}
                </div>

                {/* Button configuration - split into command and live sections */}
                <div className={styles.buttonControlContainer}>
                    {/* Command section - shows programmed condition */}
                    <div className={styles.commandSection}>
                        <h3 className={styles.waitUntilLabel}>WAIT UNTIL</h3>

                        {/* Wider toggle switch that matches the demo */}
                        <div
                            className={`${styles.toggleContainer} ${
                                waitCondition === "pressed" ? styles.active : ""
                            }`}
                            onClick={handleWaitConditionChange}
                        >
                            <div className={styles.toggleOptions}>
                                <span
                                    className={`${styles.toggleOption} ${styles.left}`}
                                >
                                    RELEASED
                                </span>
                                <span
                                    className={`${styles.toggleOption} ${styles.right}`}
                                >
                                    PRESSED
                                </span>
                            </div>
                            <div className={styles.toggleKnob}></div>
                        </div>

                        {/* Large button visualization for the command (as coded) */}
                        <div className={styles.buttonVisualContainer}>
                            <div className={styles.sensorContainer}>
                                <div className={styles.sensorBody}></div>
                                <div
                                    className={`${styles.sensorButton} ${
                                        waitCondition === "pressed"
                                            ? styles.pressed
                                            : ""
                                    }`}
                                ></div>
                                <div className={styles.sensorMask}></div>
                                <div
                                    className={`${styles.arrowIndicator} ${
                                        waitCondition === "pressed"
                                            ? styles.arrowDown
                                            : styles.arrowUp
                                    }`}
                                ></div>
                            </div>

                            <div className={styles.buttonStatus}>
                                {waitCondition === "pressed"
                                    ? "PRESSED"
                                    : "RELEASED"}
                            </div>
                        </div>
                    </div>

                    {/* Live state section - shows current sensor state */}
                    <div className={styles.liveStateSection}>
                        <div className={styles.sectionHeader}>LIVE</div>

                        {/* Small button visualization for live state */}
                        <div className={styles.buttonVisualContainer}>
                            <div className={styles.liveSensorContainer}>
                                <div className={styles.sensorBodySmall}></div>
                                <div
                                    className={`${styles.sensorButtonSmall} ${
                                        isCurrentlyPressed ? styles.pressed : ""
                                    }`}
                                ></div>
                                <div className={styles.sensorMaskSmall}></div>
                                <div
                                    className={`${styles.arrowIndicatorSmall} ${
                                        isCurrentlyPressed
                                            ? styles.arrowDownSmall
                                            : styles.arrowUpSmall
                                    }`}
                                ></div>
                            </div>

                            <div className={styles.buttonStatus}>
                                {isDisconnected
                                    ? "N/A"
                                    : isCurrentlyPressed
                                    ? "PRESSED"
                                    : "RELEASED"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);

/**
 * Main ButtonDash component that manages all connected buttons
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onUpdate - Callback when configuration changes
 * @param {Object|Array} props.configuration - Current button configuration(s)
 * @param {Array} props.slotData - All slot data for finding configured buttons
 * @returns {JSX.Element} Button dashboard component
 */
export const ButtonDash = ({ onUpdate, configuration, slotData }) => {
    // The rest of the component remains unchanged
    const { portStates, isConnected, DEVICE_TYPES } = useBLE();
    const [dismissedPorts, setDismissedPorts] = useState(new Set());

    // Find all ports with configured buttons from slotData
    const configuredPorts = React.useMemo(() => {
        const configuredSet = new Set();
        if (slotData) {
            Object.values(slotData).forEach((slot) => {
                if (slot?.type === "input" && slot?.subtype === "button") {
                    const config = slot.configuration;
                    if (config?.port) {
                        configuredSet.add(config.port);
                    }
                }
            });
        }
        return configuredSet;
    }, [slotData]);

    // Find connected force sensors
    const connectedForceSensors = React.useMemo(() => {
        const connected = [];

        if (isConnected && portStates) {
            Object.entries(portStates).forEach(([port, state]) => {
                if (state && state.deviceType === DEVICE_TYPES.FORCE_SENSOR) {
                    connected.push(port);
                }
            });
        }

        return connected;
    }, [portStates, isConnected, DEVICE_TYPES]);

    // Find active and disconnected buttons
    const { activeButtons, disconnectedButtons } = React.useMemo(() => {
        const active = {};

        // Find connected buttons
        Object.entries(portStates || {}).forEach(([port, state]) => {
            if (state && state.deviceType === DEVICE_TYPES.FORCE_SENSOR) {
                active[port] = state;
            }
        });

        // Find configured but disconnected buttons
        const disconnected = Array.from(configuredPorts).filter(
            (port) => !active[port] && !dismissedPorts.has(port),
        );

        return { activeButtons: active, disconnectedButtons: disconnected };
    }, [portStates, configuredPorts, dismissedPorts, DEVICE_TYPES]);

    // Memoize the button update handler
    const handleButtonUpdate = useCallback(
        (port, config) => {
            if (!onUpdate) return;

            if (config) {
                onUpdate(config);
            } else {
                onUpdate(null);
            }
        },
        [onUpdate],
    );

    // Handle dismissing a disconnected button
    const handleDismiss = useCallback(
        (port) => {
            // Add to dismissed ports set
            setDismissedPorts((prev) => new Set([...prev, port]));

            // Remove the dismissed port from configuration
            if (onUpdate && configuration) {
                if (configuration?.port === port) {
                    onUpdate(null);
                }
            }
        },
        [configuration, onUpdate],
    );

    return (
        <div className={styles.buttonDashContainer}>
            {!isConnected ? (
                <div className={styles.noConnection}>
                    <BluetoothSearching size={24} />
                    <span>Connect robot first</span>
                </div>
            ) : Object.keys(activeButtons).length === 0 &&
              disconnectedButtons.length === 0 ? (
                <div className={styles.noButtons}>
                    <RefreshCwOff size={24} />
                    <span>Connect a button</span>
                </div>
            ) : (
                <>
                    {/* Connected Buttons */}
                    {Object.keys(activeButtons).map((port) => (
                        <SingleButtonDash
                            key={port}
                            port={port}
                            onUpdate={(config) =>
                                handleButtonUpdate(port, config)
                            }
                            configuration={
                                configuration?.port === port
                                    ? configuration
                                    : null
                            }
                            isDisconnected={false}
                        />
                    ))}

                    {/* Disconnected but configured buttons */}
                    {disconnectedButtons.map((port) => (
                        <SingleButtonDash
                            key={`disconnected-${port}`}
                            port={port}
                            onUpdate={(config) =>
                                handleButtonUpdate(port, config)
                            }
                            configuration={
                                configuration?.port === port
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

export default ButtonDash;
