/**
 * @file InstructionDescriptionPanel.jsx
 * @description Component for displaying human-readable instruction descriptions
 * with text-to-speech capabilities, supporting multiple languages, complexity levels,
 * and robot voice options.
 */

import React, { useEffect } from "react";
import { Volume2 } from "lucide-react";
import { useCustomization } from "./CustomizationContext";
import { generateDescription } from "./InstructionDescriptionGenerator";
import { getTranslatedText } from "./translations/loader";
import { speakWithRobotVoice } from "./utils/speechUtils";
import styles from "./InstructionDescriptionPanel.module.css";
import { COMPLEXITY_LEVELS } from "./translations/loader";
/**
 * Panel that displays instruction descriptions with language/complexity support
 * and text-to-speech capabilities
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.instruction - The current instruction
 * @param {boolean} props.showAudio - Whether to show the audio button
 * @param {Function} props.onPlayAudio - Optional callback function to play audio
 * @returns {JSX.Element} Instruction description panel
 */
const InstructionDescriptionPanel = ({
    instruction,
    showAudio = true,
    onPlayAudio,
}) => {
    // Get settings from context
    const { language, readingLevel, voice, volume } = useCustomization();

    // Get complexity level configuration
    const complexity =
        COMPLEXITY_LEVELS[readingLevel] || COMPLEXITY_LEVELS.intermediate;

    // Generate description text based on language and complexity
    const descriptionText = instruction
        ? generateDescription(instruction, language, readingLevel)
        : language === "es"
        ? "Seleccionar una acción o sensor..."
        : "Select an action or sensor...";

    /**
     * Handle play button click to read text aloud
     */
    const handlePlayClick = () => {
        if (onPlayAudio) {
            // Use provided callback if available
            onPlayAudio(descriptionText);
        } else {
            // Use our speech utility with the selected voice settings
            const languageCode = language === "es" ? "es-ES" : "en-US";
            speakWithRobotVoice(descriptionText, voice, volume, languageCode);
        }
    };

    /**
     * Determine CSS class based on reading level
     * @returns {string} CSS class name
     */
    const getReadingLevelClass = () => {
        switch (readingLevel) {
            case "icon_only":
                return styles.iconOnlyText;
            case "beginner":
                return styles.beginnerText;
            case "advanced":
                return styles.advancedText;
            case "text_only":
                return styles.textOnlyText;
            case "intermediate":
            default:
                return styles.intermediateText;
        }
    };

    return (
        <div
            className={styles.panel}
            data-reading-level={readingLevel}
        >
            <div
                className={`${
                    styles.descriptionText
                } ${getReadingLevelClass()}`}
            >
                {descriptionText}
            </div>

            {showAudio && (
                <button
                    className={styles.audioButton}
                    onClick={handlePlayClick}
                    aria-label="Read description aloud"
                >
                    <Volume2 size={20} />
                </button>
            )}
        </div>
    );
};

// Import the complexity levels after the component definition to avoid the circular dependency


export default InstructionDescriptionPanel;