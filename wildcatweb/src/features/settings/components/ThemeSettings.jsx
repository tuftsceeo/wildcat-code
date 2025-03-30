/**
 * @file ThemeSettings.jsx
 * @description Component for selecting visual themes with theme variable support.
 * Allows users to choose between different visual styles and font options.
 * @author Jennifer Cross with support from Claude
 */

import React, { useState, useRef, useEffect } from "react";
import { useCustomization } from "../../../context/CustomizationContext";
import styles from "../styles/ThemeSettings.module.css";

const STORAGE_KEY = 'wildcat-custom-colors';

/**
 * Theme settings component with proper theme variable usage
 *
 * @component
 * @returns {JSX.Element} Theme settings panel
 */
const ThemeSettings = () => {
    // Get theme settings from context
    const { 
        theme, 
        setTheme, 
        useDyslexiaFont, 
        setUseDyslexiaFont,
        highContrast,
        setHighContrast,
        borderThickness,
        setBorderThickness,
        customColors,
        setCustomColors
    } = useCustomization();

    // State for color customization
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Create a ref for the style element
    const styleRef = useRef(null);

    // Effect to load saved custom colors on mount
    useEffect(() => {
        const savedColors = localStorage.getItem(STORAGE_KEY);
        if (savedColors) {
            try {
                const parsedColors = JSON.parse(savedColors);
                setCustomColors(parsedColors);
            } catch (error) {
                console.error('Error loading saved colors:', error);
            }
        }
    }, []); // Empty dependency array means this runs once on mount

    // Effect to save custom colors when they change
    useEffect(() => {
        if (Object.keys(customColors).length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(customColors));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [customColors]);

    // Effect to handle high contrast mode changes
    useEffect(() => {
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }, [highContrast]);

    // Effect to handle custom color changes
    useEffect(() => {
        if (!highContrast) return;

        // Create a style element for custom colors
        const styleElement = document.createElement('style');
        styleElement.id = 'custom-theme-vars';
        
        // Generate CSS rules for all custom colors
        const cssRules = Object.entries(customColors).map(([colorType, value]) => {
            // Convert hex to RGB for rgba support
            const r = parseInt(value.slice(1, 3), 16);
            const g = parseInt(value.slice(3, 5), 16);
            const b = parseInt(value.slice(5, 7), 16);
            
            // Calculate relative luminance to determine contrast color
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            const contrastColor = luminance > 0.5 ? '#1E1E1E' : '#FFFFFF';

            let rules = `
                :root {
                    --color-${colorType}-main: ${value};
                    --color-${colorType}-high: ${value};
                    --color-${colorType}-low: ${value};
                    --color-${colorType}-main-rgb: ${r}, ${g}, ${b};
                    --color-${colorType}-contrast: ${contrastColor};
                }

                body.high-contrast {
                    --color-${colorType}-main: ${value};
                    --color-${colorType}-high: ${value};
                    --color-${colorType}-low: ${value};
                    --color-${colorType}-contrast: ${contrastColor};
                }
            `;

            // Add component-specific variables based on color type
            if (colorType === 'primary') {
                rules += `
                    body.high-contrast {
                        --button-selected-bg: ${value};
                        --button-selected-border: ${value};
                        --button-contained-default-bg: ${value};
                        --button-contained-default-border: ${value};
                        --button-selected-text: ${contrastColor};
                        --button-contained-default-text: ${contrastColor};
                        --state-active-bg: ${value};
                        --state-active-border: ${value};
                        --state-active-text: ${contrastColor};
                        --input-focus-border: ${value};
                        --focus-ring-color: ${value};
                        --panel-border: ${value};
                        --color-motor-clockwise: ${value};
                        --color-timer-main: ${value};
                    }
                `;
            } else if (colorType === 'secondary') {
                rules += `
                    body.high-contrast {
                        --button-contained-selected-bg: ${value};
                        --button-contained-selected-border: ${value};
                        --button-contained-selected-text: ${contrastColor};
                        --panel-active-border: ${value};
                        --color-motor-countercw: ${value};
                        --color-sensor-main: ${value};
                    }
                `;
            } else if (colorType === 'accent') {
                rules += `
                    body.high-contrast {
                        --color-motor-stopped: ${value};
                    }
                `;
            }

            return rules;
        }).join('\n');

        styleElement.textContent = cssRules;

        // Remove any existing style element
        const existingStyle = document.getElementById('custom-theme-vars');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Add the new style element
        document.head.appendChild(styleElement);

        // Cleanup function
        return () => {
            if (styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
        };
    }, [customColors, highContrast]);

    // Handle color changes
    const handleColorChange = (colorType, value) => {
        if (!highContrast) {
            console.warn('High contrast mode is not enabled. Colors will not be applied.');
            return;
        }

        setCustomColors(prev => ({
            ...prev,
            [colorType]: value
        }));
    };

    // Define available themes
    const themes = [
        {
            id: "retro",
            name: "RETRO",
            description: "Neon arcade style with vibrant animations",
            colors: ["#00ff00", "#00bfff", "#ff00ff"],
            preview: {
                bg: "#000000",
                text: "#00ff00",
                buttonBg: "#00bfff",
                buttonText: "#000000",
            },
        },
        {
            id: "pastel",
            name: "PASTEL",
            description: "Soft colors with gentle contrast",
            colors: ["#78C2AD", "#6CC3D5", "#F3969A"],
            preview: {
                bg: "#fffaf0",
                text: "#3E4551",
                buttonBg: "#78C2AD",
                buttonText: "#FFFFFF",
            },
        },
        {
            id: "clean",
            name: "CLEAN",
            description: "High contrast with clean layout",
            colors: ["#00AA55", "#0066CC", "#FF6600"],
            preview: {
                bg: "#FFFFFF",
                text: "#000000",
                buttonBg: "#00AA55",
                buttonText: "#FFFFFF",
            },
        },
    ];

    // Define border thickness options
    const borderThicknesses = [
        { id: "thin", name: "Thin", value: 2 },
        { id: "medium", name: "Medium", value: 4 },
        { id: "thick", name: "Thick", value: 6 },
        { id: "extra", name: "Extra Thick", value: 8 }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.title}>Choose Theme</div>

            <div className={styles.themesContainer}>
                {themes.map((themeOption) => (
                    <button
                        key={themeOption.id}
                        className={`${styles.themeButton} ${
                            theme === themeOption.id ? styles.activeTheme : ""
                        }`}
                        onClick={() => setTheme(themeOption.id)}
                        aria-pressed={theme === themeOption.id}
                    >
                        <div className={styles.themeSwatches}>
                            {themeOption.colors.map((color, i) => (
                                <div
                                    key={i}
                                    className={styles.colorSwatch}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <span className={styles.themeName}>
                            {themeOption.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* High Contrast Toggle */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Accessibility</h3>
                <div className={styles.setting}>
                    <label className={styles.label}>
                        <input
                            type="checkbox"
                            checked={highContrast}
                            onChange={(e) => setHighContrast(e.target.checked)}
                            className={styles.checkbox}
                        />
                        High Contrast Mode
                    </label>
                    <p className={styles.description}>
                        Increases contrast and uses thicker borders for better visibility
                    </p>
                </div>
            </div>

            {/* Custom Color Controls - Only shown in high contrast mode */}
            {highContrast && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Custom Colors</h3>
                    <div className={styles.colorControls}>
                        <div className={styles.colorControl}>
                            <label className={styles.colorLabel}>Primary Color</label>
                            <input
                                type="color"
                                value={customColors.primary}
                                onChange={(e) => handleColorChange('primary', e.target.value)}
                                className={styles.colorInput}
                            />
                        </div>
                        <div className={styles.colorControl}>
                            <label className={styles.colorLabel}>Secondary/Active Color</label>
                            <input
                                type="color"
                                value={customColors.secondary}
                                onChange={(e) => handleColorChange('secondary', e.target.value)}
                                className={styles.colorInput}
                            />
                        </div>
                        <div className={styles.colorControl}>
                            <label className={styles.colorLabel}>Info Color</label>
                            <input
                                type="color"
                                value={customColors.info}
                                onChange={(e) => handleColorChange('info', e.target.value)}
                                className={styles.colorInput}
                            />
                        </div>
                        <div className={styles.colorControl}>
                            <label className={styles.colorLabel}>Error/Stop Color</label>
                            <input
                                type="color"
                                value={customColors.error}
                                onChange={(e) => handleColorChange('error', e.target.value)}
                                className={styles.colorInput}
                            />
                        </div>
                        <div className={styles.colorControl}>
                            <label className={styles.colorLabel}>Warning Color</label>
                            <input
                                type="color"
                                value={customColors.warning}
                                onChange={(e) => handleColorChange('warning', e.target.value)}
                                className={styles.colorInput}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Border Thickness Control */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Border Thickness</h3>
                <div className={styles.borderThicknessContainer}>
                    {borderThicknesses.map((option) => (
                        <button
                            key={option.id}
                            className={`${styles.borderThicknessButton} ${
                                borderThickness === option.value ? styles.activeThickness : ""
                            }`}
                            onClick={() => setBorderThickness(option.value)}
                            aria-pressed={borderThickness === option.value}
                        >
                            <div 
                                className={styles.thicknessPreview}
                                style={{ borderWidth: `${option.value}px` }}
                            />
                            <span className={styles.thicknessName}>{option.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Font options */}
            <div className={styles.fontOptions}>
                <h3 className={styles.fontOptionsHeader}>Reading Support</h3>

                <div className={styles.fontToggle}>
                    <span className={styles.toggleLabel}>
                        Dyslexia-Friendly Font
                    </span>
                    <button
                        className={`${styles.toggleSwitch} ${
                            useDyslexiaFont ? styles.toggleSwitchActive : ""
                        }`}
                        onClick={() => setUseDyslexiaFont(!useDyslexiaFont)}
                        role="switch"
                        aria-checked={useDyslexiaFont}
                    >
                        <span
                            className={`${styles.toggleHandle} ${
                                useDyslexiaFont ? styles.toggleHandleActive : ""
                            }`}
                        />
                    </button>
                </div>

                <p className={styles.fontDescription}>
                    {useDyslexiaFont
                        ? "Using OpenDyslexic font to improve readability"
                        : "Using standard font"}
                </p>
            </div>
        </div>
    );
};

export default ThemeSettings;
