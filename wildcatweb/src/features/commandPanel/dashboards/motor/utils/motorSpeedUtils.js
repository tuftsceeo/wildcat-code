/**
 * @file motorSpeedUtils.js
 * @description Consolidated utility functions for handling motor speeds, including mapping between
 * numeric values and descriptive terms, and slider position calculations.
 */

// Speed thresholds and limits
export const SPEED_CONSTANTS = {
    MAX_SPEED: 1000,
    MEDIUM_THRESHOLD: 660,
    SLOW_THRESHOLD: 330,
    MIN_SPEED: 0,
};

/**
 * Predefined speed values for the 7-position slider
 */
export const SPEED_PRESETS = {
    FAST_BACKWARD: -SPEED_CONSTANTS.MAX_SPEED,
    MEDIUM_BACKWARD: -SPEED_CONSTANTS.MEDIUM_THRESHOLD,
    SLOW_BACKWARD: -SPEED_CONSTANTS.SLOW_THRESHOLD,
    STOP: SPEED_CONSTANTS.MIN_SPEED,
    SLOW_FORWARD: SPEED_CONSTANTS.SLOW_THRESHOLD,
    MEDIUM_FORWARD: SPEED_CONSTANTS.MEDIUM_THRESHOLD,
    FAST_FORWARD: SPEED_CONSTANTS.MAX_SPEED,
};

/**
 * Maps a numeric speed value to a descriptive term and direction
 *
 * @param {number} speed - Speed value (-1000 to 1000)
 * @returns {Object} Object with descriptive level and direction
 */
export const getSpeedDescription = (speed) => {
    // Validate and clamp speed value
    const clampedSpeed = Math.max(
        -SPEED_CONSTANTS.MAX_SPEED,
        Math.min(SPEED_CONSTANTS.MAX_SPEED, speed || 0),
    );

    const absSpeed = Math.abs(clampedSpeed);
    const direction =
        clampedSpeed < 0 ? "countercw" : clampedSpeed > 0 ? "clockwise" : "stop";

    let level;
    if (clampedSpeed === 0) {
        level = "stop";
    } else if (absSpeed <= SPEED_CONSTANTS.SLOW_THRESHOLD) {
        level = "slow";
    } else if (absSpeed <= SPEED_CONSTANTS.MEDIUM_THRESHOLD) {
        level = "medium";
    } else {
        level = "fast";
    }

    return { level, direction };
};

/**
 * Get a human-readable description of a motor configuration
 *
 * @param {Object} config - Motor configuration
 * @returns {string} Human-readable description
 */
