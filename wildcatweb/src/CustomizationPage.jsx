/**
 * @file CustomizationPage.jsx
 * @description Settings and customization modal for adjusting app preferences,
 * including themes, reading levels, accessibility options, and more.
 * @author Jennifer Cross, Claude
 * @created February 2025
 */

import React, { useState, useEffect, useRef } from "react";
import Portal from "./Portal.js";
import { XCircle, ChevronLeft } from "lucide-react";
import styles from "./CustomizationPage.module.css";

// Import icons
import accessibilityIcon from "./assets/accessibility-icon.svg";
import bookIcon from "./assets/book.svg";
import groupsIcon from "./assets/group-mode.svg";
import profilesIcon from "./assets/profiles.svg";
import soundsIcon from "./assets/sounds.svg";
import stepsIcon from "./assets/steps.svg";
import lineIcon from "./assets/settings-line.svg";

/**
 * Priority levels for visual distinction:
 * - HIGH: Feature under active development, coming soon
 * - MEDIUM: Planned feature with partial implementation
 * - LOW: Future feature placeholders
 */
const PRIORITY = {
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
};

/**
 * Settings categories with their configurations
 */
const SETTINGS = [
    {
        id: "reading",
        title: "Reading Level",
        description: "Control reading difficulty and non-reader version",
        icon: bookIcon,
        priority: PRIORITY.HIGH,
        content: "Adjust text complexity from icon-only to text-only",
        infoLink: "reading-complexity",
        hasDemo: true,
    },
    {
        id: "themes",
        title: "Visual Theme",
        description: "Choose your preferred visual style",
        icon: null, // We'll use a different approach for this icon (color swatches)
        priority: PRIORITY.HIGH,
        content: "Select from retro, pastel, and clean themes",
        infoLink: "themes",
        hasDemo: true,
    },
    {
        id: "voice",
        title: "Robot Voice",
        description: "Select voice style for audio feedback",
        icon: soundsIcon,
        priority: PRIORITY.HIGH,
        content: "Choose from ROBBY, Z-BOT, TINCAN, and BIT-8",
        infoLink: "voice-options",
        hasDemo: true,
    },
    {
        id: "steps",
        title: "Step Count",
        description: "Set difficulty level by adjusting step count",
        icon: stepsIcon,
        priority: PRIORITY.HIGH,
        content: "Customize the number of steps in your coding journey",
        infoLink: "step-count",
        hasDemo: false,
    },
    {
        id: "language",
        title: "Language",
        description: "Change the interface language",
        icon: null, // Will use a language icon/globe
        priority: PRIORITY.MEDIUM,
        content: "English, Spanish, Haitian Creole (coming soon)",
        infoLink: "languages",
        hasDemo: false,
    },
    {
        id: "accessibility",
        title: "Accessibility",
        description: "Adjust for different abilities and needs",
        icon: accessibilityIcon,
        priority: PRIORITY.MEDIUM,
        content: "Font size, color contrast, screen reader support",
        infoLink: "accessibility",
        hasDemo: false,
    },
    {
        id: "profiles",
        title: "Profiles",
        description: "Save and track student profiles and progress",
        icon: profilesIcon,
        priority: PRIORITY.LOW,
        content: "Student and teacher profiles (coming in future update)",
        infoLink: "profiles",
        hasDemo: false,
    },
    {
        id: "groupMode",
        title: "Group Mode",
        description: "Connect student devices to the teacher panel",
        icon: groupsIcon,
        priority: PRIORITY.LOW,
        content: "Classroom collaboration features (future release)",
        infoLink: "group-mode",
        hasDemo: false,
    },
    {
        id: "motorControls",
        title: "Motor Controls",
        description: "Customize motor speed and feedback",
        icon: null, // Would need a motor icon
        priority: PRIORITY.LOW,
        content: "Adjust default settings and visualizations",
        infoLink: "motor-controls",
        hasDemo: false,
    },
];

/**
 * Reading Level Options component displayed in the Reading detail view
 * @returns {JSX.Element} Reading level options UI
 */
