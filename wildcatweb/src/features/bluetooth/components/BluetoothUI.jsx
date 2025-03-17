/**
 * @file BluetoothUI.jsx
 * @description Bluetooth connection interface with settings button and connection overlay
 */

import React, { useState, useEffect } from "react";
import styles from "../styles/BluetoothUI.module.css";
import bluetoothDefault from "../../../assets/images/bluetooth-med.svg";
import bluetoothConnected from "../../../assets/images/bluetooth-connected-correct.svg";
import settings from "../../../assets/images/settings.svg";
import questionMark from "../../../assets/images/question-mark.svg";
import HelpDialog from "../../../common/components/HelpDialog";
import { useBLE } from "../../bluetooth/context/BLEContext";
import BluetoothConnectionOverlay from "./BluetoothConnectionOverlay";

/**
 * Interface for Bluetooth connection and settings access
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.currSlotNumber - Current slot number
 * @param {Function} props.openSettings - Callback to open settings panel
 * @returns {JSX.Element} Bluetooth UI component
 */
export const BluetoothUI = ({ currSlotNumber, openSettings }) => {
    const [showHelpDialog, setShowHelpDialog] = useState(false);
    // State to control the visibility of the connection overlay
    const [showConnectionOverlay, setShowConnectionOverlay] = useState(false);
    // State to track if the user has dismissed the overlay
    const [overlayDismissed, setOverlayDismissed] = useState(false);
    const { ble, isConnected, setIsConnected } = useBLE();

    // Show connection overlay after a delay when disconnected
    useEffect(() => {
        let timer;
        if (!isConnected && !overlayDismissed) {
            // Show overlay after 2 seconds if still disconnected
            timer = setTimeout(() => {
                setShowConnectionOverlay(true);
            }, 2000);
        } else {
            // Hide overlay when connected
            setShowConnectionOverlay(false);
            // Reset dismissed state when connected
            if (isConnected) {
                setOverlayDismissed(false);
            }
        }
        
        return () => {
            // Clean up timer on unmount
            clearTimeout(timer);
        };
    }, [isConnected, overlayDismissed]);

    /**
     * Handle Bluetooth connection toggle
     */
    const handleBluetoothToggle = async () => {
        if (!isConnected) {
            const deviceSelected = await ble.ask("");
            if (deviceSelected) {
                const connectionSuccess = await ble.connect();
                if (connectionSuccess) {
                    setIsConnected(true);
                    setShowConnectionOverlay(false);
                } else {
                    console.error("Failed to connect to the Bluetooth device");
                }
            }
        } else {
            await ble.disconnect();
            setIsConnected(false);
        }
    };

    /**
     * Handle settings button click
     */
    const handleSettingsClick = () => {
        if (openSettings) {
            openSettings();
        }
    };

    /**
     * Handle help button click
     */
    const handleHelpClick = () => {
        setShowHelpDialog(true);
    };

    /**
     * Handle closing the help dialog
     */
    const closeHelpDialog = () => {
        setShowHelpDialog(false);
    };

    /**
     * Handle closing the connection overlay
     */
    const closeConnectionOverlay = () => {
        setShowConnectionOverlay(false);
        setOverlayDismissed(true); // Mark as dismissed so it doesn't reappear immediately
    };

    return (
        <>
            <div className={styles.menu}>
                <button
                    className={styles.connectButton}
                    onClick={handleBluetoothToggle}
                    aria-label={
                        isConnected
                            ? "Disconnect Bluetooth"
                            : "Connect Bluetooth"
                    }
                >
                    <img
                        src={
                            isConnected ? bluetoothConnected : bluetoothDefault
                        }
                        alt="Bluetooth Icon"
                    />
                </button>

                <button
                    className={styles.settingsButton}
                    onClick={handleSettingsClick}
                    aria-label="Open Settings"
                >
                    <img
                        src={settings}
                        alt="Settings Icon"
                    />
                </button>

                <button
                    className={styles.helpButton}
                    onClick={handleHelpClick}
                    aria-label="Help"
                >
                    <img
                        src={questionMark}
                        alt="Help Icon"
                    />
                </button>
            </div>

            {showHelpDialog && (
                <HelpDialog
                    currSlotNumber={currSlotNumber}
                    close={closeHelpDialog}
                />
            )}
            
            {/* Bluetooth Connection Overlay */}
            {showConnectionOverlay && !isConnected && (
                <BluetoothConnectionOverlay 
                    onConnect={handleBluetoothToggle}
                    onClose={closeConnectionOverlay}
                />
            )}
        </>
    );
};

export default BluetoothUI;