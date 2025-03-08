/**
 * @file InstructionDescriptionPanel.jsx
 * @description Component for displaying human-readable instruction descriptions
 * with text-to-speech capabilities, supporting multiple languages, complexity levels,
 * robot voice options, and icon display.
 */

import React from "react";
import { Volume2 } from "lucide-react";
import { useCustomization } from "../../../context/CustomizationContext";
import { generateDescription } from "./InstructionDescriptionGenerator";
import { COMPLEXITY_LEVELS } from "./translations/loader";
import { speakWithRobotVoice } from "./utils/speechUtils";
import {
    getIconForConcept,
    segmentDescriptionText,
    addTTSPauses,
} from "../../../common/utils/iconMappings";
import styles from "../styles/InstructionDescriptionPanel.module.css";

/**
 * Panel that displays instruction descriptions with language/complexity support,
 * text-to-speech capabilities, and icon support for different reading levels
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.instruction - The current instruction
 * @param {boolean} props.showAudio - Whether to show the audio button
 * @param {Function} props.onPlayAudio - Optional callback function to play audio
 * @param {number} props.slotNumber - Current slot number (for sequencing words)
 * @returns {JSX.Element} Instruction description panel
 */
const InstructionDescriptionPanel = ({
    instruction,
    showAudio = true,
    onPlayAudio,
    slotNumber = 0, // Default to first slot
}) => {
    // Get settings from context
    const { language, readingLevel, voice, volume } = useCustomization();

    // Get complexity level configuration
    const complexity =
        COMPLEXITY_LEVELS[readingLevel] || COMPLEXITY_LEVELS.intermediate;

    // Generate description text
    const descriptionText = instruction
        ? generateDescription(instruction, language, readingLevel, slotNumber)
        : language === "es"
        ? "Seleccionar una acción o sensor..."
        : "Select an action or sensor...";

    // Check if this is a multi-instruction description (with periods)
    const isMultiInstruction = descriptionText.split(". ").length > 1;

    // Segment the text for icon display - include breaks for icon-only mode
    const segments = segmentDescriptionText(
        descriptionText,
        isMultiInstruction && readingLevel === "icon_only",
    );

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
            // Add pauses between instructions for multi-instruction descriptions
            const textWithPauses = isMultiInstruction
                ? addTTSPauses(descriptionText)
                : descriptionText;

            speakWithRobotVoice(textWithPauses, voice, volume, languageCode);
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

    /**
     * Render content for icon-only reading level
     */
    const renderIconOnly = () => {
        // Filter to just segments that have icons or are separators
        const iconSegments = segments.filter(
            (segment) => segment.iconType || segment.isSeparator,
        );

        return (
            <div className={styles.iconContainer}>
                {iconSegments.map((segment, index) => (
                    <div
                        key={index}
                        className={
                            segment.isSeparator
                                ? styles.separatorWrapper
                                : styles.iconWrapper
                        }
                    >
                        {segment.iconType === "number"
                            ? // Render numbers directly for wait times
                              getIconForConcept(segment.iconType, {
                                  size: 36,
                                  className: styles.iconOnlyIcon,
                                  numberValue: segment.numberValue,
                              })
                            : // Render regular icons or separators
                              getIconForConcept(segment.iconType, {
                                  size: segment.isSeparator ? 36 : 36,
                                  className: segment.isSeparator
                                      ? styles.separatorIcon
                                      : styles.iconOnlyIcon,
                              })}
                    </div>
                ))}
            </div>
        );
    };

    /**
     * Render content for text with icons (beginner and intermediate levels)
     */
    const renderTextWithIcons = () => {
        return (
            <div className={styles.textIconContainer}>
                {segments.map(
                    (segment, index) =>
                        // Skip separator segments in text+icon modes
                        !segment.isSeparator && (
                            <div
                                key={index}
                                className={styles.textIconPair}
                            >
                                {/* Text part */}
                                <div className={styles.pairText}>
                                    {segment.text}
                                </div>

                                {/* Icon part - only show for specific words, not port letters */}
                                <div className={styles.pairIcon}>
                                    {segment.iconType &&
                                    !/^[A-F]$/.test(segment.iconType) ? (
                                        segment.iconType === "number" ? (
                                            // Use numberValue for number type
                                            getIconForConcept(
                                                segment.iconType,
                                                {
                                                    size: 28,
                                                    className:
                                                        styles.conceptIcon,
                                                    numberValue:
                                                        segment.numberValue,
                                                },
                                            )
                                        ) : (
                                            // Regular icon
                                            getIconForConcept(
                                                segment.iconType,
                                                {
                                                    size: 28,
                                                    className:
                                                        styles.conceptIcon,
                                                },
                                            )
                                        )
                                    ) : (
                                        <div
                                            className={styles.iconPlaceholder}
                                        ></div>
                                    )}
                                </div>
                            </div>
                        ),
                )}
            </div>
        );
    };

    /**
     * Render content based on reading level
     */
    const renderContent = () => {
        // For text-only reading levels
        if (readingLevel === "text_only" || readingLevel === "advanced") {
            return (
                <div className={styles.descriptionText}>{descriptionText}</div>
            );
        }

        // For icon-only reading level
        if (readingLevel === "icon_only") {
            return renderIconOnly();
        }

        // For beginner and intermediate levels, show text with icons underneath
        return renderTextWithIcons();
    };

    // Calculate panel height class based on reading level
    const panelHeightClass =
        readingLevel === "icon_only" ||
        readingLevel === "beginner" ||
        readingLevel === "intermediate"
            ? styles.panelWithIcons
            : "";

    return (
        <div
            className={`${styles.panel} ${panelHeightClass}`}
            data-reading-level={readingLevel}
        >
            <div
                className={`${styles.contentWrapper} ${getReadingLevelClass()}`}
            >
                {renderContent()}
            </div>

            {showAudio && (
                <button
                    className={styles.audioButton}
                    onClick={handlePlayClick}
                    aria-label="Read description aloud"
                >
                    <Volume2 size={40} />
                </button>
            )}
        </div>
    );
};

export default InstructionDescriptionPanel;
