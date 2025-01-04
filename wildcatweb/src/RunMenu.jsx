import styles from "./RunMenu.module.css";
import { generatePythonCode } from './codeGenerator.js';
import { useBLE } from "./BLEContext";
import { Buffer } from 'buffer';
import { ClearSlotRequest, ClearSlotResponse } from './ble_resources/messages';

export const RunMenu = ({ pyCode, canRun, currSlotNumber, missionSteps, slotData }) => {
    const { ble, isConnected } = useBLE();

    const handleRunCurrentSlot = async () => {
        try {
            if (!isConnected) {
                console.warn("Robot not connected. Please connect via Bluetooth first.");
                return;
            }

            // Create single-slot array with current slot
            const singleSlot = [slotData[currSlotNumber]];
            const code = generatePythonCode(singleSlot);
            console.log("Generated Python Code for current slot:", code);

            // Clear the program slot
            const clearResponse = await ble.sendRequest(
                new ClearSlotRequest(0),
                ClearSlotResponse
            );
            
            if (!clearResponse.success) {
                console.warn("Failed to clear program slot");
                return;
            }

            // Upload and transfer the program
            await ble.uploadProgramFile("program.py", 0, Buffer.from(code, 'utf-8'));

            // Start the program
            await ble.startProgram(0);
        } catch (error) {
            console.error("Error running program:", error);
        }
    };

    const handleRunAllSlots = async () => {
        try {
            if (!isConnected) {
                console.warn("Robot not connected. Please connect via Bluetooth first.");
                return;
            }

            const code = generatePythonCode(slotData);
            console.log("Generated Python Code for all slots:", code);

            // Clear the program slot
            const clearResponse = await ble.sendRequest(
                new ClearSlotRequest(0),
                ClearSlotResponse
            );
            
            if (!clearResponse.success) {
                console.warn("Failed to clear program slot");
                return;
            }

            // Upload and transfer the program
            await ble.uploadProgramFile("program.py", 0, Buffer.from(code, 'utf-8'));

            // Start the program
            await ble.startProgram(0);
        } catch (error) {
            console.error("Error running program:", error);
        }
    };

    return (
        <div className={styles.menuBackground}>
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
                    <button 
                        className={styles.runButton} 
                        onClick={handleRunCurrentSlot}
                        disabled={!canRun || !isConnected}
                    >
                        This step
                    </button>
                    <button 
                        className={styles.runButton} 
                        onClick={handleRunAllSlots}
                        disabled={!canRun || !isConnected}
                    >
                        All steps
                    </button>
                </div>
            </div>
        </div>
    );
};