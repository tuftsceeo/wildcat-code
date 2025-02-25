import React, { useState } from "react";
import styles from "./CodingTrack.module.css";
//import { ReactComponent as CodeSucker } from "./assets/code-sucker.svg";
import nextStepActive from "./assets/next-step-active.svg";
import prevStepActive from "./assets/prev-step-active.svg";
import nextStepInactive from "./assets/next-step-inactive.svg";
import prevStepInactive from "./assets/prev-step-inactive.svg";

// Motor Animation Component based on motor-demo.tsx
const MotorAnimation = ({
    direction = "forward",
    speed = "fast",
    active = true,
}) => {
    // Calculate animation duration based on speed
    const getDuration = () => {
        switch (speed) {
            case "fast":
                return "1s";
            case "medium":
                return "2s";
            case "slow":
                return "3s";
            default:
                return "1s";
        }
    };

    // Set direction and animation properties
    const animationDuration = getDuration();
    const rotation =
        direction === "forward" ? styles.clockwise : styles.counterclockwise;

    return (
        <div className={styles.motorVisualization}>
            <div className={styles.motorAnimation}>
                {/* Static border */}
                <svg
                    className={styles.motorBorder}
                    viewBox="0 0 100 100"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="var(--color-neon-green)"
                        strokeWidth="2"
                    />
                </svg>

                {/* Rotating motor center */}
                <svg
                    className={`${styles.motorRotor} ${active ? rotation : ""}`}
                    style={{ animationDuration }}
                    viewBox="0 0 100 100"
                >
                    {/* Motor pattern circles */}
                    <circle
                        cx="50"
                        cy="25"
                        r="8"
                        fill="var(--color-neon-green)"
                    />
                    <circle
                        cx="75"
                        cy="50"
                        r="8"
                        fill="var(--color-neon-green)"
                    />
                    <circle
                        cx="50"
                        cy="75"
                        r="8"
                        fill="var(--color-neon-green)"
                    />
                    <circle
                        cx="25"
                        cy="50"
                        r="8"
                        fill="var(--color-neon-green)"
                    />

                    {/* Center hub */}
                    <circle
                        cx="50"
                        cy="50"
                        r="10"
                        fill="var(--color-neon-green)"
                    />
                </svg>
            </div>
            <div className={styles.motorLabel}>MOTOR A</div>
        </div>
    );
};

// Timer visualization component
const TimeVisualization = ({ seconds = 3, active = true }) => {
    return (
        <div className={styles.timerVisualization}>
            <div className={styles.timerIcon}>⏱️</div>
            <div className={styles.timerLabel}>WAIT</div>
            <div className={styles.timerValue}>{seconds}</div>
            <div className={styles.timerUnit}>SECONDS</div>
        </div>
    );
};

const CodingTrackContent = ({
    setPyCode,
    setCanRun,
    currSlotNumber,
    setCurrSlotNumber,
    missionSteps,
    slotData,
}) => {
    // Get descriptive text for slot based on its configuration
    const getSlotDescription = (slot) => {
        if (!slot || !slot.type) return "Empty Slot";

        let description = `${slot.type === "action" ? "Action" : "Input"} - `;

        if (slot.type === "action") {
            if (slot.subtype === "motor") {
                const config = slot.configuration || {};
                let portText = "";
                let commandText = "";

                if (Array.isArray(config) && config.length > 0) {
                    portText = config[0].port || "";
                    commandText = config[0].command || "";
                } else {
                    portText = config.port || "";
                    commandText = config.command || "";
                }

                description += `Motor ${portText} - ${commandText}`;
            }
        } else if (slot.type === "input") {
            if (slot.subtype === "time") {
                const config = slot.configuration || {};
                description += `Wait ${config.seconds || 0} seconds`;
            }
        }

        return description;
    };

    const handleBack = () => {
        setCurrSlotNumber(Math.max(0, currSlotNumber - 1));
    };

    const handleForward = () => {
        setCurrSlotNumber(Math.min(currSlotNumber + 1, missionSteps));
    };

    const isNextButtonDisabled = currSlotNumber >= missionSteps;
    const isPrevButtonDisabled = currSlotNumber <= 0;

    const currentSlot = slotData?.[currSlotNumber];
    const currentSlotDescription = getSlotDescription(currentSlot);

    // Determine which visualization to show
    const isMotorAction =
        currentSlot?.type === "action" && currentSlot?.subtype === "motor";
    const isTimeInput =
        currentSlot?.type === "input" && currentSlot?.subtype === "time";

    // Get configuration details
    const motorDirection = isMotorAction
        ? currentSlot?.configuration?.direction || "forward"
        : "forward";

    const motorSpeed = isMotorAction
        ? getSpeedCategory(currentSlot?.configuration?.speed || 5000)
        : "fast";

    const waitSeconds = isTimeInput
        ? currentSlot?.configuration?.seconds || 3
        : 3;

    // Helper to determine speed category
    function getSpeedCategory(speed) {
        if (speed < 3000) return "slow";
        if (speed > 7000) return "fast";
        return "medium";
    }

    // FIGMA design has a test button
    const handleTest = () => {
        console.log("Testing current slot...");
        // Implement test functionality
    };

    return (
        <div className={styles.trackContainer}>
            <div className={styles.slotDisplay}>
                {/* Show motor animation for motor actions */}
                {isMotorAction && (
                    <MotorAnimation
                        direction={motorDirection}
                        speed={motorSpeed}
                        active={true}
                    />
                )}

                {/* Show timer visualization for time inputs */}
                {isTimeInput && (
                    <TimeVisualization
                        seconds={waitSeconds}
                        active={true}
                    />
                )}

                {/* Down arrow indicator */}
                <svg
                    className={styles.downArrow}
                    viewBox="0 0 24 24"
                >
                    <path d="M7 10L12 15L17 10H7Z" />
                </svg>

                {/* Test button as shown in FIGMA */}
                <button
                    className={styles.testButton}
                    onClick={handleTest}
                >
                    Test
                </button>

                {/* Description at bottom */}
                <div className={styles.slotDescription}>
                    {currentSlotDescription}
                </div>
            </div>

            {/* Hidden navigation buttons (not in FIGMA) but keeping for functionality */}
            <button
                className={styles.nextButton}
                disabled={isNextButtonDisabled}
                onClick={handleForward}
            >
                <img
                    src={
                        isNextButtonDisabled ? nextStepInactive : nextStepActive
                    }
                    alt="next"
                />
            </button>
            <button
                className={styles.prevButton}
                disabled={isPrevButtonDisabled}
                onClick={handleBack}
            >
                <img
                    src={
                        isPrevButtonDisabled ? prevStepInactive : prevStepActive
                    }
                    alt="prev"
                />
            </button>
        </div>
    );
};

const CodingTrack = (props) => {
    return <CodingTrackContent {...props} />;
};

export default CodingTrack;
