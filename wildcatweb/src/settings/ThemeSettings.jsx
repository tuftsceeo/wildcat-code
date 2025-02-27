/**
 * @file ThemeSettings.jsx
 * @description Component for selecting visual themes and accessibility font options
 * with live preview of how the UI will appear with the selected options.
 * @author Claude
 */

import React, { useState } from "react";
import styles from "./ThemeSettings.module.css";
import { useCustomization } from "./CustomizationContext";

/**
 * Theme settings component with live preview
 *
 * @component
 * @returns {JSX.Element} Theme settings panel
 */
const ThemeSettings = () => {
    // Get theme settings from context
    const { theme, setTheme, useDyslexiaFont, setUseDyslexiaFont } =
        useCustomization();

    // Define available themes
    const themes = [
        {
            id: "retro",
            name: "Neon",
            colors: ["#00ff00", "#00aaff", "#ff00ff"],
            preview: {
                bg: "#000000",
                text: "#00ff00",
                buttonBg: "#00aaff",
                buttonText: "#000000",
            },
        },
        {
            id: "pastel",
            name: "Pastel",
            colors: ["#78C2AD", "#6CC3D5", "#F3969A"],
            preview: {
                bg: "#F8F9FA",
                text: "#3E4551",
                buttonBg: "#78C2AD",
                buttonText: "#FFFFFF",
            },
        },
        {
            id: "clean",
            name: "Clean",
            colors: ["#00AA55", "#0066CC", "#FF6600"],
            preview: {
                bg: "#FFFFFF",
                text: "#000000",
                buttonBg: "#00AA55",
                buttonText: "#FFFFFF",
            },
        },
    ];

    // Get current theme preview colors
    const currentTheme = themes.find((t) => t.id === theme) || themes[0];

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

            {/* Live theme preview */}
            <div className={styles.previewContainer}>
                <div className={styles.previewTitle}>Preview:</div>
                <div
                    className={styles.previewContent}
                    style={{
                        backgroundColor: currentTheme.preview.bg,
                        fontFamily: useDyslexiaFont
                            ? "'OpenDyslexic', sans-serif"
                            : "'Kode Mono', monospace",
                    }}
                >
                    <div
                        className={styles.previewHeader}
                        style={{ color: currentTheme.preview.text }}
                    >
                        Robot Controls
                    </div>
                    <button
                        className={styles.previewButton}
                        style={{
                            backgroundColor: currentTheme.preview.buttonBg,
                            color: currentTheme.preview.buttonText,
                        }}
                    >
                        Forward
                    </button>
                </div>
            </div>

            {/* Font options */}
            <div className={styles.fontOptions}>
                <h3 className={styles.fontOptionsHeader}>Reading Support</h3>

                <div className={styles.fontToggle}>
                    <span className={styles.toggleLabel}>
                        Easy-to-Read Font
                    </span>
                    <button
                        className={`${styles.toggleSwitch} ${
                            useDyslexiaFont ? styles.toggleSwitchActive : ""
                        }`}
                        onClick={() => setUseDyslexiaFont(!useDyslexiaFont)}
                        aria-pressed={useDyslexiaFont}
                        role="switch"
                        aria-checked={useDyslexiaFont}
                    >
                        <div
                            className={`${styles.toggleHandle} ${
                                useDyslexiaFont ? styles.toggleHandleActive : ""
                            }`}
                        ></div>
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
