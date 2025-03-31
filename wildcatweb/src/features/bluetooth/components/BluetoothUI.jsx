/**
 * @file BluetoothUI.jsx
 * @description Bluetooth connection interface with settings button and connection overlay
 * Updated with a mission selector button for easy mode switching
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
import MissionSelector from "../../missions/components/MissionSelector";
import { Rocket } from "lucide-react";

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
    const [showConnectionModal, setShowConnectionModal] = useState(false);
    // State to control the visibility of the mission selector
    const [showMissionSelector, setShowMissionSelector] = useState(false);
    const { ble, isConnected, setIsConnected } = useBLE();

    // Show connection overlay after a delay when disconnected
    useEffect(() => {
        let timer;
        if (!isConnected) {
            // Show overlay after 2 seconds if still disconnected
            timer = setTimeout(() => {
                setShowConnectionModal(true);
            }, 2000);
        } else {
            // Hide overlay when connected
            setShowConnectionModal(false);
        }
        
        return () => {
            // Clean up timer on unmount
            clearTimeout(timer);
        };
    }, [isConnected]);

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
                    setShowConnectionModal(false);
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
     * Handle mission button click to show mission selector
     */
    const handleMissionClick = () => {
        setShowMissionSelector(true);
    };

    /**
     * Handle closing the help dialog
     */
    const closeHelpDialog = () => {
        setShowHelpDialog(false);
    };

    /**
     * Developer escape method for the connection overlay
     * Only used for development/testing
     */
    const devEscapeOverlay = () => {
        console.log("Developer escape activated");
        setShowConnectionModal(false);
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

                {/* Mission selector button */}
                <button
                    className={styles.missionButton}
                    onClick={handleMissionClick}
                    aria-label="Open Mission Selector"
                    title="Missions"
                >
                    <div className={styles.iconWrapper}>
                        <Rocket className={styles.missionIcon} />
                    </div>
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
            {showConnectionModal && !isConnected && (
                <BluetoothConnectionOverlay 
                    onConnect={handleBluetoothToggle}
                    onClose={devEscapeOverlay}
                />
            )}
            
            {/* Mission Selector */}
            {showMissionSelector && (
                <MissionSelector
                    isOpen={true}
                    onClose={() => setShowMissionSelector(false)}
                />
            )}
        </>
    );
};

export default BluetoothUI;