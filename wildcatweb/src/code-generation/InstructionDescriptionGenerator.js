/**
 * @file InstructionDescriptionGenerator.js
 * @description Utility functions for generating human-readable descriptions of
 * instructions using simplified translations from JSON files.
 */

import { getSpeedDescription } from "../features/commandPanel/dashboards/motor/utils/motorSpeedUtils";
import { getTranslatedText, getUIText } from "../translations/loader";

/**
 * Generates a human-readable description of an instruction
 *
 * @param {Object} instruction - The instruction configuration
 * @param {string} language - Language code (defaults to 'en')
 * @param {string} complexityLevel - Text complexity level (defaults to 'intermediate')
 * @param {number} slotNumber - Current slot number for sequencing context (0-based)
 * @returns {string} Human-readable description
 */
export const generateDescription = (
    instruction,
    language = "en",
    complexityLevel = "intermediate",
    slotNumber = 0,
) => {
    if (!instruction || !instruction.type) {
        return "Empty slot";
    }

    // First, check if this is a multi-motor instruction
    if (
        instruction.type === "action" &&
        instruction.subtype === "motor" &&
        Array.isArray(instruction.configuration) &&
        instruction.configuration.length > 1
    ) {
        return generateMultiMotorDescription(
            instruction,
            language,
            complexityLevel,
            slotNumber,
        );
    }

    // Normal single instruction description
    if (instruction.type === "action" && instruction.subtype === "motor") {
        const config = instruction.configuration || {};

        if (Array.isArray(config) && config.length === 1) {
            // Single motor in array
            return generateSingleDescription(
                config[0],
                language,
                complexityLevel,
                slotNumber,
            );
        } else if (config.port) {
            // Single motor configuration
            return generateSingleDescription(
                config,
                language,
                complexityLevel,
                slotNumber,
            );
        }

        return "Motor action (not set up)";
    }

    if (instruction.type === "input" && instruction.subtype === "time") {
        const { seconds = 0 } = instruction.configuration || {};

        // Modify the template key based on whether it's the first slot
        const templateKey = "wait_action";
        let translatedText = getTranslatedText(
            templateKey,
            language,
            complexityLevel,
            { seconds },
        );

        // For text_only and advanced levels, adjust for first slot if needed
        if (
            (complexityLevel === "text_only" ||
                complexityLevel === "advanced") &&
            slotNumber === 0
        ) {
            // Replace "Next" with "First" for the first slot
            translatedText = translatedText.replace(/^Next,|^Then,/i, "First,");
        }

        return translatedText;
    }

    if (instruction.type === "input" && instruction.subtype === "button") {
        const config = instruction.configuration || {};
        const portText = getUIText(`button${config.port || "A"}`, language);
        const condition = getUIText(
            config.waitCondition || "pressed",
            language,
        );

        // Get translated text from the appropriate template
        let translatedText = getTranslatedText(
            "button_action",
            language,
            complexityLevel,
            { port: portText, condition },
        );

        // For text_only and advanced levels, adjust for first slot if needed
        if (
            (complexityLevel === "text_only" ||
                complexityLevel === "advanced") &&
            slotNumber === 0
        ) {
            // Replace "Next" with "First" for the first slot
            translatedText = translatedText.replace(/^Next,|^Then,/i, "First,");
        }

        return translatedText;
    }

    // Default for unknown instruction types
    return `${instruction.type === "action" ? "Action" : "Input"}: ${
        instruction.subtype || "unknown"
    }`;
};

/**
 * Generate a description for a single motor instruction
 *
 * @param {Object} config - Motor configuration
 * @param {string} language - Language code
 * @param {string} complexityLevel - Complexity level ID
 * @param {number} slotNumber - Current slot number (0-based)
 * @returns {string} Human-readable description
 */
