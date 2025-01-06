// Import necessary modules and assets
import React, { useState } from "react";
import styles from "./BluetoothUI.module.css"; // Import scoped CSS styles for this component
import bluetoothDefault from "./assets/bluetooth-med.svg"; // Default Bluetooth icon
import bluetoothConnected from "./assets/bluetooth-connected-correct.svg"; // Connected Bluetooth icon
import settings from "./assets/settings.svg"; // Settings icon
import questionMark from "./assets/question-mark.svg"; // Help icon
import { CustomizationPage } from "./CustomizationPage"; // Import customization settings component
import axios from "axios"; // Import axios for making HTTP requests
import { newBLE } from "./blu_library"; // Import the BLE library
import HelpDialog from "./HelpDialog"; // Import HelpDialog component

// Define the BluetoothUI component
export const BluetoothUI = ({ currSlotNumber }) => {
    // State to control which Bluetooth icon is displayed (default or connected)
    const [currentSvg, setCurrentSvg] = useState(true);
    // State to control visibility of the CustomizationPage component
    const [showCustomizationPage, setShowCustomizationPage] = useState(false);
    // State to control visibility of the HelpDialog
    const [showHelpDialog, setShowHelpDialog] = useState(false);
    // State to track the connection status
    const [isConnected, setIsConnected] = useState(false);

    // Initialize a BLE instance
    const ble = newBLE();

    // Function to handle Bluetooth connection/disconnection
    const handleBluetoothToggle = async () => {
        if (!isConnected) {
            // Attempt to connect
            const deviceSelected = await ble.ask(""); // Empty string to search for devices
            if (deviceSelected) {
                const connectionSuccess = await ble.connect();
                if (connectionSuccess) {
                    setIsConnected(true);
                    setCurrentSvg(false); // Show connected icon
                } else {
                    console.error("Failed to connect to the Bluetooth device");
                }
            }
        } else {
            // Disconnect from the Bluetooth device
            await ble.disconnect();
            setIsConnected(false);
            setCurrentSvg(true); // Show default icon
        }
    };

    // Function to handle settings button click, showing the customization page
    const handleSettingsClick = () => {
        setShowCustomizationPage(true); // Set state to show the CustomizationPage component
    };

    // Function to close the CustomizationPage
    const closeCustomizationPage = () => {
        setShowCustomizationPage(false); // Set state to hide the CustomizationPage component
    };

    // Function to handle help button click, showing the help dialog
    const handleHelpClick = () => {
        setShowHelpDialog(true); // Set state to show the HelpDialog component
    };

    // Function to close the HelpDialog
    const closeHelpDialog = () => {
        setShowHelpDialog(false); // Set state to hide the HelpDialog component
    };

    // Return the JSX layout for the component
    return (
        <>
            {/* Main menu container with buttons */}
            <div className={styles.menu}>
                {/* Bluetooth Connect/Disconnect Button - toggles icon between default and connected */}
                <button
                    className={styles.connectButton}
                    onClick={handleBluetoothToggle}
                >
                    <img
                        src={currentSvg ? bluetoothDefault : bluetoothConnected}
                        alt="Bluetooth Icon"
                    />
                </button>

                {/* Settings Button - shows customization page */}
                <button
                    className={styles.settingsButton}
                    onClick={handleSettingsClick}
                >
                    <img src={settings} alt="Settings Icon" />
                </button>

                {/* Help Button - shows help dialog */}
                <button className={styles.helpButton} onClick={handleHelpClick}>
                    <img src={questionMark} alt="Help Icon" />
                </button>
            </div>

            {/* Conditionally render CustomizationPage if showCustomizationPage is true */}
            {showCustomizationPage && (
                <CustomizationPage close={closeCustomizationPage} />
            )}

            {/* Conditionally render HelpDialog if showHelpDialog is true */}
            {showHelpDialog && (
                <HelpDialog
                    currSlotNumber={currSlotNumber}
                    close={closeHelpDialog}
                />
            )}
        </>
    );
};
