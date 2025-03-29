/**
 * @file codeGenerator.js
 * @description Utility for generating Python code from slot configurations
 * that will be executed on the robot, with compatibility for both type and deviceType.
 */

import {
    validateSpeed,
    getMotorDescription,
} from "../features/commandPanel/dashboards/motor/utils/motorSpeedUtils";

// Constants for device types - match values in BLEContext.js
const DEVICE_TYPES = {
    MOTOR: 0x30, // 48 in decimal
    FORCE_SENSOR: 0x3c, // 60 in decimal
    COLOR_SENSOR: 0x3d, // 61 in decimal
    DISTANCE_SENSOR: 0x3e, // 62 in decimal
};

/**
 * Safely checks if a device of the specified type is connected to the given port
 *
 * @param {Object} portStates - State of all ports from BLEContext
 * @param {string} portLetter - Port letter (A-F)
 * @param {number} deviceType - Type of device to check for
 * @returns {boolean} Whether the specified device is connected
 */
function isDeviceConnected(portStates, portLetter, deviceType) {
    console.log(
        `Checking device type ${deviceType} on port ${portLetter}:`,
        portStates?.[portLetter],
    );

    // Handle the case where portStates is undefined/null
    if (!portStates) {
        return false;
    }

    // Handle the case where the port doesn't exist in portStates
    if (!portStates[portLetter]) {
        return false;
    }

    // Check both deviceType and type for countercw compatibility
    const state = portStates[portLetter];
    return state.deviceType === deviceType || state.type === deviceType;
}

/**
 * Generates Python code from slot configurations
 *
 * @param {Array} slots - Array of slot configurations
 * @param {Object} portStates - Current port connection states
 * @returns {string} Generated Python code
 */
