/**
 * @file SettingsCarousel.jsx
 * @description A carousel-style navigation component for settings tabs
 * with smooth transitions between different setting categories.
 */

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./SettingsCarousel.module.css";

/**
 * SettingsCarousel component for tabbed navigation with a carousel effect
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of tab objects with id, icon, name, color, and available properties
 * @param {number} props.activeTab - Index of the currently active tab
 * @param {Function} props.setActiveTab - Function to update the active tab index
 * @returns {JSX.Element} Carousel navigation for settings
 */
const SettingsCarousel = ({ tabs, activeTab, setActiveTab }) => {
    const handlePrevTab = () => {
        setActiveTab((prev) => (prev > 0 ? prev - 1 : tabs.length - 1));
    };

    const handleNextTab = () => {
        setActiveTab((prev) => (prev < tabs.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className={styles.carouselContainer}>
            <button
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={handlePrevTab}
                aria-label="Previous tab"
            >
                <ChevronLeft size={24} />
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
                            onClick={() => !isDisabled && setActiveTab(index)}
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
                            <span className={styles.tabLabel}>{tab.name}</span>

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
                <ChevronRight size={24} />
            </button>
        </div>
    );
};

export default SettingsCarousel;
