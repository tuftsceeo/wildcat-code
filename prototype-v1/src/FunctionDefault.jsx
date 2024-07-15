import styles from './FunctionDefault.module.css';
import { ReactComponent as HubConnectIcon } from './assets/hub-connect.svg';
import { MotorDash } from './MotorDash.jsx';
import { SensorDash } from './SensorDash.jsx'


export const FunctionDefault = () => {
  	return (
    		 <div className={styles.componentWrapper}>
				<div className={styles.hubBottomIcon}>
				</div>
				<MotorDash />
      			<div className={styles.actionSenseSection}>
          			<div className={styles.functionHubText}>function hub</div>
                      <div className={styles.hubTopBackground}>
					  	<HubConnectIcon className={styles.hubConnectIcon} />
						</div>
                        <div className={styles.actionSenseButtonGroup}>
        				    <div className={styles.actionButton}>
          					    <button className={styles.actionButtonChild}> ACTION </button>
        				    </div>
        				    <div className={styles.senseButton}>
          					    <button className={styles.actionButtonChild}> SENSE </button> 
        				    </div>
                            </div>
      				</div>
            	</div>
            );
};