export const getMotorDescription = (config) => {
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
 * Maps a descriptive speed level and direction to a numeric value
 *
 * @param {string} level - Speed level ('slow', 'medium', 'fast', 'stop')
 * @param {string} direction - Direction ('clockwise', 'countercw', 'stop')
 * @returns {number} Numeric speed value
 */
export const getSpeedValue = (level, direction) => {
    if (level === "stop" || direction === "stop") {
        return SPEED_PRESETS.STOP;
    }

    const directionMultiplier = direction === "countercw" ? -1 : 1;

    switch (level) {
        case "slow":
            return directionMultiplier * SPEED_CONSTANTS.SLOW_THRESHOLD;
        case "medium":
            return directionMultiplier * SPEED_CONSTANTS.MEDIUM_THRESHOLD;
        case "fast":
            return directionMultiplier * SPEED_CONSTANTS.MAX_SPEED;
        default:
            return 0;
    }
};

/**
 * Maps a slider position (0-6) to a speed value
 *
 * @param {number} position - Slider position (0-6)
 * @returns {number} Corresponding speed value
 */
export const sliderPositionToSpeed = (position) => {
    // Validate position to ensure it's in range
    const clampedPosition = Math.max(0, Math.min(6, position));

    switch (clampedPosition) {
        case 0:
            return SPEED_PRESETS.FAST_BACKWARD;
        case 1:
            return SPEED_PRESETS.MEDIUM_BACKWARD;
        case 2:
            return SPEED_PRESETS.SLOW_BACKWARD;
        case 3:
            return SPEED_PRESETS.STOP;
        case 4:
            return SPEED_PRESETS.SLOW_FORWARD;
        case 5:
            return SPEED_PRESETS.MEDIUM_FORWARD;
        case 6:
            return SPEED_PRESETS.FAST_FORWARD;
        default:
            return SPEED_PRESETS.STOP;
    }
};

/**
 * Maps a speed value to the closest slider position (0-6)
 *
 * @param {number} speed - Speed value (-1000 to 1000)
 * @returns {number} Closest slider position
 */
export const speedToSliderPosition = (speed) => {
    // Validate and clamp speed value
    const clampedSpeed = Math.max(
        -SPEED_CONSTANTS.MAX_SPEED,
        Math.min(SPEED_CONSTANTS.MAX_SPEED, speed || 0),
    );

    // Calculate threshold boundaries for mapping to positions
    const boundary1 =
        (SPEED_PRESETS.FAST_BACKWARD + SPEED_PRESETS.MEDIUM_BACKWARD) / 2;
    const boundary2 =
        (SPEED_PRESETS.MEDIUM_BACKWARD + SPEED_PRESETS.SLOW_BACKWARD) / 2;
    const boundary3 = (SPEED_PRESETS.SLOW_BACKWARD + SPEED_PRESETS.STOP) / 2;
    const boundary4 = (SPEED_PRESETS.STOP + SPEED_PRESETS.SLOW_FORWARD) / 2;
    const boundary5 =
        (SPEED_PRESETS.SLOW_FORWARD + SPEED_PRESETS.MEDIUM_FORWARD) / 2;
    const boundary6 =
        (SPEED_PRESETS.MEDIUM_FORWARD + SPEED_PRESETS.FAST_FORWARD) / 2;

    if (clampedSpeed <= boundary1) return 0;
    if (clampedSpeed <= boundary2) return 1;
    if (clampedSpeed <= boundary3) return 2;
    if (clampedSpeed <= boundary4) return 3;
    if (clampedSpeed <= boundary5) return 4;
    if (clampedSpeed <= boundary6) return 5;
    return 6;
};

/**
 * Gets the animation duration for a given speed value
 *
 * @param {number} speed - Speed value (-1000 to 1000)
 * @returns {string} CSS animation duration
 */
export const getAnimationDuration = (speed) => {
    // Validate and clamp speed value
    const clampedSpeed = Math.max(
        -SPEED_CONSTANTS.MAX_SPEED,
        Math.min(SPEED_CONSTANTS.MAX_SPEED, speed || 0),
    );
    const absSpeed = Math.abs(clampedSpeed);

    if (absSpeed === 0) return "0s"; // No animation when stopped
    if (absSpeed <= SPEED_CONSTANTS.SLOW_THRESHOLD) return "3s"; // Slow
    if (absSpeed <= SPEED_CONSTANTS.MEDIUM_THRESHOLD) return "2s"; // Medium
    return "1s"; // Fast
};

/**
 * Get speed class based on numeric value
 *
 * @param {number} speed - Speed value (-1000 to 1000)
 * @returns {string} Speed class (slow, medium, fast, stop)
 */
export const getSpeedClass = (speed) => {
    const { level } = getSpeedDescription(speed);
    return level;
};

/**
 * Determines if a speed value represents rotation in the clockwise direction
 * Note: This depends on how your motor is mounted, adjust logic if needed
 *
 * @param {number} speed - Speed value (-1000 to 1000)
 * @returns {boolean} True if clockwise, false if counterclockwise
 */
export const isClockwise = (speed) => speed > 0;

/**
 * Validates a speed value and ensures it's within acceptable range
 *
 * @param {number} speed - Speed value to validate
 * @returns {number} Validated and clamped speed value
 */
export const validateSpeed = (speed) => {
    // Convert to number if it's not already
    const numericSpeed = Number(speed) || 0;

    // Clamp to the acceptable range
    return Math.max(
        -SPEED_CONSTANTS.MAX_SPEED,
        Math.min(SPEED_CONSTANTS.MAX_SPEED, numericSpeed),
    );
};

/**
 * Generates a human-readable description of an instruction
 *
 * @param {Object} instruction - The instruction configuration
 * @param {string} instruction.type - Instruction type ('action' or 'input')
 * @param {string} instruction.subtype - Specific subtype ('motor', 'time', etc.)
 * @param {Object} instruction.configuration - Configuration details
 * @returns {string} Human-readable description
 */
export const generateInstructionDescription = (instruction) => {
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
