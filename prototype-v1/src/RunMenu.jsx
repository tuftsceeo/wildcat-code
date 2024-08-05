import styles from './RunMenu.module.css';

export const RunMenu = ({ pyCode, canRun }) => {


	const handleButtonClick = (message) => {
        if (canRun) {
            console.log(`Running ${message}: ${pyCode}`);
          } else {
            console.log("Cannot run. Not finished with task.");
          }
	  };

  	return (
        <div className={styles.menuBackground}> 
            run 
        <div className={styles.buttonGroup}>
        <button className={styles.runButton} onClick={() => handleButtonClick('this step') }> This step </button>
        <button className={styles.runButton} onClick={() => handleButtonClick('all steps')}> All steps </button>
        </div>
        </div>

    );
};