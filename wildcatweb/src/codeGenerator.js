/**
 * @file codeGenerator.js
 * @description Utility for generating Python code from slot configurations
 * that will be executed on the robot, updated for the new motor speed model.
 */

import { validateSpeed, getMotorDescription } from "./motorSpeedUtils";

/**
 * Generates Python code from slot configurations
 *
 * @param {Array} slots - Array of slot configurations
 * @param {Object} portStates - Current port connection states
 * @returns {string} Generated Python code
 */
const generatePythonCode = (slots, portStates = {}) => {
    // Generate imports
    let code = [
        "import runloop",
        "import time",
        "from hub import port",
        "import motor",
        "",
        "async def main():",
    ];

    // Generate code for each slot
    slots.forEach((slot, index) => {
        if (!slot || !slot.type) return; // Skip empty slots

        // Add indentation for the main function
        const indent = "    ";
        let slotCode = [];

        if (slot.type === "action" && slot.subtype === "motor") {
            // Handle both single motor config and multiple motor configs
            const configs = Array.isArray(slot.configuration)
                ? slot.configuration
                : [slot.configuration];

            // Process each motor configuration
            configs.forEach((config) => {
                if (!config || !config.port) return;

                const portLetter = config.port;
                const speed = validateSpeed(config.speed);

                // Check if motor is currently connected
                if (portStates && !portStates[portLetter]) {
                    slotCode.push(
                        `${indent}# Motor ${portLetter} is disconnected`,
                    );
                    slotCode.push(
                        `${indent}pass  # Skipping command for disconnected motor`,
                    );
                    return;
                }

                // Generate code based on speed value
                if (speed === 0) {
                    // Stop the motor
                    slotCode.push(`${indent}motor.stop(port.${portLetter})`);
                } else {
                    // Run the motor at the specified speed
                    slotCode.push(
                        `${indent}motor.run(port.${portLetter}, ${speed})`,
                    );
                }
            });
        } else if (slot.type === "input" && slot.subtype === "time") {
            const config = slot.configuration || {};
            const milliseconds = Math.max(0, (config.seconds || 1) * 1000); // Convert seconds to milliseconds, ensure non-negative
            slotCode.push(`${indent}await runloop.sleep_ms(${milliseconds})`);
        }

        // Add comment to indicate which slot this code belongs to
        if (slotCode.length > 0) {
            code.push(`${indent}# Slot ${index + 1}`);
            code = code.concat(slotCode);
        }
    });

    // Add the runloop execution
    code.push("");
    code.push("runloop.run(main())");

    return code.join("\n");
};

/**
 * Generates Python code for a single slot
 * Useful for testing individual instructions
 *
 * @param {Object} slot - Slot configuration
 * @param {Object} portStates - Current port connection states
 * @returns {string} Generated Python code
 */
const generateSlotCode = (slot, portStates = {}) => {
    return generatePythonCode([slot], portStates);
};

export { generatePythonCode, generateSlotCode };
