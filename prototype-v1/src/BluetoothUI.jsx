import React, { useState } from 'react';
import styles from './BluetoothUI.module.css';
import bluetoothDefault from './assets/bluetooth-med.svg';
import bluetoothConnected from './assets/bluetooth-connected-correct.svg';
import settings from './assets/settings.svg';
import questionMark from './assets/question-mark.svg';
import { CustomizationPage } from './CustomizationPage';

export const BluetoothUI = () => {
    const [currentSvg, setCurrentSvg] = useState(true);
    const [showCustomizationPage, setShowCustomizationPage] = useState(false);

    const handleSvgChange = (newSvg) => {
        setCurrentSvg(!currentSvg);
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
                onClick={() => handleSvgChange(bluetoothConnected)}>
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



