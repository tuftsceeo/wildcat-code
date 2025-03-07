/**
 * @file InstructionDescriptionGenerator.js
 * @description Utility functions for generating human-readable descriptions of
 * instructions using simplified translations from JSON files.
 */

import { getSpeedDescription } from "./motorSpeedUtils";
import { getTranslatedText, getUIText } from "./translations/loader";

/**
 * Generates a human-readable description of an instruction
 *
 * @param {Object} instruction - The instruction configuration
 * @param {string} language - Language code (defaults to 'en')
 * @param {string} complexityLevel - Text complexity level (defaults to 'intermediate')
 * @returns {string} Human-readable description
 */
export const generateDescription = (
    instruction,
    language = "en",
    complexityLevel = "intermediate",
) => {
    // Log for debugging
    /* console.log(
        `Generating description with language: ${language}, complexity: ${complexityLevel}`,
    ); */

    if (!instruction || !instruction.type) {
        return "Empty slot";
    }

    if (instruction.type === "action" && instruction.subtype === "motor") {
        const config = instruction.configuration || {};

        if (Array.isArray(config) && config.length > 0) {
            // Multiple motors
            if (config.length === 1) {
                return generateMotorDescription(
                    config[0],
                    language,
                    complexityLevel,
                );
            } else {
                // For multiple motors, use a simpler format
                const count = config.length;
                return language === "es"
                    ? `${count} motores configurados`
                    : `${count} motors set up`;
            }
        } else if (config.port) {
            // Single motor
            return generateMotorDescription(config, language, complexityLevel);
        }

        return "Motor action (not set up)";
    }

    if (instruction.type === "input" && instruction.subtype === "time") {
        const { seconds = 0 } = instruction.configuration || {};

        // Get translated text from the appropriate template
        const translatedText = getTranslatedText(
            "wait_action",
            language,
            complexityLevel,
            { seconds },
        );

        // console.log("Generated wait text:", translatedText);
        return translatedText;
    }

    if (instruction.type === "input" && instruction.subtype === "button") {
        const config = instruction.configuration || {};
        const portText = getUIText(`button${config.port || "A"}`, language);
        const condition = getUIText(config.waitCondition || "pressed", language);
        
        // Get translated text from the appropriate template
        const translatedText = getTranslatedText(
            "button_action",
            language,
            complexityLevel,
            { port: portText, condition }
        );
        
        //console.log("Generated button text:", translatedText);
        return translatedText;
    }
    // Default for unknown instruction types
    return `${instruction.type === "action" ? "Action" : "Input"}: ${
        instruction.subtype || "unknown"
    }`;
};

/**
 * Generate a description for a motor instruction
 *
 * @param {Object} config - Motor configuration
 * @param {string} language - Language code
 * @param {string} complexityLevel - Complexity level ID
 * @returns {string} Human-readable description
 */
function generateMotorDescription(config, language, complexityLevel) {
    if (!config || !config.port) return "Motor action (not set up)";

    const port = config.port;
    const portText = getUIText(`motor${port}`, language);
    const speed = config.speed || 0;

    if (speed === 0) {
        // Get stop text from the appropriate template
        const translatedText = getTranslatedText(
            "motor_stop",
            language,
            complexityLevel,
            { port: portText },
        );

       // console.log("Generated motor stop text:", translatedText);
        return translatedText;
    }

    const { level, direction } = getSpeedDescription(speed);

    // Get motor action text from the appropriate template
    const translatedText = getTranslatedText(
        "motor_action",
        language,
        complexityLevel,
        {
            port: portText,
            direction,
            speed: level,
        },
    );

    //console.log("Generated motor action text:", translatedText);
    return translatedText;
}

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
