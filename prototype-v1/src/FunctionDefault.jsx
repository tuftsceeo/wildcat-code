import styles from './FunctionDefault.module.css';
import { ReactComponent as HubConnectIcon } from './assets/hub-connect.svg';


export const FunctionDefault = () => {
  	return (
    		 <div className={styles.componentWrapper}>
      			<div className={styles.actionSenseSection}>
          			<div className={styles.functionHubText}>function hub</div>
                      <div className={styles.hubTopBackground}/>
                        <div className={styles.actionSenseButtonGroup}>
        				    <div className={styles.actionButton}>
          					    <button className={styles.actionButtonChild}> ACTION </button>
        				    </div>
        				    <div className={styles.senseButton}>
          					    <button className={styles.actionButtonChild}> SENSE </button> 
        				    </div>
                            </div>
      		</div>
            
      		    <div className={styles.hubBottomIcon}  />
                  <HubConnectIcon className="hubConnectIcon" />
                </div>
            );
};


