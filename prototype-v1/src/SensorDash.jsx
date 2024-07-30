import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
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
import dragDots from './assets/drag-indicator-small.svg';
import { ColorSensorButtons } from './ColorSensorButtons.jsx';
import highPop from './assets/bubble-sound.mp3';

// Define the type of the draggable item
const ItemType = {
  SENSOR_ICON: 'sensorIcon',
};

export const SensorDash = () => {
  const [currentSvg, setCurrentSvg] = useState(colorSensorDefault);
  const [currentColor, setCurrentColor] = useState(null);

  const handleSvgChange = (newSvg, color) => {
    const audio = new Audio(highPop);
    audio.play();
    setCurrentSvg(newSvg);
    setCurrentColor(color);

  };

  useEffect(() => {
    console.log("Updated color sensor: " + currentColor);
  }, [currentColor]);

  // Use the useDrag hook to make the sensorIcon draggable
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.SENSOR_ICON,
    item: { type: ItemType.SENSOR_ICON, currentSvg },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div className={styles.sensorGroup}>
      <div className={styles.colorSensorLabel}>Color Sensor</div>
      <img
        src={currentSvg}
        ref={drag}
        className={styles.sensorIcon}
        alt="Sensor Icon"
        style={{ opacity: isDragging ? 0.5 : 1 }}/> 
      <div className={styles.colorPalette}>
        <ColorSensorButtons color="#FF00FF" onClick={() => handleSvgChange(colorSensorMagenta, "magenta")} />
        <ColorSensorButtons color="#FF0000" onClick={() => handleSvgChange(colorSensorRed, "red")} />
        <ColorSensorButtons color="#FF8000" onClick={() => handleSvgChange(colorSensorOrange, "orange")} />
        <ColorSensorButtons color="#FFFF00" onClick={() => handleSvgChange(colorSensorYellow, "yellow")} />
        <ColorSensorButtons color="#80FF00" onClick={() => handleSvgChange(colorSensorGreen, "green")} />
        <ColorSensorButtons color="#007FFF" onClick={() => handleSvgChange(colorSensorAzure, "azure")} />
        <ColorSensorButtons color="#0000FF" onClick={() => handleSvgChange(colorSensorBlue, "blue")} />
        <ColorSensorButtons color="#00FFEA" onClick={() => handleSvgChange(colorSensorCyan, "cyan")} />
        <ColorSensorButtons color="#8000FF" onClick={() => handleSvgChange(colorSensorPurple, "purple")} />
        <ColorSensorButtons color="#000000" onClick={() => handleSvgChange(colorSensorBlack, "black")} />
        <ColorSensorButtons color="#FFFFFF" onClick={() => handleSvgChange(colorSensorWhite, "white")} />
        <ColorSensorButtons className={styles.noColorButton} onClick={() => handleSvgChange(colorSensorNone, "none")}>
          <img src={require('./assets/no-color-detected.png')} alt="No color detected" />
        </ColorSensorButtons>
      </div>
    </div>
  );
};

