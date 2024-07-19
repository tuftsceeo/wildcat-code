import React, { useState } from 'react';

import styles from './SensorDash.module.css';
import colorSensorDefault from './assets/color-sensor-default.svg';
import colorSensorRed from './assets/color-sensor-red.svg';
import colorSensorOrange from './assets/color-sensor-orange.svg';
import colorSensorYellow from './assets/color-sensor-yellow.svg';
import colorSensorGreen from './assets/color-sensor-green.svg';
import colorSensorAzure from './assets/color-sensor-azure.svg';
import colorSensorBlue from './assets/color-sensor-blue.svg';
import colorSensorCyan from './assets/color-sensor-cyan.svg';
import colorSensorMagenta from './assets/color-sensor-magenta.svg';
import colorSensorPurple from './assets/color-sensor-purple.svg';
import colorSensorBlack from './assets/color-sensor-black.svg';
import colorSensorWhite from './assets/color-sensor-white.svg';
import colorSensorNone from './assets/sensor-no.svg';
import { ColorSensorButtons } from './ColorSensorButtons.jsx';

export const SensorDash = () => {
    const [currentSvg, setCurrentSvg] = useState(colorSensorDefault);

const handleSvgChange = (newSvg) => {
    setCurrentSvg(newSvg);
    };

  return ( 
    <div className={styles.sensorGroup}>
      <div className={styles.colorSensorLabel}> Color Sensor </div> 
      <img src={currentSvg} className={styles.sensorIcon} alt="Sensor Icon" />
      <div className={styles.colorPalette}>
        <ColorSensorButtons color="#FF00FF" onClick={() => handleSvgChange(colorSensorMagenta)} />
        <ColorSensorButtons color="#FF0000" onClick={() => handleSvgChange(colorSensorRed)} />
        <ColorSensorButtons color="#FF8000" onClick={() => handleSvgChange(colorSensorOrange)} />
        <ColorSensorButtons color="#FFFF00" onClick={() => handleSvgChange(colorSensorYellow)} />
        <ColorSensorButtons color="#80FF00" onClick={() => handleSvgChange(colorSensorGreen)} />
        <ColorSensorButtons color="#007FFF" onClick={() => handleSvgChange(colorSensorAzure)} />
        <ColorSensorButtons color="#0000FF" onClick={() => handleSvgChange(colorSensorBlue)} />
        <ColorSensorButtons color="#00FFEA" onClick={() => handleSvgChange(colorSensorCyan)} />
        <ColorSensorButtons color="#8000FF" onClick={() => handleSvgChange(colorSensorPurple)} />
        <ColorSensorButtons color="#000000" onClick={() => handleSvgChange(colorSensorBlack)} />
        <ColorSensorButtons color="#FFFFFF" onClick={() => handleSvgChange(colorSensorWhite)} />
        <ColorSensorButtons className={styles.noColorButton} onClick={() => handleSvgChange(colorSensorNone)}>
          <img src={require('./assets/no-color-detected.png')} alt="No color detected" />
        </ColorSensorButtons>
      </div>
    </div>
  );
};
