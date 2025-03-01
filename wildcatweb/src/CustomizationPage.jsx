/**
 * @file CustomizationPage.jsx
 * @description Enhanced customization page with debugging
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
    RotateCcw,
} from "lucide-react";
import Portal from "./Portal";
import { useCustomization } from "./CustomizationContext";
// Import the updated ThemeSettings component
import ThemeSettings from "./settings/ThemeSettings";
// Import ReadingLevelSettings
import ReadingLevelSettings from "./settings/ReadingLevelSettings";

console.log("CustomizationPage module loaded");

/**
 * Placeholder for features under development
 */
const PlaceholderSettings = ({ feature }) => {
    console.log("Rendering placeholder for feature:", feature?.id);
    // Messages based on priority
    const getMessage = () => {
        switch (feature?.priority) {
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
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "300px",
                textAlign: "center",
                color: "#999",
            }}
        >
            <div
                style={{
                    color: feature?.color || "#ccc",
                    fontSize: "48px",
                    marginBottom: "16px",
                }}
            >
                {feature?.icon || <RotateCcw />}
            </div>

            <h3
                style={{
                    fontSize: "24px",
                    marginBottom: "8px",
                    color: "#ddd",
                }}
            >
                {feature?.name || "Coming Soon"}
            </h3>

            <p style={{ maxWidth: "60%" }}>{getMessage()}</p>

            <div
                style={{
                    marginTop: "16px",
                    backgroundColor: "#444",
                    color: "#ddd",
                    padding: "4px 12px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <RotateCcw size={16} />
                <span>Coming Soon</span>
            </div>
        </div>
    );
};

/**
 * Enhanced customization page with debugging
 */
const CustomizationPage = ({ close }) => {
    console.log("CustomizationPage rendering");
    // State for the active tab index
    const [activeTab, setActiveTab] = useState(0);
    console.log("Active tab:", activeTab);

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
     * Settings Carousel for tab navigation
     */
    const SettingsCarousel = ({ tabs, activeTab, setActiveTab }) => {
        console.log("SettingsCarousel rendering, active tab:", activeTab);
        return (
            <div
                style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    padding: "20px 48px",
                    borderBottom: "2px solid #333",
                    marginBottom: "0",
                }}
            >
                <button
                    style={{
                        position: "absolute",
                        left: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "40px",
                        height: "40px",
                        backgroundColor: "transparent",
                        border: "none",
                        borderRadius: "50%",
                        color: "#ddd",
                        cursor: "pointer",
                    }}
                    onClick={handlePrevTab}
                    aria-label="Previous tab"
                >
                    &lt;
                </button>

                <div
                    style={{
                        display: "flex",
                        flex: 1,
                        justifyContent: "center",
                        overflow: "hidden",
                        gap: "4px",
                    }}
                >
                    {tabs.map((tab, index) => {
                        const isDisabled = !tab.available;

                        return (
                            <button
                                key={tab.id}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    backgroundColor:
                                        index === activeTab
                                            ? "#333"
                                            : "transparent",
                                    border: `2px solid ${
                                        index === activeTab
                                            ? tab.color
                                            : "transparent"
                                    }`,
                                    cursor: isDisabled ? "default" : "pointer",
                                    transform:
                                        index === activeTab
                                            ? "scale(1)"
                                            : "scale(0.85)",
                                    opacity: isDisabled
                                        ? 0.4
                                        : index === activeTab
                                        ? 1
                                        : 0.5,
                                    minWidth: "120px",
                                    height: "100px",
                                }}
                                onClick={() =>
                                    !isDisabled && setActiveTab(index)
                                }
                                disabled={isDisabled}
                                aria-label={`${tab.name} settings tab${
                                    isDisabled ? " (coming soon)" : ""
                                }`}
                                aria-selected={index === activeTab}
                                role="tab"
                            >
                                <div
                                    style={{
                                        color: tab.color,
                                        marginBottom: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "40px",
                                        fontSize: "32px",
                                    }}
                                >
                                    {tab.icon}
                                </div>
                                <span
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        marginTop: "8px",
                                    }}
                                >
                                    {tab.name}
                                </span>

                                {isDisabled && (
                                    <span
                                        style={{
                                            marginTop: "4px",
                                            fontSize: "12px",
                                            backgroundColor: "#444",
                                            color: "#999",
                                            padding: "2px 8px",
                                            borderRadius: "8px",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Coming Soon
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <button
                    style={{
                        position: "absolute",
                        right: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "40px",
                        height: "40px",
                        backgroundColor: "transparent",
                        border: "none",
                        borderRadius: "50%",
                        color: "#ddd",
                        cursor: "pointer",
                    }}
                    onClick={handleNextTab}
                    aria-label="Next tab"
                >
                    &gt;
                </button>
            </div>
        );
    };

    // Render current tab content based on activeTab
    const renderTabContent = () => {
        console.log("Rendering tab content for tab:", activeTab);
        const currentTab = tabs[activeTab];
        console.log("Current tab:", currentTab);

        // If feature is not available, show placeholder
        if (!currentTab.available) {
            return <PlaceholderSettings feature={currentTab} />;
        }

        // Otherwise, render the appropriate settings panel
        switch (currentTab.id) {
            case "reading":
                console.log("Rendering ReadingLevelSettings");
                return <ReadingLevelSettings />;
            case "themes":
                console.log("Rendering ThemeSettings");
                try {
                    return <ThemeSettings />;
                } catch (error) {
                    console.error("Error rendering ThemeSettings:", error);
                    return (
                        <div style={{ color: "red", padding: "20px" }}>
                            <h3>Error Rendering Theme Settings</h3>
                            <pre>{error.toString()}</pre>
                            <p>Check console for details</p>
                        </div>
                    );
                }
            default:
                console.log(
                    "Rendering placeholder for unknown tab:",
                    currentTab.id,
                );
                return <PlaceholderSettings feature={currentTab} />;
        }
    };

    return (
        <Portal>
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                }}
            >
                <div
                    ref={panelRef}
                    style={{
                        position: "relative",
                        width: "900px",
                        height: "650px",
                        backgroundColor: "#000",
                        border: "2px solid #00bfff",
                        borderRadius: "8px",
                        overflow: "hidden",
                        color: "#fff",
                        boxShadow: "0 0 10px rgba(0, 191, 255, 0.7)",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header with title and close button */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            position: "relative",
                            padding: "16px",
                            borderBottom: "1px solid #333",
                        }}
                    >
                        <button
                            style={{
                                position: "absolute",
                                left: "16px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                color: "#999",
                                cursor: "pointer",
                                padding: "8px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onClick={close}
                            aria-label="Close settings"
                        >
                            <X size={24} />
                        </button>
                        <h1
                            style={{
                                textAlign: "center",
                                fontSize: "32px",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                color: "#fff",
                            }}
                        >
                            SETTINGS
                        </h1>
                    </div>

                    {/* Settings tabs carousel navigation */}
                    <SettingsCarousel
                        tabs={tabs}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {/* Content area for the active tab */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "24px",
                            height: "450px",
                        }}
                    >
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default CustomizationPage;
