// Import CSS styles and Axios for HTTP requests
import styles from "./RunMenu.module.css";
import axios from "axios";
import React, { useContext } from "react";
import { AppContext } from "./AppContext";

// RunMenu component accepts 'pyCode' (the Python code to run) and 'canRun' (whether code can be run)
export const RunMenu = () => {
    // Use context to access shared state
    const { currSlotNumber, missionSteps, pyCode, canRun } =
        useContext(AppContext);

    // Function to handle "Run" button clicks
    const handleRunClick = async () => {
        // Check if code is allowed to run (canRun is true)
        if (canRun) {
            try {
                // Send a POST request to the backend with the Python code
                const response = await axios.post(
                    "http://localhost:8000/run-code",
                    {
                        pyCode: pyCode, // Code sent in the request payload
                    },
                );
                console.log(response.data); // Log server response
            } catch (error) {
                // Log any errors during the request
                console.error("There was an error sending the code!", error);
            }
        }
    };

    return (
        <div className={styles.menuBackground}>
            {/* Main menu title */}
            <div>run</div>
            <div className={styles.stepInfo}>
                Step {currSlotNumber + 1} of {missionSteps + 1}
            </div>
            <div className={styles.buttonGroup}>
                {/* Button to run only "This step" */}
                <button
                    className={styles.runButton}
                    onClick={handleRunClick}
                >
                    {" "}
                    This step{" "}
                </button>

                {/* Button to run "All steps" */}
                <button
                    className={styles.runButton}
                    onClick={handleRunClick}
                >
                    {" "}
                    All steps{" "}
                </button>
            </div>
        </div>
    );
};
