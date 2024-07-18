import styles from './MotorDash.module.css';
import { ReactComponent as Speed } from './assets/speed-empty.svg';
import Knob from './Knob.js'


export const MotorDash = () => {
  	return ( 
        <div className={styles.motorGroup}>
            <div className={styles.motorName} > motor A </div>
            <button className={styles.goButton}> GO </button> 
            <Knob className={styles.speedDial} /> 
            <button className={styles.stopButton}> STOP </button>
        </div> 
    );
};
