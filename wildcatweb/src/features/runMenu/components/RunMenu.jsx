/**
 * @file RunMenu.jsx - FINAL FIX
 * @description Side panel for navigating and executing code, with support for
 * running individual slots or the complete program.
 */

import React, { useEffect } from "react";
import styles from "../styles/RunMenu.module.css";
import { generatePythonCode } from "./codeGenerator.js";
import { useBLE } from "./BLEContext";
import { Buffer } from "buffer";
import {
    ClearSlotRequest,
    ClearSlotResponse,
} from "../../../features/bluetooth/ble_resources/messages";
import { AlertTriangle, AlertOctagon } from "lucide-react";

export const RunMenu = ({
    pyCode,
    canRun,
    currSlotNumber,
    setCurrSlotNumber,
    missionSteps,
    slotData,
}) => {
    console.log("RunMenu: Rendering with missionSteps =", missionSteps);

    const { ble, isConnected, portStates } = useBLE();

    // Log any inconsistencies between missionSteps and slotData length
    useEffect(() => {
        /*    console.log(
            "RunMenu: missionSteps =",
            missionSteps,
            "slotData.length =",
            slotData?.length,
        ); */

        // The slotData array should be exactly missionSteps in length
        // (we're now treating missionSteps as the COUNT of steps, not the max index)
        if (slotData && slotData.length !== missionSteps) {
            console.warn(
                "RunMenu: Inconsistency detected - slotData length doesn't match missionSteps",
            );
        }
    }, [missionSteps, slotData]);

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
        console.log("RunMenu: Clicked on step", stepIndex + 1);
        setCurrSlotNumber(stepIndex);
    };

    // Check for any disconnected motors in the current configuration
    const disconnectedMotors = checkDisconnectedMotors(slotData);
    const currentSlotDisconnected = checkDisconnectedMotors([
        slotData[currSlotNumber],
    ]);

    // Generate buttons for each step (0 to missionSteps-1, inclusive)
    // Note: missionSteps is the COUNT, so we create buttons from 0 to missionSteps-1
    const renderStepButtons = () => {
        console.log("RunMenu: Rendering", missionSteps, "step buttons");

        const buttons = [];
        // Create exactly missionSteps buttons (from 0 to missionSteps-1)
        for (let i = 0; i < missionSteps; i++) {
            // console.log(`RunMenu: Creating button for Step ${i + 1}`);
            buttons.push(
                <button
                    key={i}
                    className={`${styles.stepButton} ${
                        slotData?.[i]?.type ? styles.configured : ""
                    } ${i === currSlotNumber ? styles.current : ""} ${
                        isConnected &&
                        checkDisconnectedMotors([slotData?.[i]]).length > 0
                            ? styles.warning
                            : ""
                    }`}
                    onClick={() => handleStepClick(i)}
                >
                    Step {i + 1}
                </button>,
            );
        }
        return buttons;
    };

    return (
        <div className={styles.menuBackground}>
            <div className={styles.menuContent}>
                {/* Title hidden by CSS */}
                <div className={styles.menuTitle}>RUN</div>

                {/* Step buttons - using our renderStepButtons function */}
                <div className={styles.stepsContainer}>
                    {renderStepButtons()}
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
