/**
 * @file ReadingLevelSettings.jsx
 * @description Component for adjusting reading complexity levels with visual previews
 * showing how content will appear at different levels.
 */

import React, { useState, useEffect } from "react";
import { useCustomization } from "../CustomizationContext";
import { COMPLEXITY_LEVELS } from "../translations/loader";
import { generateDescription } from "../InstructionDescriptionGenerator";
import styles from "./ReadingLevelSettings.module.css";

/**
 * Reading level configuration options with live preview
 *
 * @component
 * @returns {JSX.Element} Reading level settings panel
 */
const ReadingLevelSettings = () => {
    // Get current settings from context
    const { readingLevel, setReadingLevel, language } = useCustomization();

    // Sample instructions for preview
    const sampleMotorInstruction = {
        type: "action",
        subtype: "motor",
        configuration: {
            port: "A",
            speed: 1000, // Fast forward
        },
    };

    const sampleTimerInstruction = {
        type: "input",
        subtype: "time",
        configuration: {
            seconds: 3,
        },
    };

    /**
     * Handle reading level selection - applies the change immediately
     *
     * @param {string} level - The selected reading level ID
     */
    const handleLevelSelect = (level) => {
        console.log(`Directly setting reading level to: ${level}`);
        setReadingLevel(level);
    };

    // Extract complexity levels into array for rendering
    const complexityLevelsArray = Object.values(COMPLEXITY_LEVELS);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                {language === "es" ? "Nivel de Lectura" : "Reading Level"}
            </h2>

            <div className={styles.optionsContainer}>
                {complexityLevelsArray.map((level) => (
                    <button
                        key={level.id}
                        className={`${styles.optionButton} ${
                            readingLevel === level.id ? styles.activeOption : ""
                        }`}
                        onClick={() => handleLevelSelect(level.id)}
                        aria-pressed={readingLevel === level.id}
                    >
                        <div className={styles.optionIcon}>{level.icon}</div>
                        <span className={styles.optionLabel}>
                            {level.name[language] || level.name.en}
                        </span>
                    </button>
                ))}
            </div>

            <div className={styles.description}>
                {COMPLEXITY_LEVELS[readingLevel]?.description[language] ||
                    COMPLEXITY_LEVELS[readingLevel]?.description.en}
            </div>

            <div className={styles.previewContainer}>
                <div className={styles.previewTitle}>
                    {language === "es" ? "Vista Previa:" : "Preview:"}
                </div>
                <div className={styles.previewContent}>
                    <div className={styles.previewInstruction}>
                        {generateDescription(
                            sampleMotorInstruction,
                            language,
                            readingLevel,
                        )}
                    </div>
                    <div className={styles.previewInstruction}>
                        {generateDescription(
                            sampleTimerInstruction,
                            language,
                            readingLevel,
                        )}
                    </div>
                </div>
                <div className={styles.previewNote}>
                    {language === "es"
                        ? "Así es como aparecerán las instrucciones en la aplicación"
                        : "This is how instructions will appear in the app"}
                </div>
            </div>
        </div>
    );
};

export default ReadingLevelSettings;
