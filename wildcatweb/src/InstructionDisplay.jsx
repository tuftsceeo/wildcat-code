/**
 * @file InstructionDisplay.jsx
 * @description Component that displays instructions with variable text complexity
 * and language support using simplified translations from JSON.
 */

import React from "react";
import { useCustomization } from "./CustomizationContext";
import {
    COMPLEXITY_LEVELS,
    getTranslatedText,
    getUIText,
} from "./translations/loader";
import { getSpeedDescription } from "./motorSpeedUtils";
import {
    Rabbit,
    Turtle,
    Octagon,
    ChevronLeft,
    ChevronRight,
    Clock,
} from "lucide-react";
import styles from "./InstructionDisplay.module.css";

/**
 * Component to display instructions with configurable complexity
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.instruction - Instruction configuration
 * @returns {JSX.Element} Visual instruction display
 */
const InstructionDisplay = ({ instruction }) => {
    // Get current settings from context
    const { readingLevel, language } = useCustomization();

    // Get complexity level configuration
    const complexity =
        COMPLEXITY_LEVELS[readingLevel] || COMPLEXITY_LEVELS.intermediate;

    // Return empty display if no instruction
    if (!instruction || !instruction.type) {
        return (
            <div className={styles.emptyInstruction}>
                <p className={styles.emptyText}>No instruction configured</p>
            </div>
        );
    }

    // Handle different instruction types
    if (instruction.type === "action" && instruction.subtype === "motor") {
        return (
            <MotorInstructionDisplay
                configuration={instruction.configuration}
                complexity={complexity}
                language={language}
            />
        );
    }

    if (instruction.type === "input" && instruction.subtype === "time") {
        return (
            <TimerInstructionDisplay
                configuration={instruction.configuration}
                complexity={complexity}
                language={language}
            />
        );
    }

    // Default for unknown instruction types
    return (
        <div className={styles.unknownInstruction}>
            <p className={styles.unknownText}>
                Unknown instruction type: {instruction.type} -{" "}
                {instruction.subtype}
            </p>
        </div>
    );
};

/**
 * Display for motor instructions
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object|Array} props.configuration - Motor configuration
 * @param {Object} props.complexity - Complexity level configuration
 * @param {string} props.language - Language code
 * @returns {JSX.Element} Motor instruction display
 */
const MotorInstructionDisplay = ({ configuration, complexity, language }) => {
    // Handle array of motor configurations
    if (Array.isArray(configuration) && configuration.length > 0) {
        return (
            <div className={styles.multiMotorContainer}>
                {configuration.map((config, index) => (
                    <SingleMotorDisplay
                        key={`motor-${config.port || index}`}
                        config={config}
                        complexity={complexity}
                        language={language}
                    />
                ))}
            </div>
        );
    }

    // Single motor configuration
    return (
        <SingleMotorDisplay
            config={configuration}
            complexity={complexity}
            language={language}
        />
    );
};

/**
 * Display for a single motor instruction
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.config - Motor configuration
 * @param {Object} props.complexity - Complexity level configuration
 * @param {string} props.language - Language code
 * @returns {JSX.Element} Single motor display
 */
const SingleMotorDisplay = ({ config, complexity, language }) => {
    if (!config || !config.port) return null;

    // Extract configuration
    const { port, speed = 0 } = config;
    const portText = getUIText(`motor${port}`, language);

    // Get speed and direction information
    const { level, direction } = getSpeedDescription(speed);

    // Motor is stopped
    if (speed === 0) {
        // Use the motor_stop template
        const translatedText = getTranslatedText(
            "motor_stop",
            language,
            complexity.id,
            { port: portText },
        );

        return (
            <div className={styles.instructionDisplay}>
                {/* Show icon if not text-only */}
                {complexity.id !== "text_only" && (
                    <div className={styles.iconContainer}>
                        <div
                            className={`${styles.icon} ${
                                styles[getIconSizeClass(complexity)]
                            }`}
                        >
                            <Octagon size={24} />
                        </div>
                    </div>
                )}

                {/* Show text if not icon-only */}
                {complexity.id !== "icon_only" && (
                    <div className={styles.textContainer}>
                        <p className={styles.instructionText}>
                            {translatedText}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // Motor is moving
    const translatedText = getTranslatedText(
        "motor_action",
        language,
        complexity.id,
        {
            port: portText,
            direction: direction,
            speed: level,
        },
    );

    return (
        <div className={styles.instructionDisplay}>
            {/* Show icon if not text-only */}
            {complexity.id !== "text_only" && (
                <div className={styles.iconContainer}>
                    <div
                        className={`${styles.icon} ${
                            styles[getIconSizeClass(complexity)]
                        }`}
                    >
                        {getDirectionIcon(direction, level)}
                    </div>
                </div>
            )}

            {/* Show text if not icon-only */}
            {complexity.id !== "icon_only" && (
                <div className={styles.textContainer}>
                    <p className={styles.instructionText}>{translatedText}</p>
                </div>
            )}
        </div>
    );
};

/**
 * Display for timer instructions
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.configuration - Timer configuration
 * @param {Object} props.complexity - Complexity level configuration
 * @param {string} props.language - Language code
 * @returns {JSX.Element} Timer instruction display
 */
const TimerInstructionDisplay = ({ configuration, complexity, language }) => {
    const { seconds = 3 } = configuration || {};

    // Use the wait_action template
    const translatedText = getTranslatedText(
        "wait_action",
        language,
        complexity.id,
        { seconds },
    );

    return (
        <div className={styles.instructionDisplay}>
            {/* Show icon if not text-only */}
            {complexity.id !== "text_only" && (
                <div className={styles.iconContainer}>
                    <div
                        className={`${styles.icon} ${
                            styles[getIconSizeClass(complexity)]
                        }`}
                    >
                        <Clock size={24} />
                    </div>
                    <div className={styles.timerValue}>{seconds}</div>
                </div>
            )}

            {/* Show text if not icon-only */}
            {complexity.id !== "icon_only" && (
                <div className={styles.textContainer}>
                    <p className={styles.instructionText}>{translatedText}</p>
                </div>
            )}
        </div>
    );
};

/**
 * Get the appropriate icon for the motor direction and speed
 *
 * @param {string} direction - Direction ('forward' or 'backward')
 * @param {string} level - Speed level ('slow', 'medium', or 'fast')
 * @returns {JSX.Element} Icon component
 */
function getDirectionIcon(direction, level) {
    if (direction === "forward") {
        if (level === "slow") return <Turtle size={24} />;
        if (level === "medium") return <ChevronRight size={24} />;
        return <Rabbit size={24} />;
    } else {
        if (level === "slow")
            return (
                <Turtle
                    size={24}
                    style={{ transform: "scaleX(-1)" }}
                />
            );
        if (level === "medium") return <ChevronLeft size={24} />;
        return (
            <Rabbit
                size={24}
                style={{ transform: "scaleX(-1)" }}
            />
        );
    }
}

/**
 * Get the CSS class for the icon size based on complexity
 *
 * @param {Object} complexity - Complexity level configuration
 * @returns {string} CSS class name
 */
function getIconSizeClass(complexity) {
    return complexity.iconSize === "lg"
        ? "largeIcon"
        : complexity.iconSize === "md"
        ? "mediumIcon"
        : complexity.iconSize === "sm"
        ? "smallIcon"
        : complexity.iconSize === "xs"
        ? "extraSmallIcon"
        : "hidden";
}

export default InstructionDisplay;
