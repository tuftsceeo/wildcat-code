/**
 * @file debugger.js
 * @description Debug utilities for the translation system
 */

import { AVAILABLE_LANGUAGES, COMPLEXITY_LEVELS } from "./loader";

/**
 * Lists all translation templates available for a given language and complexity level
 *
 * @param {string} language - Language code (e.g., 'en', 'es')
 * @param {string} complexityLevel - Complexity level ID
 * @returns {Object} Available templates and their values
 */
export function listAvailableTemplates(
    language = "en",
    complexityLevel = "intermediate",
) {
    console.group(`Translation Templates: ${language} - ${complexityLevel}`);

    // Get language data
    const langData = AVAILABLE_LANGUAGES[language];
    if (!langData) {
        console.error(`Language '${language}' not found`);
        console.groupEnd();
        return {};
    }

    // Get complexity level templates
    const templates =
        langData.translations?.complexity?.[complexityLevel]?.templates;
    if (!templates) {
        console.error(
            `No templates found for complexity level '${complexityLevel}'`,
        );
        console.groupEnd();
        return {};
    }

    // Log each template
    console.log("Available templates:");
    Object.entries(templates).forEach(([key, value]) => {
        console.log(`${key}: "${value}"`);
    });

    console.groupEnd();
    return templates;
}

/**
 * Lists all complexity levels and their descriptions
 */
export function listComplexityLevels() {
    console.group("Available Complexity Levels");

    Object.entries(COMPLEXITY_LEVELS).forEach(([id, level]) => {
        console.log(`${id}: ${level.description.en}`);
    });

    console.groupEnd();
}

/**
 * Verifies that all languages have the necessary templates
 */
export function verifyTranslations() {
    console.group("Translation Verification");

    // Get all template keys from English as reference
    const enTemplateKeys = {};
    Object.entries(COMPLEXITY_LEVELS).forEach(([levelId]) => {
        const templates =
            AVAILABLE_LANGUAGES.en.translations.complexity[levelId]?.templates;
        if (templates) {
            enTemplateKeys[levelId] = Object.keys(templates);
        }
    });

    // Check each language against English
    Object.entries(AVAILABLE_LANGUAGES).forEach(([langCode, langData]) => {
        if (langCode === "en") return; // Skip English (our reference)

        console.group(`Checking ${langData.name} (${langCode})`);

        Object.entries(enTemplateKeys).forEach(([levelId, keys]) => {
            const langTemplates =
                langData.translations.complexity[levelId]?.templates;

            if (!langTemplates) {
                console.error(`Missing complexity level: ${levelId}`);
                return;
            }

            const langKeys = Object.keys(langTemplates);

            // Find missing keys
            const missingKeys = keys.filter((key) => !langKeys.includes(key));
            if (missingKeys.length > 0) {
                console.error(
                    `Missing templates for ${levelId}: ${missingKeys.join(
                        ", ",
                    )}`,
                );
            }

            // Find extra keys
            const extraKeys = langKeys.filter((key) => !keys.includes(key));
            if (extraKeys.length > 0) {
                console.warn(
                    `Extra templates for ${levelId}: ${extraKeys.join(", ")}`,
                );
            }
        });

        console.groupEnd();
    });

    console.groupEnd();
}

// Export a function to run all checks
export function runAllChecks() {
    console.group("Translation System Check");

    listComplexityLevels();

    Object.keys(AVAILABLE_LANGUAGES).forEach((lang) => {
        Object.keys(COMPLEXITY_LEVELS).forEach((level) => {
            listAvailableTemplates(lang, level);
        });
    });

    verifyTranslations();

    console.groupEnd();
}

// For browser console debugging
window.TranslationDebug = {
    listAvailableTemplates,
    listComplexityLevels,
    verifyTranslations,
    runAllChecks,
    AVAILABLE_LANGUAGES,
    COMPLEXITY_LEVELS,
};
