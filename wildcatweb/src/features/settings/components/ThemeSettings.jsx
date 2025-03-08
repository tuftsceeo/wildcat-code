/**
 * @file ThemeSettings.jsx
 * @description Component for selecting visual themes with theme variable support
 */

import React from "react";
import { useCustomization } from "../../../context/CustomizationContext";
import styles from "../styles/ThemeSettings.module.css";

/**
 * Theme settings component with proper theme variable usage
 */
const ThemeSettings = () => {
    // Get theme settings from context
    const { theme, setTheme, useDyslexiaFont, setUseDyslexiaFont } =
        useCustomization();

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

            {/*  <div className={styles.previewContainer}>
                <div className={styles.previewTitle}>Preview:</div>
                <div
                    className={styles.previewContent}
                    style={{
                        backgroundColor:
                            themes.find((t) => t.id === theme)?.preview.bg ||
                            "#000000",
                    }}
                >
                    <div className={styles.previewHeader}>Robot Controls</div>
                    <button
                        className={styles.previewButton}
                        style={{
                            backgroundColor:
                                themes.find((t) => t.id === theme)?.preview
                                    .buttonBg || "#00bfff",
                            color:
                                themes.find((t) => t.id === theme)?.preview
                                    .buttonText || "#ffffff",
                        }}
                    >
                        Forward
                    </button>
                </div>
            </div> */}

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
