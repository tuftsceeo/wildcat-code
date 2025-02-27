/**
 * @file ReadingLevelSettings.jsx
 * @description Component for adjusting reading complexity levels with visual previews
 * of how content will appear at different levels.
 * @author Claude
 */

import React, { useState } from "react";
import styles from "./ReadingLevelSettings.module.css";

/**
 * Reading level configuration options with live preview
 *
 * @component
 * @returns {JSX.Element} Reading level settings panel
 */
const ReadingLevelSettings = () => {
    // Default to intermediate level for most users
    const [selectedLevel, setSelectedLevel] = useState("intermediate");

    // Define reading complexity levels
    const levels = [
        {
            id: "icon_only",
            icon: "🖼️",
            name: "Icon Only",
            description: "Minimal text with maximum icons",
        },
        {
            id: "beginner",
            icon: "🔤",
            name: "Beginner",
            description: "Simple words with large icons",
        },
        {
            id: "intermediate",
            icon: "📝",
            name: "Intermediate",
            description: "Complete sentences with icons",
        },
        {
            id: "advanced",
            icon: "📚",
            name: "Advanced",
            description: "Detailed text with small icons",
        },
        {
            id: "text_only",
            icon: "📄",
            name: "Text Only",
            description: "Full text descriptions without icons",
        },
    ];

    // Get current level description
    const currentDescription = levels.find(
        (level) => level.id === selectedLevel,
    )?.description;

    // Define preview content for each level
    const renderPreview = () => {
        switch (selectedLevel) {
            case "icon_only":
                return (
                    <div className={styles.iconOnlyPreview}>
                        <span>🤖</span>
                        <span>➡️</span>
                        <span>💨</span>
                    </div>
                );
            case "beginner":
                return (
                    <div className={styles.beginnerPreview}>
                        <span className={styles.beginnerIcon}>➡️</span>
                        <span className={styles.beginnerText}>
                            Robot Move Fast
                        </span>
                    </div>
                );
            case "intermediate":
                return (
                    <span className={styles.intermediatePreview}>
                        Motor A spins forward at fast speed.
                    </span>
                );
            case "advanced":
                return (
                    <div className={styles.advancedPreview}>
                        The robot will rotate Motor A in the forward direction
                        at fast speed. This will move the robot forward.
                    </div>
                );
            case "text_only":
                return (
                    <div className={styles.textOnlyPreview}>
                        The robot will activate Motor A to rotate in the forward
                        direction at maximum speed. This will cause the robot to
                        move forward in a straight line until a new command is
                        received.
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.title}>Reading Level</div>

            <div className={styles.optionsContainer}>
                {levels.map((level) => (
                    <button
                        key={level.id}
                        className={`${styles.optionButton} ${
                            selectedLevel === level.id
                                ? styles.activeOption
                                : ""
                        }`}
                        onClick={() => setSelectedLevel(level.id)}
                        aria-pressed={selectedLevel === level.id}
                    >
                        <div className={styles.optionIcon}>{level.icon}</div>
                        <span className={styles.optionLabel}>{level.name}</span>
                    </button>
                ))}
            </div>

            <div className={styles.description}>{currentDescription}</div>

            <div className={styles.previewContainer}>
                <div className={styles.previewTitle}>Preview:</div>
                <div className={styles.previewContent}>{renderPreview()}</div>
                <div className={styles.previewNote}>
                    This is how instructions will appear in the app
                </div>
            </div>
        </div>
    );
};

export default ReadingLevelSettings;
