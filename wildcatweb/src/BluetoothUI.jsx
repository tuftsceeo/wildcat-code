/**
 * @file BluetoothUI.jsx
 * @description Bluetooth connection interface with settings button
 */

import React, { useState } from "react";
import styles from "./BluetoothUI.module.css";
import bluetoothDefault from "./assets/bluetooth-med.svg";
import bluetoothConnected from "./assets/bluetooth-connected-correct.svg";
import settings from "./assets/settings.svg";
import questionMark from "./assets/question-mark.svg";
import HelpDialog from "./HelpDialog";
import { useBLE } from "./BLEContext";

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
    const { ble, isConnected, setIsConnected } = useBLE();

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
        </>
    );
};

export default BluetoothUI;
