/**
 * @file ThemeSettings.jsx
 * @description Component for selecting visual themes with debugging
 */

import React from "react";
import { useCustomization } from "../CustomizationContext";

/**
 * Theme settings component with error handling
 */
const ThemeSettings = () => {
    console.log("ThemeSettings rendering...");

    // Get theme settings from context - add a default in case context is missing
    const contextValue = useCustomization() || {
        theme: "retro",
        setTheme: () => {},
        useDyslexiaFont: false,
        setUseDyslexiaFont: () => {},
    };
    const { theme, setTheme, useDyslexiaFont, setUseDyslexiaFont } =
        contextValue;

    console.log("Current theme from context:", theme);

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
                bg: "#F8F9FA",
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

    // Get current theme preview colors with fallback for safety
    const currentTheme = themes.find((t) => t.id === theme);
    console.log("Found matching theme object:", currentTheme);

    // Default fallback theme if nothing matches (shouldn't happen, but prevents errors)
    const fallbackTheme = {
        preview: {
            bg: "#000000",
            text: "#FFFFFF",
            buttonBg: "#0088FF",
            buttonText: "#FFFFFF",
        },
    };

    // Use a safe theme object that won't cause errors
    const safeTheme = currentTheme || fallbackTheme;
    console.log("Using theme for rendering:", safeTheme);

    return (
        <div className="theme-settings-container">
            <div className="theme-title">Choose Theme</div>

            <div className="themes-container">
                {themes.map((themeOption) => (
                    <button
                        key={themeOption.id}
                        className={`theme-button ${
                            theme === themeOption.id ? "active-theme" : ""
                        }`}
                        onClick={() => {
                            console.log("Setting theme to:", themeOption.id);
                            setTheme(themeOption.id);
                        }}
                        aria-pressed={theme === themeOption.id}
                        style={{
                            border: `2px solid ${
                                theme === themeOption.id
                                    ? "#ff00ff"
                                    : "transparent"
                            }`,
                            backgroundColor: "#333",
                            padding: "12px",
                            margin: "8px",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        <div style={{ display: "flex", marginBottom: "8px" }}>
                            {themeOption.colors.map((color, i) => (
                                <div
                                    key={i}
                                    style={{
                                        backgroundColor: color,
                                        width: "25px",
                                        height: "50px",
                                        marginRight: "4px",
                                        borderRadius: "4px",
                                    }}
                                />
                            ))}
                        </div>
                        <span style={{ color: "white" }}>
                            {themeOption.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Live theme preview using inline styles for safety */}
            <div style={{ marginTop: "20px" }}>
                <div
                    style={{
                        color: "#ff00ff",
                        marginBottom: "8px",
                        fontSize: "18px",
                    }}
                >
                    Preview:
                </div>
                <div
                    style={{
                        backgroundColor: safeTheme.preview.bg,
                        color: safeTheme.preview.text,
                        padding: "16px",
                        borderRadius: "8px",
                        fontFamily: useDyslexiaFont
                            ? "'OpenDyslexic', sans-serif"
                            : theme === "retro"
                            ? "'Kode Mono', monospace"
                            : theme === "pastel"
                            ? "'Georgia', serif"
                            : "'Arial', sans-serif",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "120px",
                    }}
                >
                    <div
                        style={{
                            color: safeTheme.preview.text,
                            fontSize: "20px",
                            fontWeight: "bold",
                            marginBottom: "16px",
                        }}
                    >
                        Robot Controls
                    </div>
                    <button
                        style={{
                            backgroundColor: safeTheme.preview.buttonBg,
                            color: safeTheme.preview.buttonText,
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Forward
                    </button>
                </div>
            </div>

            {/* Font options */}
            <div
                style={{
                    marginTop: "20px",
                    backgroundColor: "#333",
                    padding: "16px",
                    borderRadius: "8px",
                }}
            >
                <h3 style={{ color: "#ff00ff", marginBottom: "16px" }}>
                    Reading Support
                </h3>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                    }}
                >
                    <span style={{ color: "white" }}>
                        Dyslexia-Friendly Font
                    </span>
                    <button
                        onClick={() => {
                            console.log(
                                "Toggling dyslexia font:",
                                !useDyslexiaFont,
                            );
                            setUseDyslexiaFont(!useDyslexiaFont);
                        }}
                        // aria-pressed={useDyslexiaFont}
                        role="switch"
                        aria-checked={useDyslexiaFont}
                        style={{
                            position: "relative",
                            width: "48px",
                            height: "24px",
                            borderRadius: "12px",
                            backgroundColor: useDyslexiaFont
                                ? "#c026d3"
                                : "#666",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "2px",
                                left: useDyslexiaFont ? "26px" : "2px",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                backgroundColor: "white",
                                transition: "all 0.25s ease",
                            }}
                        ></div>
                    </button>
                </div>

                <p style={{ color: "#999", fontSize: "14px" }}>
                    {useDyslexiaFont
                        ? "Using OpenDyslexic font to improve readability"
                        : "Using standard font"}
                </p>
            </div>
        </div>
    );
};

export default ThemeSettings;
