import styles from './MotorDash.module.css';
import { ReactComponent as Speed } from './assets/speed-empty.svg';


export const MotorDash = () => {
  	return (
        <div className={styles.motorGroup}>
            <div className={styles.motorName} > Motor A </div>
            <button className={styles.goButton}> GO </button>
            <Speed className={styles.speedDial} />
            <button className={styles.stopButton}> STOP </button>
        </div>
            );
};