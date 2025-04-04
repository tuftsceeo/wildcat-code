/**
 * @file LanguageSettings.jsx
 * @description Component for selecting application language with simplified translations.
 * Provides a preview of how instructions will appear in the selected language.
 * @author Jennifer Cross with support from Claude
 */

import React, { useState, useEffect } from "react";
import { useCustomization } from "../../../context/CustomizationContext";
import { AVAILABLE_LANGUAGES, getUIText } from "../../../translations/loader";
import { generateDescription } from "../../../code-generation/InstructionDescriptionGenerator";
import { ReactComponent as EnIcon } from "../../../assets/images/lang-en.svg";
import { ReactComponent as EsIcon } from "../../../assets/images/lang-es.svg";
import styles from "../styles/LanguageSettings.module.css";

// Map of language codes to their SVG components
const LANGUAGE_ICONS = {
    en: EnIcon,
    es: EsIcon
};

/**
 * Language selection component with preview
 *
 * @component
 * @returns {JSX.Element} Language settings panel
 */
const LanguageSettings = () => {
    // Get current settings from context
    const { language, setLanguage, readingLevel } = useCustomization();

    // Local state for selected language (before applying)
    const [selectedLanguage, setSelectedLanguage] = useState(language);

    // Update local state when context changes
    useEffect(() => {
        setSelectedLanguage(language);
    }, [language]);

    // Sample instructions for preview
    const sampleMotorInstruction = {
        type: "action",
        subtype: "motor",
        configuration: {
            port: "A",
            speed: 1000, // Fast clockwise
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
     * Apply button handler
     */
    const handleApplyLanguage = () => {
        setLanguage(selectedLanguage);
    };

    // Extract languages into array for rendering
    const languagesArray = Object.values(AVAILABLE_LANGUAGES);

    /**
     * Get appropriate title text based on current language selection
     *
     * @returns {string} Localized title text
     */
    const getTitleText = () => {
        return selectedLanguage === "es"
            ? "Seleccionar Idioma"
            : "Select Language";
    };

    /**
     * Get appropriate preview text based on current language selection
     *
     * @returns {string} Localized preview text
     */
    const getPreviewText = () => {
        return selectedLanguage === "es" ? "Vista Previa:" : "Preview:";
    };

    /**
     * Get appropriate button text
     *
     * @returns {string} Localized button text
     */
    const getButtonText = () => {
        return getUIText("apply", selectedLanguage);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{getTitleText()}</h2>

            <div className={styles.languageOptions}>
                {languagesArray.map((lang) => {
                    const IconComponent = LANGUAGE_ICONS[lang.id];
                    return (
                        <button
                            key={lang.id}
                            className={`${styles.languageOption} ${
                                selectedLanguage === lang.id
                                    ? styles.activeLanguage
                                    : ""
                            }`}
                            onClick={() => setSelectedLanguage(lang.id)}
                            aria-pressed={selectedLanguage === lang.id}
                        >
                            <div className={styles.languageIcon}>
                                <IconComponent className={styles.langIcon} />
                            </div>
                            <div className={styles.languageDetail}>
                                <span className={styles.languageName}>
                                    {lang.name}
                                </span>
                                <span className={styles.nativeName}>
                                    {lang.nativeName}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* <div className={styles.previewContainer}>
                <div className={styles.previewTitle}>{getPreviewText()}</div>
                <div className={styles.previewContent}>
                    <div className={styles.previewInstruction}>
                        {generateDescription(
                            sampleMotorInstruction,
                            selectedLanguage,
                            readingLevel,
                        )}
                    </div>
                    <div className={styles.previewInstruction}>
                        {generateDescription(
                            sampleTimerInstruction,
                            selectedLanguage,
                            readingLevel,
                        )}
                    </div>
                </div>
            </div> */}

            {/* Only show Apply button if the selection differs from current setting */}
            {selectedLanguage !== language && (
                <button
                    className={styles.applyButton}
                    onClick={handleApplyLanguage}
                >
                    {getButtonText()}
                </button>
            )}

            {/* Coming soon section for additional languages */}
            {/* <div className={styles.comingSoonSection}>
                <h3 className={styles.comingSoonTitle}>
                    {selectedLanguage === "es" ? "Próximamente" : "Coming Soon"}
                </h3>
                <div className={styles.comingSoonLanguages}>
                    <div className={styles.comingSoonLanguage}>
                        <span className={styles.languageIcon}>🇭🇹</span>
                        <span className={styles.languageName}>
                            Haitian Creole
                        </span>
                    </div>
                    <div className={styles.comingSoonLanguage}>
                        <span className={styles.languageIcon}>🇫🇷</span>
                        <span className={styles.languageName}>French</span>
                    </div>
                </div>
            </div> */}
        </div>
    );
};

export default LanguageSettings;
