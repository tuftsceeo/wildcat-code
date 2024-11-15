import styles from "./FunctionDefault.module.css";

import { MotorDash } from "./MotorDash.jsx";
import { SensorDash } from "./SensorDash.jsx";
import React, { useState } from "react";

export const FunctionDefault = () => {
    const [hubState, setHubState] = useState(null);

    const handleButtonClick = (element) => {
        setHubState(element);
    };

    return (
        <>
            <div className={styles.hubTopBackground}>
                <img
                    className={styles.outline}
                    src={require("./assets/outline-function-hub.png")}
                />
                <div className={styles.functionHubText}>function hub</div>
                {hubState === "action" && (
                    <>
                        <MotorDash port="A" />
                        <MotorDash port="B" />
                    </>
                )}
                {hubState === "sense" && <SensorDash />}
                <div className={styles.actionSenseButtonGroup}>
                    <div className={styles.actionButton}>
                        <button
                            disabled={false}
                            className={styles.actionButtonChild}
                            onClick={() => handleButtonClick("action")}
                        >
                            ACTION{" "}
                        </button>
                    </div>
                    <div className={styles.orText}>or</div>
                    <div className={styles.senseButton}>
                        <button
                            disabled={false}
                            className={styles.actionButtonChild}
                            onClick={() => handleButtonClick("sense")}
                        >
                            SENSE{" "}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
