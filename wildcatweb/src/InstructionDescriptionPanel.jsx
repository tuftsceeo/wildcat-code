/**
 * @file InstructionDescriptionPanel.jsx
 * @description Component for displaying human-readable instruction descriptions
 * with language and complexity level support.
 */

import React, { useEffect } from "react";
import { Volume2 } from "lucide-react";
import { useCustomization } from "./CustomizationContext";
import { generateDescription } from "./InstructionDescriptionGenerator";
import { getTranslatedText } from "./translations/loader";
import styles from "./InstructionDescriptionPanel.module.css";

/**
 * Panel that displays instruction descriptions with language/complexity support
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.instruction - The current instruction
 * @param {boolean} props.showAudio - Whether to show the audio button
 * @param {Function} props.onPlayAudio - Callback function to play audio
 * @returns {JSX.Element} Instruction description panel
 */
const InstructionDescriptionPanel = ({
    instruction,
    showAudio = true,
    onPlayAudio,
}) => {
    // Get language and complexity level from context
    const { language, readingLevel } = useCustomization();

    // DEBUG: Log when component renders or props change
    console.log("-----------------------------------");
    console.log("InstructionDescriptionPanel - RENDER");
    console.log("Current reading level:", readingLevel);
    console.log("Current language:", language);
    console.log("Current instruction:", instruction);

    // DEBUG: Log when readingLevel changes
    useEffect(() => {
        console.log("ReadingLevel CHANGED to:", readingLevel);

        // Test direct translation
        if (
            instruction &&
            instruction.type === "action" &&
            instruction.subtype === "motor"
        ) {
            const config = instruction.configuration;
            const port = Array.isArray(config) ? config[0]?.port : config?.port;

            if (port) {
                // Try to directly get translated text
                const directTest = getTranslatedText(
                    "motor_action",
                    language,
                    readingLevel,
                    {
                        port: `Motor ${port}`,
                        direction: "forward",
                        speed: "fast",
                    },
                );
                console.log(`DIRECT TEST [${readingLevel}]: "${directTest}"`);
            }
        }
    }, [readingLevel, language, instruction]);

    // Generate description text based on language and complexity
    const descriptionText = instruction
        ? generateDescription(instruction, language, readingLevel)
        : language === "es"
        ? "Seleccionar una acción o sensor..."
        : "Select an action or sensor...";

    // DEBUG: Log generated text
    console.log(`Generated description: "${descriptionText}"`);

    // Handle play button click
    const handlePlayClick = () => {
        if (onPlayAudio) {
            onPlayAudio(descriptionText);
        } else {
            // Fallback if no callback provided
            if ("speechSynthesis" in window) {
                const utterance = new SpeechSynthesisUtterance(descriptionText);
                utterance.lang = language === "es" ? "es-ES" : "en-US";
                utterance.rate = 0.9; // Slightly slower for clarity
                window.speechSynthesis.speak(utterance);
            }
        }
    };

    // Determine CSS class based on reading level
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

    // Display current reading level for debugging
    const debugInfo = (
        <div
            style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                fontSize: "9px",
                padding: "2px",
                background: "#333",
                color: "#fff",
                borderRadius: "2px",
            }}
        >
            Level: {readingLevel}
        </div>
    );

    return (
        <div
            className={styles.panel}
            data-reading-level={readingLevel}
        >
            {/* Debug information - remove in production */}
            {/*debugInfo*/}

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

export default InstructionDescriptionPanel;
