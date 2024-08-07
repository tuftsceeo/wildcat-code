import styles from './RunMenu.module.css';
import axios from 'axios';

export const RunMenu = ({ pyCode, canRun }) => {


	const handleRunClick = async () => {
        if (canRun) {
          try {
            const response = await axios.post('http://localhost:8000/run-code', {
              pyCode: pyCode
            });
            console.log(response.data);
          } catch (error) {
            console.error('There was an error sending the code!', error);
          }
        }
      };

  	return (
        <div className={styles.menuBackground}> 
            run 
        <div className={styles.buttonGroup}>
        <button className={styles.runButton} onClick={() => handleRunClick() }> This step </button>
        <button className={styles.runButton} onClick={() => handleRunClick()}> All steps </button>
        </div>
        </div>

    );
};