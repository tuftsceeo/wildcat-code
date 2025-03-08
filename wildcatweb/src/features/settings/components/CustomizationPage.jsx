/**
 * @file CustomizationPage.jsx
 * @description Main settings page component with theme support
 */

import React, { useState, useRef, useEffect } from "react";
import {
    X,
    Type,
    Palette,
    Volume2,
    Layers,
    Globe,
    Accessibility,
    UserRound,
    Users,
} from "lucide-react";
import Portal from "../../../common/components/Portal";
import { useCustomization } from "../../../context/CustomizationContext";
import ThemeSettings from "./ThemeSettings";
import ReadingLevelSettings from "./ReadingLevelSettings";
import LanguageSettings from "./LanguageSettings";
import StepsSettings from "./StepsSettings";
import PlaceholderSettings from "./PlaceholderSettings";
import VoiceSettings from "./VoiceSettings";
import styles from "../styles/CustomizationPage.module.css";

/**
 * Enhanced customization page with theme support
 *
 * @param {Object} props Component props
 * @param {Function} props.close Function to close the settings panel
 * @param {Array} props.slotData Current slot data to check for code in steps
 * @param {Function} props.updateMissionSteps Function to update mission steps in App.js
 * @returns {JSX.Element} Complete settings panel UI
 */
const CustomizationPage = ({ close, slotData = [], updateMissionSteps }) => {
    // State for the active tab index
    const [activeTab, setActiveTab] = useState(0);

    // Access theme context
    const { theme } = useCustomization();

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
            available: true,
            priority: "high",
        },
        {
            id: "steps",
            icon: <Layers size={32} />,
            name: "Steps",
            color: "#00ddff",
            available: true,
            priority: "high",
        },
        {
            id: "language",
            icon: <Globe size={32} />,
            name: "Language",
            color: "#0088ff",
            available: true, // Changed from false to true
            priority: "high", // Changed from medium to high
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
     * Settings Carousel for tab navigation
     * With smaller tabs to fit without scrolling
     */
    const SettingsCarousel = ({ tabs, activeTab, setActiveTab }) => {
        return (
            <div
                style={{
                    position: "relative",
                    display: "flex",
                    borderBottom: "2px solid var(--color-gray-800)",
                    backgroundColor: "var(--color-panel-background)",
                    padding: "var(--spacing-4) 0",
                }}
            >
                {/* Tab container with all tabs visible */}
                <div
                    style={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px", // Smaller gap between tabs
                        padding: "0 var(--spacing-4)",
                    }}
                >
                    {tabs.map((tab, index) => {
                        const isDisabled = !tab.available;
                        const isActive = index === activeTab;

                        return (
                            <button
                                key={tab.id}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "8px", // Smaller padding
                                    borderRadius: "var(--radius-md)",
                                    backgroundColor: isActive
                                        ? "var(--color-button-selected-bg, var(--color-gray-800))"
                                        : "transparent",
                                    border: isActive
                                        ? `2px solid var(--color-border-active)`
                                        : "2px solid transparent",
                                    cursor: isDisabled ? "default" : "pointer",
                                    opacity: isDisabled
                                        ? 0.4
                                        : isActive
                                        ? 1
                                        : 0.7,
                                    width: "85px", // Fixed smaller width
                                    height: "90px", // Fixed smaller height
                                    color: isActive
                                        ? "var(--color-text-active)"
                                        : "var(--color-text-inactive)",
                                    transition: "all var(--transition-normal)",
                                    boxShadow: isActive
                                        ? "var(--glow-neon-green)"
                                        : "none",
                                }}
                                onClick={() =>
                                    !isDisabled && setActiveTab(index)
                                }
                                disabled={isDisabled}
                                aria-label={`${tab.name} settings tab${
                                    isDisabled ? " (coming soon)" : ""
                                }`}
                                aria-selected={isActive}
                                role="tab"
                            >
                                <div
                                    style={{
                                        color: isActive
                                            ? "var(--color-text-active)"
                                            : tab.color,
                                        marginBottom: "6px", // Smaller margin
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "32px", // Smaller icon container
                                    }}
                                >
                                    {React.cloneElement(tab.icon, { size: 24 })}{" "}
                                    {/* Smaller icon size */}
                                </div>
                                <span
                                    style={{
                                        fontSize: "10px", // Smaller font size
                                        textAlign: "center",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em", // Slightly tighter letter spacing
                                        lineHeight: 1.2, // Tighter line height
                                    }}
                                >
                                    {tab.name}
                                </span>

                                {isDisabled && (
                                    <span
                                        style={{
                                            marginTop: "4px",
                                            fontSize: "8px", // Smaller badge font
                                            backgroundColor:
                                                "var(--color-gray-700)",
                                            color: "var(--color-gray-400)",
                                            padding: "1px 4px",
                                            borderRadius: "var(--radius-sm)",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Soon
                                    </span>
                                )}
                            </button>
                        );
                    })}
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
            case "steps":
                return (
                    <StepsSettings
                        slotData={slotData}
                        onUpdateMissionSteps={updateMissionSteps}
                    />
                );
            case "language":
                return <LanguageSettings />; // Added this case to render the language settings
            case "voice":
                return <VoiceSettings />;
            default:
                return <PlaceholderSettings feature={currentTab} />;
        }
    };

    return (
        <Portal>
            <div className={styles.customizationOverlay}>
                <div
                    ref={panelRef}
                    className={styles.customizationPanel}
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
