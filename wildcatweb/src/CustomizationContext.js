/**
 * @file CustomizationContext.js
 * @description Context provider for managing and persisting user customization settings
 * across the application.
 * @author Claude
 */

import React, { createContext, useState, useContext, useEffect } from "react";

// Create context
const CustomizationContext = createContext();

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
 * @returns {JSX.Element} Context provider
 */
export const CustomizationProvider = ({ children }) => {
    // Reading level settings
    const [readingLevel, setReadingLevel] = useState("intermediate");

    // Theme settings
    const [theme, setTheme] = useState("retro");
    const [useDyslexiaFont, setUseDyslexiaFont] = useState(false);

    // Voice settings
    const [voice, setVoice] = useState("robot1");
    const [volume, setVolume] = useState(80);

    // Step count
    const [stepCount, setStepCount] = useState(3);

    // Language
    const [language, setLanguage] = useState("en");

    // Accessibility
    const [highContrast, setHighContrast] = useState(false);
    const [largeText, setLargeText] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem("customizationSettings");
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);

                // Update states with saved values or use default
                setReadingLevel(parsed.readingLevel || "intermediate");
                setTheme(parsed.theme || "retro");
                setUseDyslexiaFont(parsed.useDyslexiaFont || false);
                setVoice(parsed.voice || "robot1");
                setVolume(parsed.volume || 80);
                setStepCount(parsed.stepCount || 3);
                setLanguage(parsed.language || "en");
                setHighContrast(parsed.highContrast || false);
                setLargeText(parsed.largeText || false);
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
                theme,
                useDyslexiaFont,
                voice,
                volume,
                stepCount,
                language,
                highContrast,
                largeText,
            };
            localStorage.setItem(
                "customizationSettings",
                JSON.stringify(settings),
            );
        } catch (error) {
            console.error("Error saving settings to localStorage:", error);
        }
    }, [
        readingLevel,
        theme,
        useDyslexiaFont,
        voice,
        volume,
        stepCount,
        language,
        highContrast,
        largeText,
    ]);

    // Reset all settings to defaults
    const resetSettings = () => {
        setReadingLevel("intermediate");
        setTheme("retro");
        setUseDyslexiaFont(false);
        setVoice("robot1");
        setVolume(80);
        setStepCount(3);
        setLanguage("en");
        setHighContrast(false);
        setLargeText(false);
    };

    // Apply theme to document based on settings
    useEffect(() => {
        // Apply font family
        document.documentElement.style.setProperty(
            "--font-family-active",
            useDyslexiaFont
                ? "var(--font-family-dyslexic)"
                : "var(--font-family-primary)",
        );

        // Apply high contrast if enabled
        if (highContrast) {
            document.body.classList.add("high-contrast");
        } else {
            document.body.classList.remove("high-contrast");
        }

        // Apply large text if enabled
        if (largeText) {
            document.body.classList.add("large-text");
        } else {
            document.body.classList.remove("large-text");
        }

        // Apply selected theme
        document.body.dataset.theme = theme;
    }, [theme, useDyslexiaFont, highContrast, largeText]);

    // Context value with all settings and setters
    const contextValue = {
        // Reading level
        readingLevel,
        setReadingLevel,

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
        setStepCount,

        // Language
        language,
        setLanguage,

        // Accessibility
        highContrast,
        setHighContrast,
        largeText,
        setLargeText,

        // Utility functions
        resetSettings,
    };

    return (
        <CustomizationContext.Provider value={contextValue}>
            {children}
        </CustomizationContext.Provider>
    );
};

export default CustomizationContext;
