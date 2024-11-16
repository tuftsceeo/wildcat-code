import React, { useState, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import { useKnobContext } from "../KnobContext.js";
import styles from "./MotorDash.module.css";
import Knob from "./Knob.js";
import dragDots from "./assets/drag-indicator.svg";
import highPop from "./assets/bubble-sound.mp3";

// Define the type of the draggable item
const ItemType = {
    MOTOR_DASH: "motorDash",
};

export const MotorDash = ({ port }) => {
    const { knobAngles, setKnobAngle } = useKnobContext();
    const [knobAngle, setKnobAngleLocal] = useState(0);
    const [selectedButton, setSelectedButton] = useState(null); // State to track selected button
    const selectedButtonRef = useRef(selectedButton);
    useEffect(() => {
        setKnobAngleLocal(knobAngles[port] || 0);
    }, [knobAngles, port]);

    useEffect(() => {
        selectedButtonRef.current = selectedButton; // Update the ref whenever currentColor changes
        console.log("Updated color sensor: " + selectedButton);
    }, [selectedButton]);

    // Use the useDrag hook to make this component draggable
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: ItemType.MOTOR_DASH,
            item: {
                type: ItemType.MOTOR_DASH,
                port,
                knobAngle: knobAngles[port] || 0,
                selectedButtonRef,
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [knobAngles, port]
    );

    const handleAngleChange = (newAngle) => {
        setKnobAngle(port, newAngle);
    };

    const handleButtonClick = (buttonType) => {
        const audio = new Audio(highPop);
        audio.play();
        setSelectedButton(buttonType);
    };

    return (
        <div
            ref={drag}
            className={styles.motorGroup}
            style={{ opacity: isDragging ? 0.5 : 1 }} // Change the opacity while dragging
        >
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
            <img
                src={dragDots}
                className={styles.dragDots}
                alt="drag indicator"
            />
        </div>
    );
};

export default MotorDash;
