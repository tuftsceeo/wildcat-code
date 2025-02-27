/**
 * @file InstructionDescriptionGenerator.js
 * @description Utility functions for generating human-readable descriptions of
 * instructions and managing animation properties, updated for the new motor speed model.
 */

import { getSpeedDescription } from "./motorSpeedUtils";

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
            // Multiple motors
            if (config.length === 1) {
                return getMotorDescription(config[0]);
            } else {
                return `${config.length} motors configured`;
            }
        } else if (config.port) {
            // Single motor
            return getMotorDescription(config);
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
 * Generate a description for a single motor configuration
 *
 * @param {Object} config - Motor configuration
 * @returns {string} Human-readable description
 */
const getMotorDescription = (config) => {
    if (!config || !config.port) return "Motor action (unconfigured)";

    const port = config.port;
    const speed = config.speed || 0;

    if (speed === 0) {
        return `Motor ${port} stopped`;
    }

    const { level, direction } = getSpeedDescription(speed);
    return `Motor ${port} spins ${direction} at ${level} speed`;
};

/**
 * Determines animation duration based on speed value
 *
 * @param {number} speed - Speed value (-1000 to 1000)
 * @returns {string} CSS animation duration
 */
export const getAnimationDuration = (speed) => {
    const absSpeed = Math.abs(speed);

    if (absSpeed === 0) return "0s"; // No animation when stopped
    if (absSpeed <= 330) return "3s"; // Slow
    if (absSpeed <= 660) return "2s"; // Medium
    return "1s"; // Fast
};

/**
 * Get speed class based on numeric value
 *
 * @param {number} speed - Speed value (-1000 to 1000)
 * @returns {string} Speed class (slow, medium, fast)
 */
export const getSpeedClass = (speed) => {
    const absSpeed = Math.abs(speed);

    if (absSpeed === 0) return "stop";
    if (absSpeed <= 330) return "slow";
    if (absSpeed <= 660) return "medium";
    return "fast";
};
