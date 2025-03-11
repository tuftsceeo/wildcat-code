/**
 * @file loader.js
 * @description Utility for loading translation JSON files
 */

// Import JSON files
import enTranslations from "./en/en.json";
import esTranslations from "./es/es.json";

// Define available languages with metadata
export const AVAILABLE_LANGUAGES = {
    en: {
        id: "en",
        name: "English",
        nativeName: "English",
        icon: "🇺🇸",
        translations: enTranslations,
    },
    es: {
        id: "es",
        name: "Spanish",
        nativeName: "Español",
        icon: "🇪🇸",
        translations: esTranslations,
    },
    // Add more languages here as needed
};

// Complexity levels with their metadata
export const COMPLEXITY_LEVELS = {
    icon_only: {
        id: "icon_only",
        icon: "🖼️",
        name: { en: "Icon Only", es: "Solo Íconos" },
        description: {
            en: "Icons without words",
            es: "Íconos sin palabras",
        },
        textRatio: 0,
        iconSize: "lg",
    },
    beginner: {
        id: "beginner",
        icon: "🔤",
        name: { en: "Beginner", es: "Principiante" },
        description: {
            en: "Simple words with icons",
            es: "Palabras simples con íconos",
        },
        textRatio: 1,
        iconSize: "md",
    },
    intermediate: {
        id: "intermediate",
        icon: "📝",
        name: { en: "Intermediate", es: "Intermedio" },
        description: {
            en: "Simple sentences with icons",
            es: "Frases simples con íconos",
        },
        textRatio: 2,
        iconSize: "sm",
    },
    advanced: {
        id: "advanced",
        icon: "📚",
        name: { en: "Advanced", es: "Avanzado" },
        description: {
            en: "Complete sentences with icons",
            es: "Oraciones completas con íconos",
        },
        textRatio: 3,
        iconSize: "xs",
    },
    text_only: {
        id: "text_only",
        icon: "📄",
        name: { en: "Text Only", es: "Solo Texto" },
        description: {
            en: "Only text, no icons",
            es: "Solo texto, sin íconos",
        },
        textRatio: 4,
        iconSize: "none",
    },
};

/**
 * Gets a translated text string with replacements
 *
 * @param {string} key - Translation template key (e.g., 'motor_action')
 * @param {string} language - Language code ('en', 'es')
 * @param {string} complexityLevel - Complexity level ID
 * @param {Object} replacements - Values to replace in template
 * @returns {string} Translated text with replacements
 */
export function getTranslatedText(
    key,
    language,
    complexityLevel,
    replacements = {},
) {
    // Get translations for the specified language
    const langData = AVAILABLE_LANGUAGES[language] || AVAILABLE_LANGUAGES.en;
    const translations = langData.translations;

    // Get the template for this complexity
    const template =
        translations?.complexity?.[complexityLevel]?.templates?.[key];
    if (!template) {
        return key; // Fallback if template not found
    }

    // Replace placeholders with values
    let result = template;
    Object.entries(replacements).forEach(([placeholder, value]) => {
        // Handle translation of common values (like 'slow', 'forward', etc.)
        if (typeof value === "string" && translations.ui[value]) {
            result = result.replace(`{${placeholder}}`, translations.ui[value]);
        } else {
            result = result.replace(`{${placeholder}}`, value);
        }
    });

    return result;
}

/**
 * Gets a UI text item in the specified language
 *
 * @param {string} key - UI text key
 * @param {string} language - Language code
 * @returns {string} Translated UI text
 */
export function getUIText(key, language) {
    const langData = AVAILABLE_LANGUAGES[language] || AVAILABLE_LANGUAGES.en;
    return langData.translations?.ui?.[key] || key;
}
