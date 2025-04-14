/**
 * @file CustomizationPage.jsx
 * @description Main settings page component with theme support for adjusting
 * application preferences including themes, reading level, language, and steps.
 * @author Jennifer Cross with support from Claude
 */

import React, { useState, useRef, useEffect } from "react";
import { X, Type, Palette, Volume2, Layers, Globe, Accessibility, UserRound, SlidersHorizontal, MessageCircleMore, Users, ChevronDown } from "lucide-react";
import Portal from "../../../common/components/Portal";
import { useCustomization } from "../../../context/CustomizationContext";
import ThemeSettings from "./ThemeSettings";
import ReadingLevelSettings from "./ReadingLevelSettings";
import LanguageSettings from "./LanguageSettings";
import StepsSettings from "./StepsSettings";
import PlaceholderSettings from "./PlaceholderSettings";
import VoiceSettings from "./VoiceSettings";
import AccessibilitySettings from "./AccessibilitySettings";
import SettingsCarousel from "./SettingsCarousel";
import styles from "../styles/CustomizationPage.module.css";

/**
 * Enhanced customization page with theme support
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.close - Function to close the settings panel
 * @param {Array} props.slotData - Current slot data to check for code in steps
 * @param {Function} props.updateMissionSteps - Function to update mission steps
 * @returns {JSX.Element} Complete settings panel UI
 */
const CustomizationPage = ({ close, slotData = [], updateMissionSteps }) => {
    // State for the active tab index
    const [activeTab, setActiveTab] = useState(0);
    const [isScrollable, setIsScrollable] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);

    // Create refs for the panel and content
    const panelRef = useRef(null);
    const contentRef = useRef(null);

    // Check if content is scrollable
    useEffect(() => {
        const checkScrollable = () => {
            if (contentRef.current) {
                const { scrollHeight, clientHeight } = contentRef.current;
                setIsScrollable(scrollHeight > clientHeight);
            }
        };

        // Check initially and after content changes
        checkScrollable();
        const observer = new ResizeObserver(checkScrollable);
        if (contentRef.current) {
            observer.observe(contentRef.current);
        }

        return () => observer.disconnect();
    }, [activeTab]); // Recheck when tab changes

    // Check if we're at the bottom of the content
    useEffect(() => {
        const handleScroll = () => {
            const contentElement = contentRef.current?.querySelector(`.${styles.settingsContent}`);
            if (contentElement) {
                const { scrollTop, scrollHeight, clientHeight } = contentElement;
                // More reliable bottom detection that works with zoom
                const isBottom = scrollHeight - scrollTop <= clientHeight + 1;
                setIsAtBottom(isBottom);
            }
        };

        const contentElement = contentRef.current?.querySelector(`.${styles.settingsContent}`);
        if (contentElement) {
            contentElement.addEventListener("scroll", handleScroll);
            // Check initial position
            handleScroll();
            return () => contentElement.removeEventListener("scroll", handleScroll);
        }
    }, []);

    // Define all settings tabs with their properties
    const tabs = [
        {
            id: "themes",
            icon: <Palette size={32} />,
            name: "Theme",
            color: "#ff00ff",
            available: true,
            priority: "high",
        },
        {
            id: "reading",
            icon: <Type size={32} />,
            name: "Reading",
            color: "#00ff00",
            available: true,
            priority: "high",
        },

        {
            id: "voice",
            icon: <MessageCircleMore size={32} />,
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
            available: true,
            priority: "high",
        },
        {
            id: "accessibility",
            icon: <SlidersHorizontal size={32} />,
            name: "More",
            color: "#ff8800",
            available: true,
            priority: "high",
        },
        /* {
            id: "sound",
            icon: <Volume2 size={32} />,
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
        }, */
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
                return <LanguageSettings />;
            case "voice":
                return <VoiceSettings />;
            case "accessibility":
                return <AccessibilitySettings />;
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
                    <div
                        ref={contentRef}
                        className={`${styles.settingsContentWrapper} ${isScrollable ? styles.scrollable : ""} ${isAtBottom ? styles.atBottom : ""}`}
                    >
                        <div className={styles.settingsContent}>{renderTabContent()}</div>
                        <div className={styles.gradientOverlay}>
                            <ChevronDown
                                size={24}
                                color="var(--panel-text)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default CustomizationPage;