function generateSingleDescription(
    config,
    language,
    complexityLevel,
    slotNumber,
) {
    if (!config || !config.port) return "Motor action (not set up)";

    const port = config.port;
    const portText = getUIText(`motor${port}`, language);
    const speed = config.speed || 0;

    if (speed === 0) {
        // Get stop text from the appropriate template
        let translatedText = getTranslatedText(
            "motor_stop",
            language,
            complexityLevel,
            { port: portText },
        );

        // For text_only and advanced levels, adjust for first slot if needed
        if (
            (complexityLevel === "text_only" ||
                complexityLevel === "advanced") &&
            slotNumber === 0
        ) {
            // Replace "Next" with "First" for the first slot
            translatedText = translatedText.replace(/^Next,|^Then,/i, "First,");
        }

        return translatedText;
    }

    const { level, direction } = getSpeedDescription(speed);

    // Get motor action text from the appropriate template
    let translatedText = getTranslatedText(
        "motor_action",
        language,
        complexityLevel,
        {
            port: portText,
            direction,
            speed: level,
        },
    );

    // For text_only and advanced levels, adjust for first slot if needed
    if (
        (complexityLevel === "text_only" || complexityLevel === "advanced") &&
        slotNumber === 0
    ) {
        // Replace "Next" with "First" for the first slot
        translatedText = translatedText.replace(/^Next,|^Then,/i, "First,");
    }

    return translatedText;
}

/**
 * Generate a description for multiple motor instructions
 *
 * @param {Object} instruction - Full instruction object with configuration array
 * @param {string} language - Language code
 * @param {string} complexityLevel - Complexity level ID
 * @param {number} slotNumber - Current slot number (0-based)
 * @returns {string} Combined human-readable description
 */
function generateMultiMotorDescription(
    instruction,
    language,
    complexityLevel,
    slotNumber,
) {
    if (
        !Array.isArray(instruction.configuration) ||
        instruction.configuration.length === 0
    ) {
        return "Motor action (not set up)";
    }

    // Generate descriptions for each motor
    const descriptions = instruction.configuration.map((config, index) => {
        const port = config.port;
        const portText = getUIText(`motor${port}`, language);
        const speed = config.speed || 0;

        // Base description without any connector words
        let description;

        if (speed === 0) {
            // Get base stop text without connector words
            description = getTranslatedText(
                "motor_stop",
                language,
                complexityLevel,
                { port: portText },
            );
        } else {
            // Get base action text without connector words
            const { level, direction } = getSpeedDescription(speed);
            description = getTranslatedText(
                "motor_action",
                language,
                complexityLevel,
                {
                    port: portText,
                    direction,
                    speed: level,
                },
            );
        }

        // Remove leading connectors for all formats
        description = description.replace(/^Next,\s+|^Then,\s+/i, "");

        // For first motor in first slot (index 0, slotNumber 0), add "First," prefix
        if (
            index === 0 &&
            slotNumber === 0 &&
            complexityLevel === "text_only"
        ) {
            // Convert first letter to lowercase after adding "First,"
            description =
                "First, " +
                description.charAt(0).toLowerCase() +
                description.slice(1);
        }
        if (index === 0 && slotNumber > 0 && complexityLevel === "text_only") {
            // Convert first letter to lowercase after adding "First,"
            description =
                "Next, " +
                description.charAt(0).toLowerCase() +
                description.slice(1);
        }

        return description;
    });

    // Join the descriptions differently based on complexity level
    if (complexityLevel === "text_only") {
        // For text_only and advanced, use "while" to join - with first description maintaining case
        if (descriptions.length === 2) {
            // For exactly two motors: "Motor A spins clockwise while Motor B spins countercw."
            const firstDesc = descriptions[0];

            // Convert first letter of second description to lowercase
            const secondDesc =
                descriptions[1].charAt(0).toLowerCase() +
                descriptions[1].slice(1);

            // Remove period from first description if it exists
            const cleanFirstDesc = firstDesc.endsWith(".")
                ? firstDesc.slice(0, -1)
                : firstDesc;

            return `${cleanFirstDesc} while ${secondDesc}`;
        } else {
            // For 3+ motors, use commas and "while" for the last one
            // "Motor A spins clockwise, Motor B spins countercw, while Motor C stops."
            const lastDesc =
                descriptions[descriptions.length - 1].charAt(0).toLowerCase() +
                descriptions[descriptions.length - 1].slice(1);

            // Remove periods from all but the last description
            const firstDescriptions = descriptions
                .slice(0, -1)
                .map((desc) => (desc.endsWith(".") ? desc.slice(0, -1) : desc));

            return `${firstDescriptions.join(", ")} while ${lastDesc}`;
        }
    }
    if (complexityLevel === "advanced" || complexityLevel === "intermediate") {
        return descriptions.join(" ");
    } else {
        // For other complexity levels, just join with periods
        return descriptions.join(". ");
    }
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
