/**
 * @file RunMenu.jsx
 * @description Side panel for navigating and executing code, with support for
 * running individual slots or the complete program.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

import React from "react";
import styles from "./RunMenu.module.css";
import { generatePythonCode } from "./codeGenerator.js";
import { useBLE } from "./BLEContext";
import { Buffer } from "buffer";
import { ClearSlotRequest, ClearSlotResponse } from "./ble_resources/messages";
import { AlertTriangle, AlertOctagon } from "lucide-react";

export const RunMenu = ({
    pyCode,
    canRun,
    currSlotNumber,
    setCurrSlotNumber,
    missionSteps,
    slotData,
}) => {
    const { ble, isConnected, portStates } = useBLE();

    // Check for disconnected motors in configurations
    const checkDisconnectedMotors = (slots) => {
        const disconnectedPorts = [];
        slots.forEach((slot, index) => {
            if (slot?.type === "action" && slot?.subtype === "motor") {
                const configs = Array.isArray(slot.configuration)
                    ? slot.configuration
                    : [slot.configuration];

                configs.forEach((config) => {
                    if (config?.port && !portStates[config.port]) {
                        disconnectedPorts.push({
                            slot: index + 1,
                            port: config.port,
                        });
                    }
                });
            }
        });
        return disconnectedPorts;
    };

    const handleRunCurrentSlot = async () => {
        try {
            if (!isConnected) {
                console.warn(
                    "Robot not connected. Please connect via Bluetooth first.",
                );
                return;
            }

            // Create single-slot array with current slot
            const singleSlot = [slotData[currSlotNumber]];
            const code = generatePythonCode(singleSlot, portStates);
            console.log("Generated Python Code for current slot:", code);

            // Clear the program slot
            const clearResponse = await ble.sendRequest(
                new ClearSlotRequest(0),
                ClearSlotResponse,
            );

            if (!clearResponse.success) {
                console.warn("Failed to clear program slot");
                return;
            }

            // Upload and transfer the program
            await ble.uploadProgramFile(
                "program.py",
                0,
                Buffer.from(code, "utf-8"),
            );

            // Start the program
            await ble.startProgram(0);
        } catch (error) {
            console.error("Error running program:", error);
        }
    };

    const handleRunAllSlots = async () => {
        try {
            if (!isConnected) {
                console.warn(
                    "Robot not connected. Please connect via Bluetooth first.",
                );
                return;
            }

            const code = generatePythonCode(slotData, portStates);
            console.log("Generated Python Code for all slots:", code);

            // Clear the program slot
            const clearResponse = await ble.sendRequest(
                new ClearSlotRequest(0),
                ClearSlotResponse,
            );

            if (!clearResponse.success) {
                console.warn("Failed to clear program slot");
                return;
            }

            // Upload and transfer the program
            await ble.uploadProgramFile(
                "program.py",
                0,
                Buffer.from(code, "utf-8"),
            );

            // Start the program
            await ble.startProgram(0);
        } catch (error) {
            console.error("Error running program:", error);
        }
    };

    // New handler for clicking on steps
    const handleStepClick = (stepIndex) => {
        setCurrSlotNumber(stepIndex);
    };

    // Check for any disconnected motors in the current configuration
    const disconnectedMotors = checkDisconnectedMotors(slotData);
    const currentSlotDisconnected = checkDisconnectedMotors([
        slotData[currSlotNumber],
    ]);

    return (
        <div className={styles.menuBackground}>
            <div className={styles.menuContent}>
                {/* Title hidden by CSS */}
                <div className={styles.menuTitle}>RUN</div>

                {/* Step buttons - first one green when active, all clickable */}
                <div className={styles.stepsContainer}>
                    {[...Array(missionSteps + 1)].map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.stepButton} ${
                                slotData?.[index]?.type ? styles.configured : ""
                            } ${
                                index === currSlotNumber ? styles.current : ""
                            } ${
                                isConnected &&
                                checkDisconnectedMotors([slotData?.[index]])
                                    .length > 0
                                    ? styles.warning
                                    : ""
                            }`}
                            onClick={() => handleStepClick(index)}
                        >
                            Step {index + 1}
                        </button>
                    ))}
                </div>

                {/* Blue Play button as in FIGMA */}
                <button
                    className={styles.playButton}
                    onClick={handleRunAllSlots}
                    disabled={!canRun || !isConnected}
                >
                    Play
                </button>
            </div>
        </div>
    );
};
