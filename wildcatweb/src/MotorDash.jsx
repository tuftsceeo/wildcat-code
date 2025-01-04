import React, { useState, useEffect } from "react";
import { useKnobContext } from "./KnobContext.js";
import styles from "./MotorDash.module.css";
import Knob from "./Knob.js";

export const MotorDash = ({ onUpdate, configuration, port = 'A' }) => {
    const { knobAngles, setKnobAngle } = useKnobContext();
    const [selectedButton, setSelectedButton] = useState(configuration?.buttonType || null);
    const [knobAngle, setKnobAngleLocal] = useState(configuration?.knobAngle || 0);

    // Handle knob angle changes
    useEffect(() => {
        setKnobAngleLocal(knobAngles[port] || 0);
    }, [knobAngles, port]);

    // Update parent only when configuration actually changes
    useEffect(() => {
        if (selectedButton && knobAngle !== undefined) {
            onUpdate({
                port,
                buttonType: selectedButton,
                knobAngle: knobAngle
            });
        }
    }, [selectedButton, knobAngle, port]);

    const handleAngleChange = (newAngle) => {
        setKnobAngle(port, newAngle);
    };

    const handleButtonClick = (buttonType) => {
        setSelectedButton(buttonType === selectedButton ? null : buttonType);
    };

    return (
        <div className={styles.motorGroup}>
            <div className={styles.motorName}>motor {port}</div>
            <div className={styles.speedDial}>
                <Knob onAngleChange={handleAngleChange} />
            </div>
            <div className={styles.buttons}>
                <button
                    className={`${styles.goButton} ${
                        selectedButton === "GO" ? styles.active : ""
                    }`}
                    onClick={() => handleButtonClick("GO")}
                >
                    GO
                </button>
                <button
                    className={`${styles.stopButton} ${
                        selectedButton === "STOP" ? styles.active : ""
                    }`}
                    onClick={() => handleButtonClick("STOP")}
                >
                    STOP
                </button>
            </div>
        </div>
    );
};

export default MotorDash;