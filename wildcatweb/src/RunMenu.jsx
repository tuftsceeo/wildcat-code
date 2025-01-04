// Import CSS styles and Axios for HTTP requests
import styles from "./RunMenu.module.css";
import { generatePythonCode } from './codeGenerator.js';

// RunMenu component accepts 'pyCode' (the Python code to run) and 'canRun' (whether code can be run)
export const RunMenu = ({ pyCode, canRun, currSlotNumber, missionSteps, slotData }) => {
    // Function to handle "Run" button clicks
    const handleRunCurrentSlot = () => {
        
            // Create single-slot array with current slot
            const singleSlot = [slotData[currSlotNumber]];
            const code = generatePythonCode(singleSlot);
            console.log("Generated Python Code for current slot:", code);
            

        
    };

    // Handle running all slots
    const handleRunAllSlots = () => {
        
            const code = generatePythonCode(slotData);
            console.log("Generated Python Code for all slots:", code);

    };

    return (
        <div className={styles.menuBackground}>
            {/* Vertical slot indicators */}
            <div className={styles.slotIndicators}>
                {[...Array(missionSteps + 1)].map((_, index) => (
                    <div
                        key={index}
                        className={`${styles.indicator} ${
                            slotData?.[index]?.type ? styles.configured : ''
                        } ${index === currSlotNumber ? styles.current : ''}`}
                    />
                ))}
            </div>

            <div className={styles.menuContent}>
                <div>run</div>
                <div className={styles.stepInfo}>
                    Step {currSlotNumber + 1} of {missionSteps + 1}
                </div>
                <div className={styles.buttonGroup}>
                    <button className={styles.runButton} onClick={handleRunCurrentSlot}>
                        This step
                    </button>
                    <button className={styles.runButton} onClick={handleRunAllSlots}>
                        All steps
                    </button>
                </div>
            </div>
        </div>
    );
};