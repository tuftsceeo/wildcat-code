/**
 * @file CustomizationContext.js - FIXED with min/max step limits
 * @description Context provider for managing and persisting user customization settings
 * across the application.
 */

import React, { createContext, useState, useContext, useEffect } from "react";

// Create context
const CustomizationContext = createContext();

// Constants for min/max steps
export const MIN_STEPS = 2;
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
    // Reading level settings
    const [readingLevel, setReadingLevel] = useState("intermediate");

    // Theme settings
    const [theme, setTheme] = useState("retro");
    const [useDyslexiaFont, setUseDyslexiaFont] = useState(false);

    // Voice settings
    const [voice, setVoice] = useState("robot1");
    const [volume, setVolume] = useState(80);

    // Step count - starting with 2 as minimum
    const [stepCount, setStepCount] = useState(MIN_STEPS);

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

                // Ensure step count is within valid range
                const parsedStepCount = parsed.stepCount || MIN_STEPS;
                const validStepCount = Math.max(
                    MIN_STEPS,
                    Math.min(MAX_STEPS, parsedStepCount),
                );
                setStepCount(validStepCount);
                console.log(
                    "CustomizationContext: updated to",
                    validStepCount,
                    "steps",
                );
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
    }, [theme, useDyslexiaFont, highContrast, largeText]);

    // Add effect to notify when step count changes
    useEffect(() => {
        console.log("CustomizationContext: Step count changed to", stepCount);
        if (onStepCountChange) {
            onStepCountChange(stepCount);
        }
    }, [stepCount, onStepCountChange]);

    // Custom setter for step count with validation
    const updateStepCount = (newValue) => {
        console.log("CustomizationContext: Updating step count to", newValue);
        // Enforce min/max boundaries
        const validValue = Math.max(MIN_STEPS, Math.min(MAX_STEPS, newValue));
        setStepCount(validValue);
    };

    // Reset all settings to defaults
    const resetSettings = () => {
        setReadingLevel("intermediate");
        setTheme("retro");
        setUseDyslexiaFont(false);
        setVoice("robot1");
        setVolume(80);
        setStepCount(MIN_STEPS);
        setLanguage("en");
        setHighContrast(false);
        setLargeText(false);
    };

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
        setStepCount: updateStepCount, // Use the custom setter
        MIN_STEPS,
        MAX_STEPS,

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
