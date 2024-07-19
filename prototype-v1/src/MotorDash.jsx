import styles from './MotorDash.module.css';
import Knob from './Knob.js';

export const MotorDash = ({port}) => {
  return (
    <div className={styles.motorGroup}>
      <div className={styles.motorName}>motor {port}</div>
      <div className={styles.speedDial}>
        <Knob />
      </div>
      <div className={styles.buttons}>
        <button className={styles.goButton}>GO</button>
        <button className={styles.stopButton}>STOP</button>
      </div>
    </div>
  );
};

