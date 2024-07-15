import styles from './SensorDash.module.css';
import { ReactComponent as Sensor } from './assets/sensor-empty.svg';
import { ReactComponent as ColorPalette } from './assets/color-palette.svg';

export const SensorDash = () => {
return ( 
    <div classname={styles.sensorGroup}>
        <Sensor classname={styles.sensorIcon} /> 
        <ColorPalette classname={styles.colorPalette} />
    </div>
    
);
};