/**
 * @file SettingsCarousel.jsx
 * @description Improved carousel for settings tabs with animation and theme support
 */

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../styles/SettingsCarousel.module.css";

/**
 * Settings tab carousel with proper centering and theme support
 *
 * @param {Object} props Component props
 * @param {Array} props.tabs Array of tab objects
 * @param {number} props.activeTab Currently active tab index
 * @param {Function} props.setActiveTab Function to set active tab
 * @returns {JSX.Element} Themed settings carousel
 */
const SettingsCarousel = ({ tabs, activeTab, setActiveTab }) => {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const tabRefs = useRef([]);
    const [initialLoad, setInitialLoad] = useState(true);

    // Setup tab refs array
    useEffect(() => {
        tabRefs.current = tabRefs.current.slice(0, tabs.length);
    }, [tabs]);

    // Measure container width for positioning calculations
    useEffect(() => {
        if (containerRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    setContainerWidth(entry.contentRect.width);
                }
            });

            resizeObserver.observe(containerRef.current);
            return () => resizeObserver.disconnect();
        }
    }, []);

    // Center the active tab when it changes
    useEffect(() => {
        if (!containerRef.current || !tabRefs.current[activeTab]) return;

        // Skip animation on initial load
        if (initialLoad) {
            setInitialLoad(false);
            return;
        }

        const container = containerRef.current;
        const tab = tabRefs.current[activeTab];

        // Calculate target scroll position to center the active tab
        const tabRect = tab.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const targetScroll =
            tab.offsetLeft - containerWidth / 2 + tabRect.width / 2;

        // Animate scroll
        container.style.scrollBehavior = "smooth";
        container.scrollLeft = targetScroll;

        // Reset scroll behavior after animation
        setTimeout(() => {
            container.style.scrollBehavior = "auto";
        }, 300);
    }, [activeTab, containerWidth, initialLoad]);

    return (
        <div className={styles.settingsCarousel}>
            <button
                className={`${styles.carouselNav} ${styles.carouselPrev}`}
                onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                aria-label="Previous tab"
            >
                <ChevronLeft size={24} />
            </button>

            <div
                className={styles.carouselContainer}
                ref={containerRef}
            >
                <div className={styles.carouselTrack}>
                    {tabs.map((tab, index) => {
                        const isActive = index === activeTab;
                        const isDisabled = !tab.available;

                        return (
                            <button
                                key={tab.id}
                                ref={(el) => (tabRefs.current[index] = el)}
                                className={`${styles.carouselTab} ${
                                    isActive ? styles.active : ""
                                } ${isDisabled ? styles.disabled : ""}`}
                                onClick={() =>
                                    !isDisabled && setActiveTab(index)
                                }
                                disabled={isDisabled}
                                style={{
                                    borderColor: isActive
                                        ? tab.color
                                        : "transparent",
                                }}
                                aria-label={`${tab.name} settings tab${
                                    isDisabled ? " (coming soon)" : ""
                                }`}
                                aria-selected={isActive}
                                role="tab"
                            >
                                <div
                                    className={styles.tabIcon}
                                    style={{ color: tab.color }}
                                >
                                    {tab.icon}
                                </div>
                                <span className={styles.tabName}>
                                    {tab.name}
                                </span>

                                {isDisabled && (
                                    <span className={styles.comingSoonBadge}>
                                        Coming Soon
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <button
                className={`${styles.carouselNav} ${styles.carouselNext}`}
                onClick={() =>
                    setActiveTab(Math.min(tabs.length - 1, activeTab + 1))
                }
                aria-label="Next tab"
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
};

export default SettingsCarousel;
