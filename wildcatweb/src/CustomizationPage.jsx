/**
 * @file CustomizationPage.jsx
 * @description Enhanced customization page with carousel navigation for settings
 * based on the improved design from improved-settings-carousel.tsx.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

import React, { useState, useRef, useEffect } from "react";
import {
    XCircle,
    X,
    Type,
    Palette,
    Volume2,
    Layers,
    Globe,
    Accessibility,
    UserRound,
    Users,
    Check,
    RotateCcw,
} from "lucide-react";
import styles from "./CustomizationPage.module.css";
import Portal from "./Portal";
import { useCustomization } from "./CustomizationContext";

/**
 * Enhanced customization page with carousel navigation for settings
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.close - Function to close the customization panel
 * @returns {JSX.Element} Customization settings interface
 */
const CustomizationPage = ({ close }) => {
    // State for the active tab index
    const [activeTab, setActiveTab] = useState(0);

    // Create a ref for the panel to detect outside clicks
    const panelRef = useRef(null);

    // Define all settings tabs with their properties
    const tabs = [
        {
            id: "reading",
            icon: <Type size={32} />,
            name: "Reading",
            color: "#00ff00",
            available: true,
            priority: "high",
        },
        {
            id: "themes",
            icon: <Palette size={32} />,
            name: "Theme",
            color: "#ff00ff",
            available: true,
            priority: "high",
        },
        {
            id: "voice",
            icon: <Volume2 size={32} />,
            name: "Voice",
            color: "#ff7700",
            available: false,
            priority: "high",
        },
        {
            id: "steps",
            icon: <Layers size={32} />,
            name: "Steps",
            color: "#00ddff",
            available: false,
            priority: "high",
        },
        {
            id: "language",
            icon: <Globe size={32} />,
            name: "Language",
            color: "#0088ff",
            available: false,
            priority: "medium",
        },
        {
            id: "access",
            icon: <Accessibility size={32} />,
            name: "Help",
            color: "#ffdd00",
            available: false,
            priority: "medium",
        },
        {
            id: "profiles",
            icon: <UserRound size={32} />,
            name: "Profiles",
            color: "#888888",
            available: false,
            priority: "low",
        },
        {
            id: "groups",
            icon: <Users size={32} />,
            name: "Groups",
            color: "#888888",
            available: false,
            priority: "low",
        },
    ];

    // Handle clicks outside the panel to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                close();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [close]);

    // Handle tab navigation
    const handlePrevTab = () => {
        setActiveTab((prev) => (prev > 0 ? prev - 1 : tabs.length - 1));
    };

    const handleNextTab = () => {
        setActiveTab((prev) => (prev < tabs.length - 1 ? prev + 1 : 0));
    };

    /**
     * Settings Carousel component
     */
    /**
     * Settings Carousel component for tab navigation
     * This internal component provides the carousel navigation UI
     */
    const SettingsCarousel = ({ tabs, activeTab, setActiveTab }) => {
        return (
            <div className={styles.carouselContainer}>
                <button
                    className={`${styles.navButton} ${styles.prevButton}`}
                    onClick={handlePrevTab}
                    aria-label="Previous tab"
                >
                    <div className={styles.navButtonIcon}>&lt;</div>
                </button>

                <div className={styles.tabsContainer}>
                    {tabs.map((tab, index) => {
                        // Calculate position relative to active tab for carousel effect
                        const position = index - activeTab;
                        const isDisabled = !tab.available;

                        return (
                            <button
                                key={tab.id}
                                className={`${styles.tabButton} 
                           ${
                               index === activeTab
                                   ? styles.tabActive
                                   : styles.tabInactive
                           }
                           ${isDisabled ? styles.tabDisabled : ""}`}
                                onClick={() =>
                                    !isDisabled && setActiveTab(index)
                                }
                                disabled={isDisabled}
                                style={{
                                    borderColor:
                                        index === activeTab
                                            ? tab.color
                                            : "transparent",
                                }}
                                aria-label={`${tab.name} settings tab${
                                    isDisabled ? " (coming soon)" : ""
                                }`}
                                aria-selected={index === activeTab}
                                role="tab"
                            >
                                <div
                                    className={styles.tabIcon}
                                    style={{ color: tab.color }}
                                >
                                    {tab.icon}
                                </div>
                                <span className={styles.tabLabel}>
                                    {tab.name}
                                </span>

                                {isDisabled && (
                                    <span className={styles.disabledBadge}>
                                        Coming Soon
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <button
                    className={`${styles.navButton} ${styles.nextButton}`}
                    onClick={handleNextTab}
                    aria-label="Next tab"
                >
                    <div className={styles.navButtonIcon}>&gt;</div>
                </button>
            </div>
        );
    };

    /**
     * Reading Level Settings Panel
     */
    const ReadingLevelSettings = () => {
        // Default to intermediate level for most users
        const [selectedLevel, setSelectedLevel] = useState("intermediate");

        // Define reading complexity levels
        const levels = [
            {
                id: "icon_only",
                icon: "🖼️",
                name: "Pictures",
            },
            {
                id: "beginner",
                icon: "🔤",
                name: "Simple",
            },
            {
                id: "intermediate",
                icon: "📝",
                name: "Medium",
            },
            {
                id: "advanced",
                icon: "📚",
                name: "Full Text",
            },
        ];

        // Get current level description
        const currentDescription = "";

        // Define preview content for each level
        const renderPreview = () => {
            switch (selectedLevel) {
                case "icon_only":
                    return (
                        <div className={styles.iconOnlyPreview}>
                            <span>🤖</span>
                            <span>➡️</span>
                            <span>💨</span>
                        </div>
                    );
                case "beginner":
                    return (
                        <div className={styles.beginnerPreview}>
                            <span className={styles.beginnerIcon}>➡️</span>
                            <span className={styles.beginnerText}>
                                Robot Move Fast
                            </span>
                        </div>
                    );
                case "intermediate":
                    return (
                        <span className={styles.intermediatePreview}>
                            The robot moves forward at high speed.
                        </span>
                    );
                case "advanced":
                    return (
                        <div className={styles.advancedPreview}>
                            The robot will activate its motors to move forward
                            at maximum speed in a straight line.
                        </div>
                    );
                default:
                    return null;
            }
        };

        return (
            <div className={styles.settingsPanel}>
                <div
                    className={styles.panelTitle}
                    style={{ color: "#00ff00" }}
                >
                    Reading Level
                </div>

                <div className={styles.optionsContainer}>
                    {levels.map((level) => (
                        <button
                            key={level.id}
                            className={`${styles.optionButton} ${
                                selectedLevel === level.id
                                    ? styles.activeOption
                                    : ""
                            }`}
                            onClick={() => setSelectedLevel(level.id)}
                            aria-pressed={selectedLevel === level.id}
                            style={{
                                borderColor:
                                    selectedLevel === level.id
                                        ? "#00ff00"
                                        : "transparent",
                            }}
                        >
                            <div className={styles.optionIcon}>
                                {level.icon}
                            </div>
                            <span className={styles.optionLabel}>
                                {level.name}
                            </span>
                        </button>
                    ))}
                </div>

                <div className={styles.description}>{currentDescription}</div>

                <div className={styles.previewContainer}>
                    <div
                        className={styles.previewTitle}
                        style={{ color: "#00ff00" }}
                    >
                        Preview:
                    </div>
                    <div className={styles.previewContent}>
                        {renderPreview()}
                    </div>
                    <div className={styles.previewNote}>
                        This is how instructions will appear in the app
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Theme Settings Panel
     */
    const ThemeSettings = () => {
        // Use context to get and set theme settings (once context is set up)
        // If not using context yet, use local state
        const [selectedTheme, setSelectedTheme] = useState("retro");
        const [fontSetting, setFontSetting] = useState(false);

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
                id: "themes",
                name: "Theme",
                colors: [
                    {
                        id: "retro",
                        name: "Neon",
                        colors: ["#00ff00", "#00aaff", "#ff00ff"],
                    },
                    {
                        id: "pastel",
                        name: "Pastel",
                        colors: ["#78C2AD", "#6CC3D5", "#F3969A"],
                    },
                    {
                        id: "clean",
                        name: "Clean",
                        colors: ["#00AA55", "#0066CC", "#FF6600"],
                    },
                ],
            },
        ];

        // Get current theme preview colors
        const currentTheme =
            themes.find((t) => t.id === selectedTheme) || themes[0];

        return (
            <div className={styles.settingsPanel}>
                <div
                    className={styles.panelTitle}
                    style={{ color: "#ff00ff" }}
                >
                    Choose Theme
                </div>

                <div className={styles.themesContainer}>
                    {themes.map((themeOption) => (
                        <button
                            key={themeOption.id}
                            className={`${styles.themeButton} ${
                                selectedTheme === themeOption.id
                                    ? styles.activeTheme
                                    : ""
                            }`}
                            onClick={() => setSelectedTheme(themeOption.id)}
                            aria-pressed={selectedTheme === themeOption.id}
                            style={{
                                borderColor:
                                    selectedTheme === themeOption.id
                                        ? "#ff00ff"
                                        : "transparent",
                            }}
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
                    <div
                        className={styles.previewTitle}
                        style={{ color: "#ff00ff" }}
                    >
                        Preview:
                    </div>
                    <div
                        className={styles.previewContent}
                        style={{
                            backgroundColor: currentTheme.preview.bg,
                            fontFamily: fontSetting
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
                    <h3
                        className={styles.fontOptionsHeader}
                        style={{ color: "#ff00ff" }}
                    >
                        Reading Support
                    </h3>

                    <div className={styles.fontToggle}>
                        <span className={styles.toggleLabel}>
                            Easy-to-Read Font
                        </span>
                        <button
                            className={`${styles.toggleSwitch} ${
                                fontSetting ? styles.toggleSwitchActive : ""
                            }`}
                            onClick={() => setFontSetting(!fontSetting)}
                            aria-pressed={fontSetting}
                            role="switch"
                            aria-checked={fontSetting}
                            style={{
                                backgroundColor: fontSetting
                                    ? "#c026d3"
                                    : "var(--color-gray-600)",
                            }}
                        >
                            <div
                                className={`${styles.toggleHandle} ${
                                    fontSetting ? styles.toggleHandleActive : ""
                                }`}
                            ></div>
                        </button>
                    </div>

                    <p className={styles.fontDescription}>
                        {fontSetting
                            ? "Using OpenDyslexic font to improve readability"
                            : "Using standard font"}
                    </p>
                </div>
            </div>
        );
    };

    /**
     * Placeholder for features under development
     */
    const PlaceholderSettings = ({ feature }) => {
        // Messages based on priority
        const getMessage = () => {
            switch (feature.priority) {
                case "high":
                    return "This feature is almost ready and will be available soon!";
                case "medium":
                    return "This feature is currently under development and will be available in a future update.";
                case "low":
                default:
                    return "This feature is planned for a future release of the application.";
            }
        };

        return (
            <div className={styles.placeholderContainer}>
                <div
                    className={styles.placeholderIcon}
                    style={{ color: feature.color }}
                >
                    {feature.icon}
                </div>

                <h3 className={styles.placeholderTitle}>{feature.name}</h3>

                <p className={styles.placeholderMessage}>{getMessage()}</p>

                <div className={styles.comingSoonBadge}>
                    <RotateCcw size={16} />
                    <span>Coming Soon</span>
                </div>
            </div>
        );
    };

    // Render current tab content based on activeTab
    const renderTabContent = () => {
        const currentTab = tabs[activeTab];

        // If feature is not available, show placeholder
        if (!currentTab.available) {
            return <PlaceholderSettings feature={currentTab} />;
        }

        // Otherwise, render the appropriate settings panel
        switch (currentTab.id) {
            case "reading":
                return <ReadingLevelSettings />;
            case "themes":
                return <ThemeSettings />;
            default:
                return <PlaceholderSettings feature={currentTab} />;
        }
    };

    return (
        <Portal>
            <div className={styles.customizationOverlay}>
                <div
                    className={styles.customizationPanel}
                    ref={panelRef}
                >
                    {/* Header with title and close button */}
                    <div className={styles.settingsHeader}>
                        <button
                            className={styles.closeButton}
                            onClick={close}
                            aria-label="Close settings"
                        >
                            <X size={24} />
                        </button>
                        <h1 className={styles.settingsTitle}>SETTINGS</h1>
                    </div>

                    {/* Settings tabs carousel navigation */}
                    <SettingsCarousel
                        tabs={tabs}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {/* Content area for the active tab */}
                    <div className={styles.settingsContent}>
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default CustomizationPage;
