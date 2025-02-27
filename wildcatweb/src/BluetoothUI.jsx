/**
 * @file BluetoothUI.jsx
 * @description Updated BluetoothUI component with settings button integration
 * @author Claude based on Jennifer Cross's initial implementation
 */

import React, { useState, useEffect } from "react";
import styles from "./BluetoothUI.module.css";
import bluetoothDefault from "./assets/bluetooth-med.svg";
import bluetoothConnected from "./assets/bluetooth-connected-correct.svg";
import settings from "./assets/settings.svg";
import questionMark from "./assets/question-mark.svg";
import CustomizationPage from "./CustomizationPage";
import HelpDialog from "./HelpDialog";
import { useBLE } from "./BLEContext";
import { Settings2 } from "lucide-react";

export const BluetoothUI = ({ currSlotNumber }) => {
    const [showCustomizationPage, setShowCustomizationPage] = useState(false);
    const [showHelpDialog, setShowHelpDialog] = useState(false);

    const { ble, isConnected, setIsConnected } = useBLE();

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

    // Add settings button handler to open CustomizationPage
    const handleSettingsClick = () => {
        setShowCustomizationPage(true);
    };

    const closeCustomizationPage = () => {
        setShowCustomizationPage(false);
    };

    const handleHelpClick = () => {
        setShowHelpDialog(true);
    };

    const closeHelpDialog = () => {
        setShowHelpDialog(false);
    };

    return (
        <>
            <div className={styles.menu}>
                <button
                    className={styles.connectButton}
                    onClick={handleBluetoothToggle}
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
                >
                    <img
                        src={settings}
                        alt="Settings Icon"
                    />
                </button>

                <button
                    className={styles.helpButton}
                    onClick={handleHelpClick}
                >
                    <img
                        src={questionMark}
                        alt="Help Icon"
                    />
                </button>
            </div>

            {/* Render CustomizationPage when settings button is clicked */}
            {showCustomizationPage && (
                <CustomizationPage close={closeCustomizationPage} />
            )}

            {showHelpDialog && (
                <HelpDialog
                    currSlotNumber={currSlotNumber}
                    close={closeHelpDialog}
                />
            )}
        </>
    );
};