const ReadingLevelOptions = () => {
    const [selectedLevel, setSelectedLevel] = useState("intermediate");

    const levels = [
        {
            id: "icon_only",
            name: "Icon Only",
            description: "Minimal text with maximum icons",
        },
        {
            id: "beginner",
            name: "Beginner",
            description: "Simple words with large icons",
        },
        {
            id: "intermediate",
            name: "Intermediate",
            description: "Complete sentences with icons",
        },
        {
            id: "advanced",
            name: "Advanced",
            description: "Detailed text with small icons",
        },
        {
            id: "text_only",
            name: "Text Only",
            description: "Full text without icons",
        },
    ];

    return (
        <div className={styles.readingLevelContainer}>
            <h3 className={styles.sectionTitle}>Text Complexity</h3>
            <div className={styles.levelOptions}>
                {levels.map((level) => (
                    <button
                        key={level.id}
                        className={`${styles.levelButton} ${
                            selectedLevel === level.id ? styles.active : ""
                        }`}
                        onClick={() => setSelectedLevel(level.id)}
                    >
                        {level.name}
                    </button>
                ))}
            </div>
            <p className={styles.levelDescription}>
                {levels.find((l) => l.id === selectedLevel)?.description}
            </p>

            <div className={styles.previewContainer}>
                <h3 className={styles.sectionTitle}>Preview</h3>
                <div className={styles.levelPreview}>
                    {selectedLevel === "icon_only" && (
                        <div className={styles.iconPreview}>
                            <span className={styles.previewIcon}>→</span>
                            <span className={styles.previewIcon}>⚡</span>
                            <span className={styles.previewIcon}>🔄</span>
                        </div>
                    )}
                    {selectedLevel === "beginner" && (
                        <div className={styles.beginnerPreview}>
                            <span
                                className={`${styles.previewIcon} ${styles.small}`}
                            >
                                →
                            </span>
                            <span>Motor Forward Fast</span>
                        </div>
                    )}
                    {selectedLevel === "intermediate" && (
                        <div className={styles.intermediatePreview}>
                            <span
                                className={`${styles.previewIcon} ${styles.small}`}
                            >
                                →
                            </span>
                            <span>Motor A spins forward fast.</span>
                        </div>
                    )}
                    {selectedLevel === "advanced" && (
                        <div className={styles.advancedPreview}>
                            <span
                                className={`${styles.previewIcon} ${styles.tiny}`}
                            >
                                →
                            </span>
                            <span>
                                Motor A will rotate in the forward direction at
                                fast speed.
                            </span>
                        </div>
                    )}
                    {selectedLevel === "text_only" && (
                        <div className={styles.textPreview}>
                            <span>
                                The Motor A motor will rotate in the forward
                                direction at fast speed. This will move the
                                robot accordingly.
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Theme Options component displayed in the Themes detail view
 * @returns {JSX.Element} Theme selection UI
 */
const ThemeOptions = () => {
    const [selectedTheme, setSelectedTheme] = useState("retro");
    const [useDyslexiaFont, setUseDyslexiaFont] = useState(false);

    const themes = [
        {
            id: "retro",
            name: "RETRO",
            description: "Neon arcade style with vibrant animations",
            colors: ["#00FF00", "#0088FF", "#FF00FF"],
        },
        {
            id: "pastel",
            name: "PASTEL",
            description: "Soft colors with gentle contrast",
            colors: ["#78C2AD", "#6CC3D5", "#F3969A"],
        },
        {
            id: "clean",
            name: "CLEAN",
            description: "High contrast with clean layout",
            colors: ["#00AA55", "#0066CC", "#FF6600"],
        },
    ];

    return (
        <div className={styles.themeOptionsContainer}>
            <h3 className={styles.sectionTitle}>Visual Theme</h3>
            <div className={styles.themeButtons}>
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        className={`${styles.themeButton} ${
                            selectedTheme === theme.id ? styles.active : ""
                        }`}
                        onClick={() => setSelectedTheme(theme.id)}
                    >
                        <div className={styles.themeColorPreview}>
                            {theme.colors.map((color, index) => (
                                <div
                                    key={index}
                                    className={styles.colorSwatch}
                                    style={{ backgroundColor: color }}
                                ></div>
                            ))}
                        </div>
                        <span className={styles.themeName}>{theme.name}</span>
                    </button>
                ))}
            </div>
            <p className={styles.themeDescription}>
                {themes.find((t) => t.id === selectedTheme)?.description}
            </p>

            <div className={styles.fontOptions}>
                <h3 className={styles.sectionTitle}>Reading Support</h3>
                <button
                    className={`${styles.dyslexiaToggle} ${
                        useDyslexiaFont ? styles.active : ""
                    }`}
                    onClick={() => setUseDyslexiaFont(!useDyslexiaFont)}
                >
                    <span>Dyslexia-Friendly Font</span>
                    <div className={styles.toggleSwitch}>
                        <div
                            className={styles.toggleHandle}
                            style={{
                                transform: useDyslexiaFont
                                    ? "translateX(20px)"
                                    : "translateX(0)",
                            }}
                        ></div>
                    </div>
                </button>
                <p className={styles.fontDescription}>
                    {useDyslexiaFont
                        ? "Using OpenDyslexic font to improve readability"
                        : "Using standard font"}
                </p>
            </div>
        </div>
    );
};

/**
 * Voice Options component displayed in the Voice detail view
 * @returns {JSX.Element} Voice selection UI
 */
const VoiceOptions = () => {
    const [selectedVoice, setSelectedVoice] = useState("robot1");
    const [testText, setTestText] = useState("Motor A spins forward fast.");

    const voices = [
        {
            id: "robot1",
            name: "ROBBY",
            icon: "🤖",
            color: "#00AAFF",
            characteristics: { speed: "Normal", pitch: "Low", style: "Choppy" },
        },
        {
            id: "robot2",
            name: "Z-BOT",
            icon: "⚡",
            color: "#FFAA00",
            characteristics: { speed: "Fast", pitch: "Low", style: "Smooth" },
        },
        {
            id: "robot3",
            name: "TINCAN",
            icon: "🔊",
            color: "#FF5500",
            characteristics: { speed: "Slow", pitch: "High", style: "Choppy" },
        },
        {
            id: "robot4",
            name: "BIT-8",
            icon: "👾",
            color: "#55FF55",
            characteristics: {
                speed: "Slow",
                pitch: "Medium",
                style: "Choppy",
            },
        },
    ];

    const handlePlayVoice = () => {
        // In a real implementation, this would use the Speech Synthesis API
        console.log(`Playing voice sample with ${selectedVoice}`);
    };

    return (
        <div className={styles.voiceOptionsContainer}>
            <h3 className={styles.sectionTitle}>Robot Voice</h3>
            <div className={styles.voiceGrid}>
                {voices.map((voice) => (
                    <button
                        key={voice.id}
                        className={`${styles.voiceButton} ${
                            selectedVoice === voice.id ? styles.active : ""
                        }`}
                        onClick={() => setSelectedVoice(voice.id)}
                        style={{ borderColor: voice.color }}
                    >
                        <div
                            className={styles.voiceIcon}
                            style={{ backgroundColor: voice.color }}
                        >
                            {voice.icon}
                        </div>
                        <span className={styles.voiceName}>{voice.name}</span>
                    </button>
                ))}
            </div>

            <div className={styles.voicePreview}>
                <div className={styles.voiceTest}>
                    <div className={styles.testBox}>
                        <p>{testText}</p>
                        <button
                            className={styles.playButton}
                            onClick={handlePlayVoice}
                            style={{
                                backgroundColor: voices.find(
                                    (v) => v.id === selectedVoice,
                                )?.color,
                            }}
                        >
                            <span>
                                {
                                    voices.find((v) => v.id === selectedVoice)
                                        ?.icon
                                }
                            </span>
                            <span>PLAY</span>
                        </button>
                    </div>
                </div>

                <div className={styles.voiceCharacteristics}>
                    <h3 className={styles.sectionTitle}>
                        {voices.find((v) => v.id === selectedVoice)?.icon}{" "}
                        {voices.find((v) => v.id === selectedVoice)?.name}{" "}
                        CHARACTERISTICS
                    </h3>
                    <div className={styles.characteristicsGrid}>
                        {Object.entries(
                            voices.find((v) => v.id === selectedVoice)
                                ?.characteristics || {},
                        ).map(([key, value]) => (
                            <div
                                key={key}
                                className={styles.characteristic}
                            >
                                <span className={styles.characteristicLabel}>
                                    {key}:
                                </span>
                                <span className={styles.characteristicValue}>
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Steps Configuration component displayed in the Steps detail view
 * @returns {JSX.Element} Step count configuration UI
 */
const StepsConfiguration = () => {
    const [stepCount, setStepCount] = useState(3);

    const handleStepCountChange = (count) => {
        setStepCount(Math.max(1, Math.min(10, count)));
    };

    return (
        <div className={styles.stepsContainer}>
            <h3 className={styles.sectionTitle}>Step Count Configuration</h3>
            <p className={styles.stepsDescription}>
                Control the number of steps in each coding journey to match
                learning needs.
            </p>

            <div className={styles.stepCountControl}>
                <button
                    className={styles.stepButton}
                    onClick={() => handleStepCountChange(stepCount - 1)}
                    disabled={stepCount <= 1}
                >
                    -
                </button>
                <div className={styles.stepCount}>{stepCount}</div>
                <button
                    className={styles.stepButton}
                    onClick={() => handleStepCountChange(stepCount + 1)}
                    disabled={stepCount >= 10}
                >
                    +
                </button>
            </div>

            <div className={styles.stepPreview}>
                <h3 className={styles.sectionTitle}>Preview</h3>
                <div className={styles.stepDots}>
                    {[...Array(stepCount)].map((_, i) => (
                        <div
                            key={i}
                            className={styles.stepDot}
                        ></div>
                    ))}
                </div>
                <p className={styles.stepExplanation}>
                    Each dot represents one step in the coding sequence.
                    {stepCount < 3 && " Fewer steps are good for beginners."}
                    {stepCount >= 3 &&
                        stepCount <= 5 &&
                        " This is a balanced difficulty."}
                    {stepCount > 5 &&
                        " More steps provide advanced challenges."}
                </p>
            </div>
        </div>
    );
};

/**
 * Language Options component displayed in the Language detail view
 * @returns {JSX.Element} Language selection UI
 */
const LanguageOptions = () => {
    const [selectedLanguage, setSelectedLanguage] = useState("english");

    const languages = [
        { id: "english", name: "English", available: true },
        { id: "spanish", name: "Español", available: true },
        { id: "creole", name: "Kreyòl Ayisyen", available: false },
    ];

    return (
        <div className={styles.languageOptionsContainer}>
            <h3 className={styles.sectionTitle}>Select Language</h3>
            <div className={styles.languageButtons}>
                {languages.map((language) => (
                    <button
                        key={language.id}
                        className={`${styles.languageButton} ${
                            selectedLanguage === language.id
                                ? styles.active
                                : ""
                        } ${!language.available ? styles.disabled : ""}`}
                        onClick={() =>
                            language.available &&
                            setSelectedLanguage(language.id)
                        }
                        disabled={!language.available}
                    >
                        {language.name}
                        {!language.available && (
                            <span className={styles.comingSoon}>
                                Coming Soon
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <p className={styles.languageDescription}>
                {selectedLanguage === "english" &&
                    "All interface elements and robot commands will be displayed in English."}
                {selectedLanguage === "spanish" &&
                    "Todos los elementos de la interfaz y los comandos del robot se mostrarán en español."}
            </p>
        </div>
    );
};

/**
 * Default placeholder content for low-priority or unimplemented features
 * @param {Object} props Component props
 * @param {Object} props.setting The setting configuration object
 * @returns {JSX.Element} Placeholder content UI
 */
const PlaceholderContent = ({ setting }) => {
    return (
        <div className={styles.placeholderContainer}>
            <div className={styles.placeholderIcon}>
                <img
                    src={setting.icon}
                    alt={setting.title}
                />
            </div>
            <h3 className={styles.sectionTitle}>{setting.title}</h3>
            <p className={styles.placeholderDescription}>
                {setting.description}
            </p>
            <div className={styles.featureStatus}>
                {setting.priority === PRIORITY.LOW ? (
                    <div className={`${styles.statusBadge} ${styles.low}`}>
                        Coming in Future Update
                    </div>
                ) : (
                    <div className={`${styles.statusBadge} ${styles.medium}`}>
                        In Development
                    </div>
                )}
            </div>
            <p className={styles.placeholderContent}>{setting.content}</p>
        </div>
    );
};

/**
 * CustomizationPage component - Main settings modal
 * @param {Object} props Component props
 * @param {Function} props.close Callback to close the settings modal
 * @returns {JSX.Element} Settings modal UI
 */
export const CustomizationPage = ({ close }) => {
    console.log("CustomizationPage rendering", { close });
    const [currentView, setCurrentView] = useState("main");
    const popupRef = useRef(null);

    // Handle clicks outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                close();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [close]);

    // Return to main view
    const handleBack = () => {
        setCurrentView("main");
    };

    // Render specific content based on current view
    const renderContent = () => {
        // If not on main view, show the detail view for the selected setting
        if (currentView !== "main") {
            const setting = SETTINGS.find((s) => s.id === currentView);

            if (!setting) return null;

            return (
                <div className={styles.settingDetailView}>
                    <button
                        className={styles.backButton}
                        onClick={handleBack}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <h2 className={styles.detailTitle}>{setting.title}</h2>

                    {/* Render specific content based on setting ID */}
                    {currentView === "reading" && <ReadingLevelOptions />}
                    {currentView === "themes" && <ThemeOptions />}
                    {currentView === "voice" && <VoiceOptions />}
                    {currentView === "steps" && <StepsConfiguration />}
                    {currentView === "language" && <LanguageOptions />}
                    {![
                        "reading",
                        "themes",
                        "voice",
                        "steps",
                        "language",
                    ].includes(currentView) && (
                        <PlaceholderContent setting={setting} />
                    )}
                </div>
            );
        }

        // Main settings grid view
        return (
            <div className={styles.settingsMainView}>
                <div className={styles.settingsHeader}>
                    <h1 className={styles.settingsTitle}>SETTINGS</h1>
                    <button
                        className={styles.closeButton}
                        onClick={close}
                    >
                        <XCircle size={28} />
                    </button>
                </div>

                <img
                    src={lineIcon}
                    alt="Divider"
                    className={styles.divider}
                />

                <div className={styles.settingsGrid}>
                    {SETTINGS.map((setting) => (
                        <button
                            key={setting.id}
                            className={`${styles.settingBox} ${
                                styles[
                                    `priority${
                                        setting.priority
                                            .charAt(0)
                                            .toUpperCase() +
                                        setting.priority.slice(1)
                                    }`
                                ]
                            }`}
                            onClick={() => setCurrentView(setting.id)}
                        >
                            <div className={styles.settingContent}>
                                {/* Icon display */}
                                {setting.id === "themes" ? (
                                    <div className={styles.themeSwatches}>
                                        <div
                                            className={styles.swatch}
                                            style={{
                                                backgroundColor: "#00FF00",
                                            }}
                                        ></div>
                                        <div
                                            className={styles.swatch}
                                            style={{
                                                backgroundColor: "#0088FF",
                                            }}
                                        ></div>
                                        <div
                                            className={styles.swatch}
                                            style={{
                                                backgroundColor: "#FF00FF",
                                            }}
                                        ></div>
                                    </div>
                                ) : setting.id === "language" ? (
                                    <div className={styles.languageIcon}>
                                        <span>En</span>
                                        <span>Es</span>
                                    </div>
                                ) : setting.id === "motorControls" ? (
                                    <div className={styles.motorIcon}>⚙️</div>
                                ) : (
                                    <img
                                        src={setting.icon}
                                        alt={setting.title}
                                        className={styles.settingIcon}
                                    />
                                )}

                                {/* Setting text */}
                                <div className={styles.settingText}>
                                    <h3 className={styles.settingTitle}>
                                        {setting.title}
                                    </h3>
                                    <p className={styles.settingDescription}>
                                        {setting.description}
                                    </p>
                                </div>
                            </div>

                            {/* Status badges for different priorities */}
                            {setting.priority === PRIORITY.HIGH &&
                                setting.hasDemo && (
                                    <div
                                        className={`${styles.statusBadge} ${styles.high}`}
                                    >
                                        Demo Available
                                    </div>
                                )}
                            {setting.priority === PRIORITY.HIGH &&
                                !setting.hasDemo && (
                                    <div
                                        className={`${styles.statusBadge} ${styles.high}`}
                                    >
                                        Coming Soon
                                    </div>
                                )}
                            {setting.priority === PRIORITY.MEDIUM && (
                                <div
                                    className={`${styles.statusBadge} ${styles.medium}`}
                                >
                                    In Development
                                </div>
                            )}
                            {setting.priority === PRIORITY.LOW && (
                                <div
                                    className={`${styles.statusBadge} ${styles.low}`}
                                >
                                    Future Feature
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Portal>
            <div className={styles.customizationOverlay}>
                <div
                    className={styles.customizationPanel}
                    ref={popupRef}
                >
                    {renderContent()}
                </div>
            </div>
        </Portal>
    );
};

export default CustomizationPage;
