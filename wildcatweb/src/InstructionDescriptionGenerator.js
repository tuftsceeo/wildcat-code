/**
 * @file InstructionDescriptionGenerator.js
 * @description Utility functions for generating human-readable descriptions of
 * instructions and managing animation properties.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

// InstructionDescriptionGenerator.js

/**
 * Generates a human-readable description of an instruction
 *
 * @param {Object} instruction - The instruction configuration
 * @param {string} instruction.type - Instruction type ('action' or 'input')
 * @param {string} instruction.subtype - Specific subtype ('motor', 'time', etc.)
 * @param {Object} instruction.configuration - Configuration details
 * @returns {string} Human-readable description
 */
export const generateDescription = (instruction) => {
    if (!instruction || !instruction.type) {
        return "Empty slot";
    }

    if (instruction.type === "action" && instruction.subtype === "motor") {
        const config = instruction.configuration || {};

        if (Array.isArray(config) && config.length > 0) {
            const motorConfig = config[0];
            const port = motorConfig.port || "A";
            const direction =
                motorConfig.direction === "backward" ? "backward" : "forward";
            const speed = getSpeedText(motorConfig.speed);

            return `Motor ${port} spins ${direction} at ${speed} speed`;
        } else if (config.port) {
            const port = config.port || "A";
            const direction =
                config.direction === "backward" ? "backward" : "forward";
            const speed = getSpeedText(config.speed);

            return `Motor ${port} spins ${direction} at ${speed} speed`;
        }

        return "Motor action (unconfigured)";
    }

    if (instruction.type === "input" && instruction.subtype === "time") {
        const seconds = instruction.configuration?.seconds || 0;
        return `Wait for ${seconds} second${seconds !== 1 ? "s" : ""}`;
    }

    // Default for unknown instruction types
    return `${instruction.type === "action" ? "Action" : "Input"}: ${
        instruction.subtype || "unknown"
    }`;
};

/**
 * Helper function to convert speed value to descriptive text
 *
 * @param {number} speed - Speed value (0-10000)
 * @returns {string} Speed description (slow, medium, fast)
 */
const getSpeedText = (speed) => {
    if (!speed) return "medium";
    if (speed < 3000) return "slow";
    if (speed > 7000) return "fast";
    return "medium";
};

/**
 * Returns the appropriate CSS class for a given speed
 *
 * @param {number} speed - Speed value (0-10000)
 * @returns {string} CSS class name
 */
export const getSpeedClass = (speed) => {
    if (!speed) return "medium";
    if (speed < 3000) return "slow";
    if (speed > 7000) return "fast";
    return "medium";
};

/**
 * Determines animation duration based on speed setting
 *
 * @param {string} speed - Speed setting (slow, medium, fast)
 * @returns {string} CSS animation duration value
 */
export const getAnimationDuration = (speed) => {
    switch (speed) {
        case "slow":
            return "3s";
        case "medium":
            return "2s";
        case "fast":
            return "1s";
        default:
            return "2s";
    }
};
