/**
 * @file CustomizationContext.js
 * @description Context provider for managing and persisting user customization settings
 * across the application. Enhanced with navigation preference options.
 */

import React, { createContext, useState, useContext, useEffect } from "react";
import { AVAILABLE_LANGUAGES, COMPLEXITY_LEVELS } from "../translations/loader";

// Create context
const CustomizationContext = createContext();

// Constants for min/max steps
export const MIN_STEPS = 3;
export const MAX_STEPS = 10;

/**
 * Hook for accessing customization settings and functions from any component
 *
 * @returns {Object} Context containing all customization settings and setter functions
 */
export const useCustomization = () => useContext(CustomizationContext);

/**
 * Provider component to wrap around application for managing customization settings
 *
 * @component
 * @param {Object} props - Provider props
 * @param {React.ReactNode} props.children - Child components
 * @param {Function} props.onStepCountChange - Optional callback when step count changes
 * @returns {JSX.Element} Context provider
 */
export const CustomizationProvider = ({ children, onStepCountChange }) => {
    // Reading level settings - enhanced with support from our translation system
    const [readingLevel, setReadingLevel] = useState("intermediate");

    // Language settings - now with proper language code
    const [language, setLanguage] = useState("en");

    // Theme settings
    const [theme, setTheme] = useState("retro");
    const [useDyslexiaFont, setUseDyslexiaFont] = useState(false);

    // Voice settings
    const [voice, setVoice] = useState("robot1");
    const [volume, setVolume] = useState(80);

    // Step count - starting with 2 as minimum
    const [stepCount, setStepCount] = useState(MIN_STEPS);

    // Accessibility
    const [highContrast, setHighContrast] = useState(false);
    const [largeText, setLargeText] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [reduceSound, setReduceSound] = useState(false);

    // Navigation preferences - new settings
    const [requireSequentialCompletion, setRequireSequentialCompletion] = useState(true);
    const [useCommandLabels, setUseCommandLabels] = useState(true);

    // Color scheme settings
    const [colorScheme, setColorScheme] = useState("default");
    const [borderThickness, setBorderThickness] = useState(4);
    const [customColors, setCustomColors] = useState({
        primary: "#35b1ff",
        secondary: "#33ff52",
        info: "#ff00ff",
        warning: "#ffa500",
        error: "#ff0000",
    });

    // Load settings from localStorage on mount
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem("customizationSettings");
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);

                // Update states with saved values or use default
                setReadingLevel(parsed.readingLevel || "intermediate");
                setLanguage(parsed.language || "en");
                setTheme(parsed.theme || "retro");
                setUseDyslexiaFont(parsed.useDyslexiaFont || false);
                setVoice(parsed.voice || "robot1");
                setVolume(parsed.volume || 80);

                // Load custom colors if they exist
                if (parsed.customColors) {
                    setCustomColors(parsed.customColors);
                }

                // Ensure step count is within valid range
                const parsedStepCount = parsed.stepCount || MIN_STEPS;
                const validStepCount = Math.max(MIN_STEPS, Math.min(MAX_STEPS, parsedStepCount));
                setStepCount(validStepCount);
                setHighContrast(parsed.highContrast || false);
                setLargeText(parsed.largeText || false);
                setReduceMotion(parsed.reduceMotion || false);
                setReduceSound(parsed.reduceSound || false);

                // Load navigation preferences with default values if not found
                setRequireSequentialCompletion(parsed.requireSequentialCompletion !== undefined ? parsed.requireSequentialCompletion : true);
                setUseCommandLabels(parsed.useCommandLabels !== undefined ? parsed.useCommandLabels : true);

                // Load color scheme and border thickness
                setColorScheme(parsed.colorScheme || "default");
                setBorderThickness(parsed.borderThickness || 4);
            }
        } catch (error) {
            console.error("Error loading settings from localStorage:", error);
        }
    }, []);

    // Save settings to localStorage when they change
    useEffect(() => {
        try {
            const settings = {
                readingLevel,
                language,
                theme,
                useDyslexiaFont,
                voice,
                volume,
                stepCount,
                highContrast,
                largeText,
                requireSequentialCompletion,
                useCommandLabels,
                reduceMotion,
                reduceSound,
                colorScheme,
                borderThickness,
                customColors,
            };
            localStorage.setItem("customizationSettings", JSON.stringify(settings));
        } catch (error) {
            console.error("Error saving settings to localStorage:", error);
        }
    }, [
        readingLevel,
        language,
        theme,
        useDyslexiaFont,
        voice,
        volume,
        stepCount,
        highContrast,
        largeText,
        requireSequentialCompletion,
        useCommandLabels,
        reduceMotion,
        reduceSound,
        colorScheme,
        borderThickness,
        customColors,
    ]);

    // Apply theme and accessibility settings to document
    useEffect(() => {
        // Set theme data attribute on body
        document.body.dataset.theme = theme;

        // Apply dyslexia font class
        if (useDyslexiaFont) {
            document.body.classList.add("dyslexia-font");
        } else {
            document.body.classList.remove("dyslexia-font");
        }

        // Apply high contrast class
        if (highContrast) {
            document.body.classList.add("high-contrast");
        } else {
            document.body.classList.remove("high-contrast");
        }

        // Apply large text class
        if (largeText) {
            document.body.classList.add("large-text");
        } else {
            document.body.classList.remove("large-text");
        }

        // Apply color scheme and border thickness
        document.body.dataset.colorScheme = colorScheme;
        document.body.dataset.borderThickness = borderThickness;

        // Apply accessibility classes
        document.body.dataset.reduceMotion = reduceMotion;
        document.body.dataset.reduceSound = reduceSound;
    }, [theme, useDyslexiaFont, highContrast, largeText, reduceMotion, reduceSound, colorScheme, borderThickness]);

    // Add effect to notify when step count changes
    useEffect(() => {
        if (onStepCountChange) {
            onStepCountChange(stepCount);
        }
    }, [stepCount, onStepCountChange]);

    // Custom setter for step count with validation
    const updateStepCount = (newValue) => {
        // Enforce min/max boundaries
        const validValue = Math.max(MIN_STEPS, Math.min(MAX_STEPS, newValue));
        setStepCount(validValue);
    };

    // Helper to validate if a language is available
    const isLanguageSupported = (langCode) => {
        return Object.keys(AVAILABLE_LANGUAGES).includes(langCode);
    };

    // Helper to validate if a complexity level is available
    const isComplexityLevelSupported = (levelId) => {
        return Object.keys(COMPLEXITY_LEVELS).includes(levelId);
    };

    // Custom setter for language with validation
    const updateLanguage = (newLanguage) => {
        if (isLanguageSupported(newLanguage)) {
            setLanguage(newLanguage);
        } else {
            console.warn(`Language ${newLanguage} is not supported, using English instead`);
            setLanguage("en");
        }
    };

    // Custom setter for reading level with validation
    const updateReadingLevel = (newLevel) => {
        if (isComplexityLevelSupported(newLevel)) {
            setReadingLevel(newLevel);
        } else {
            console.warn(`Complexity level ${newLevel} is not supported, using intermediate instead`);
            setReadingLevel("intermediate");
        }
    };

    // Reset all settings to defaults
    const resetSettings = () => {
        setReadingLevel("intermediate");
        setLanguage("en");
        setTheme("retro");
        setUseDyslexiaFont(false);
        setVoice("robot1");
        setVolume(80);
        setStepCount(MIN_STEPS);
        setHighContrast(false);
        setLargeText(false);
        setRequireSequentialCompletion(true);
        setUseCommandLabels(true);
        setReduceMotion(false);
        setReduceSound(false);
        setColorScheme("default");
        setBorderThickness(4);
        setCustomColors({
            primary: "#00ff00",
            secondary: "#00bfff",
            accent: "#ff00ff",
        });
    };

    // Context value with all settings and setters
    const contextValue = {
        // Reading level
        readingLevel,
        setReadingLevel: updateReadingLevel,
        isComplexityLevelSupported,

        // Language
        language,
        setLanguage: updateLanguage,
        isLanguageSupported,

        // Theme
        theme,
        setTheme,
        useDyslexiaFont,
        setUseDyslexiaFont,

        // Voice
        voice,
        setVoice,
        volume,
        setVolume,

        // Steps
        stepCount,
        setStepCount: updateStepCount,
        MIN_STEPS,
        MAX_STEPS,

        // Accessibility
        highContrast,
        setHighContrast,
        largeText,
        setLargeText,
        useDyslexiaFont,
        setUseDyslexiaFont,
        reduceMotion,
        setReduceMotion,
        reduceSound,
        setReduceSound,

        // Navigation preferences
        requireSequentialCompletion,
        setRequireSequentialCompletion,
        useCommandLabels,
        setUseCommandLabels,

        // Color scheme
        colorScheme,
        setColorScheme,
        borderThickness,
        setBorderThickness,
        customColors,
        setCustomColors,

        // Utility functions
        resetSettings,
    };

    return <CustomizationContext.Provider value={contextValue}>{children}</CustomizationContext.Provider>;
};

export default CustomizationContext;
