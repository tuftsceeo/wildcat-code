import React, { useState } from 'react';
import styles from './BluetoothUI.module.css';
import bluetoothDefault from './assets/bluetooth-default.svg';
import bluetoothConnected from './assets/bluetooth-connected.svg';

export const BluetoothUI = () => {
    const [currentSvg, setCurrentSvg] = useState(true);

    const handleSvgChange = (newSvg) => {
        setCurrentSvg(!currentSvg);
        };


	const handleButtonClick = (message) => {
        console.log(message);
	  };

  	return (
        <button className={styles.connectButton} 
        onClick={() => handleSvgChange(bluetoothConnected)}>
            <img src={currentSvg ? bluetoothDefault : bluetoothConnected} alt="Bluetooth Icon" />
        </button>

    );
};