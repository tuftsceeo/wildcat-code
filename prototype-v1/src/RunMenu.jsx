import styles from './RunMenu.module.css';

export const RunMenu = () => {


	const handleButtonClick = (message) => {
        console.log(message);
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