const generatePythonCode = (slots, portStates = {}) => {
    console.log(
        "generatePythonCode: Starting with slots:",
        JSON.stringify(slots, null, 2),
    );

    // Generate imports
    let code = [
        "import runloop",
        "import time",
        "from hub import port",
        "import motor",
    ];

    // First pass: check if we need force_sensor import
    let needsForceSensorImport = false;
    slots.forEach((slot) => {
        if (slot?.type === "input" && slot?.subtype === "button") {
            needsForceSensorImport = true;
            console.log(
                "generatePythonCode: Force Sensor detected, will add import",
            );
        }
    });

    // Add force_sensor import if needed - BEFORE the main function declaration
    if (needsForceSensorImport) {
        code.push("import force_sensor");
        console.log("generatePythonCode: Added force_sensor import");
    }

    // Add empty line and main function declaration
    code.push("");
    code.push("async def main():");

    // Generate code for each slot
    slots.forEach((slot, index) => {
        if (!slot || !slot.type) {
            console.log(`generatePythonCode: Slot ${index} is empty, skipping`);
            return; // Skip empty slots
        }

        console.log(
            `generatePythonCode: Processing slot ${index + 1}: ${slot.type}/${
                slot.subtype
            }`,
        );

        // Add indentation for the main function
        const indent = "    ";
        let slotCode = [];
        if (slot?.isStopInstruction) return;
        if (slot.type === "action" && slot.subtype === "motor") {
            // Handle both single motor config and multiple motor configs
            const configs = Array.isArray(slot.configuration)
                ? slot.configuration
                : [slot.configuration];

            console.log(
                `generatePythonCode: Motor configs:`,
                JSON.stringify(configs, null, 2),
            );

            // Process each motor configuration
            configs.forEach((config) => {
                if (!config || !config.port) return;

                const portLetter = config.port;
                const speed = validateSpeed(config.speed);

                console.log(
                    `generatePythonCode: Motor ${portLetter} speed: ${speed}`,
                );

                // Check if motor is currently connected - Using device type check
                if (
                    !isDeviceConnected(
                        portStates,
                        portLetter,
                        DEVICE_TYPES.MOTOR,
                    )
                ) {
                    slotCode.push(
                        `${indent}# Motor ${portLetter} is disconnected or not detected`,
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

            console.log(`generatePythonCode: Wait time: ${milliseconds}ms`);
        } else if (slot.type === "input" && slot.subtype === "button") {
            const config = slot.configuration || {};
            const portLetter = config.port || "A";
            const waitCondition = config.waitCondition || "pressed";

            console.log(
                `generatePythonCode: Force Sensor port: ${portLetter}, condition: ${waitCondition}`,
            );

            // Check if force sensor is connected - Using device type check
            if (
                !isDeviceConnected(
                    portStates,
                    portLetter,
                    DEVICE_TYPES.FORCE_SENSOR,
                )
            ) {
                slotCode.push(
                    `${indent}# Force sensor on port ${portLetter} is disconnected or not detected`,
                );
                slotCode.push(
                    `${indent}pass  # Skipping command for disconnected sensor`,
                );
            } else {
                // Generate code based on wait condition
                if (waitCondition === "pressed") {
                    slotCode.push(
                        `${indent}# Wait until force sensor on port ${portLetter} is pressed`,
                    );
                    slotCode.push(
                        `${indent}while not force_sensor.pressed(port.${portLetter}):`,
                    );
                    slotCode.push(`${indent}    await runloop.sleep_ms(50)`);
                } else {
                    slotCode.push(
                        `${indent}# Wait until force sensor on port ${portLetter} is released`,
                    );
                    slotCode.push(
                        `${indent}while force_sensor.pressed(port.${portLetter}):`,
                    );
                    slotCode.push(`${indent}    await runloop.sleep_ms(50)`);
                }
            }
        }

        // Add comment to indicate which slot this code belongs to
        if (slotCode.length > 0) {
            code.push(`${indent}# Slot ${index + 1}`);
            code = code.concat(slotCode);
            console.log(
                `generatePythonCode: Added code for slot ${index + 1}:`,
                slotCode,
            );
        }
    });

    // Add the runloop execution
    code.push("");
    code.push("runloop.run(main())");

    const finalCode = code.join("\n");
    console.log("generatePythonCode: Final code:\n", finalCode);
    return finalCode;
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
    // Generate imports
    let code = [
        "import runloop",
        "import time",
        "from hub import port",
        "import motor",
    ];

    // First pass: check if we need force_sensor import
    let needsForceSensorImport = false;
    if (slot?.type === "input" && slot?.subtype === "button") {
        needsForceSensorImport = true;
        console.log(
            "generatePythonCode: Force Sensor detected, will add import",
        );
    }

    // Add force_sensor import if needed - BEFORE the main function declaration
    if (needsForceSensorImport) {
        code.push("import force_sensor");
        console.log("generatePythonCode: Added force_sensor import");
    }

    // Add empty line and main function declaration
    code.push("");
    code.push("async def main():");

    // Generate code for each slot

    if (!slot || !slot.type) {
        console.log(`generatePythonCode: Slot is empty, skipping`);
        return; // Skip empty slots
    }

    console.log(
        `generatePythonCode: Processing slot: ${slot.type}/${slot.subtype}`,
    );

    // Add indentation for the main function
    const indent = "    ";
    let slotCode = [];

    if (slot.type === "action" && slot.subtype === "motor") {
        // Handle both single motor config and multiple motor configs
        const configs = Array.isArray(slot.configuration)
            ? slot.configuration
            : [slot.configuration];

        console.log(
            `generatePythonCode: Motor configs:`,
            JSON.stringify(configs, null, 2),
        );

        // Process each motor configuration
        configs.forEach((config) => {
            if (!config || !config.port) return;

            const portLetter = config.port;
            const speed = validateSpeed(config.speed);

            console.log(
                `generatePythonCode: Motor ${portLetter} speed: ${speed}`,
            );

            // Check if motor is currently connected - Using device type check
            if (
                !isDeviceConnected(portStates, portLetter, DEVICE_TYPES.MOTOR)
            ) {
                slotCode.push(
                    `${indent}# Motor ${portLetter} is disconnected or not detected`,
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

        console.log(`generatePythonCode: Wait time: ${milliseconds}ms`);
    } else if (slot.type === "input" && slot.subtype === "button") {
        const config = slot.configuration || {};
        const portLetter = config.port || "A";
        const waitCondition = config.waitCondition || "pressed";

        console.log(
            `generatePythonCode: Force Sensor port: ${portLetter}, condition: ${waitCondition}`,
        );

        // Check if force sensor is connected - Using device type check
        if (
            !isDeviceConnected(
                portStates,
                portLetter,
                DEVICE_TYPES.FORCE_SENSOR,
            )
        ) {
            slotCode.push(
                `${indent}# Force sensor on port ${portLetter} is disconnected or not detected`,
            );
            slotCode.push(
                `${indent}pass  # Skipping command for disconnected sensor`,
            );
        } else {
            // Generate code based on wait condition
            if (waitCondition === "pressed") {
                slotCode.push(
                    `${indent}# Wait until force sensor on port ${portLetter} is pressed`,
                );
                slotCode.push(
                    `${indent}while not force_sensor.pressed(port.${portLetter}):`,
                );
                slotCode.push(`${indent}    await runloop.sleep_ms(50)`);
            } else {
                slotCode.push(
                    `${indent}# Wait until force sensor on port ${portLetter} is released`,
                );
                slotCode.push(
                    `${indent}while force_sensor.pressed(port.${portLetter}):`,
                );
                slotCode.push(`${indent}    await runloop.sleep_ms(50)`);
            }
        }
    }

    // Add comment to indicate which slot this code belongs to
    if (slotCode.length > 0) {
        code = code.concat(slotCode);
        console.log(`generatePythonCode: Added code for slot:`, slotCode);
    }
    if (slot.type === "action") {
        code.push(`${indent}await runloop.sleep_ms(500)`);
    }
    // Add the runloop execution
    code.push("");
    code.push("runloop.run(main())");

    const finalCode = code.join("\n");
    console.log("generatePythonCode: Final code:\n", finalCode);

    return finalCode;
};

export { generatePythonCode, generateSlotCode };
