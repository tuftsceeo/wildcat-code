import React, { useState } from 'react';
import styles from './BluetoothUI.module.css';
import bluetoothDefault from './assets/bluetooth-med.svg';
import bluetoothConnected from './assets/bluetooth-connected-correct.svg';
import settings from './assets/settings.svg';
import questionMark from './assets/question-mark.svg';
import { CustomizationPage } from './CustomizationPage';
import axios from 'axios';

export const BluetoothUI = () => {
    const [currentSvg, setCurrentSvg] = useState(true);
    const [showCustomizationPage, setShowCustomizationPage] = useState(false);

    const handleSvgChange = async () => {
        try {
            // Send a POST request to connect to Bluetooth 
            // THIS IS WHERE THE COMMUNICATION WITH THE BACKEND OCCURS
            const response = await axios.post('http://localhost:8000/ble-connect');
            console.log(response.data);
            setCurrentSvg(!currentSvg);
        } catch (error) {
            console.error('There was an error connecting to Bluetooth!', error);
        }
    };

    const handleSettingsClick = () => {
        setShowCustomizationPage(true);
    };

    const handleButtonClick = (message) => {
        console.log(message);
    };

    const closeCustomizationPage = () => {
        setShowCustomizationPage(false);
    };

    return (
        <>
            <div className={styles.menu}>
                <button className={styles.connectButton} 
                onClick={() => handleSvgChange()}>
                    <img src={currentSvg ? bluetoothDefault : bluetoothConnected} alt="Bluetooth Icon" />
                </button>
                <button className={styles.settingsButton} onClick={handleSettingsClick}>
                    <img src={settings} alt="Settings Icon" />
                </button>
                <button className={styles.helpButton}>
                    <img src={questionMark} alt="Help Icon" />
                </button>
            </div>
            {showCustomizationPage && <CustomizationPage close={closeCustomizationPage} />}
        </>
    );
};



