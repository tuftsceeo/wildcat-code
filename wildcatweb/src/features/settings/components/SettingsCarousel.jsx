/**
 * @file SettingsCarousel.jsx
 * @description Carousel component for settings tabs with animation and theme support.
 * Provides an interactive way to navigate between different settings sections.
 * @author Jennifer Cross with support from Claude
 */

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../styles/SettingsCarousel.module.css";

/**
 * Settings tab carousel with proper centering and theme support
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of tab objects with icon, name, color, and availability
 * @param {number} props.activeTab - Currently active tab index
 * @param {Function} props.setActiveTab - Function to set active tab
 * @returns {JSX.Element} Interactive settings carousel
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

    /**
     * Settings Carousel for tab navigation
     * With smaller tabs to fit without scrolling
     */
    return (
        <div
            className={styles.settingsCarousel}
            // style={{
            //     position: "relative",
            //     display: "flex",
            //     borderBottom: "2px solid var(--color-gray-bold)",
            //     backgroundColor: "var(--color-panel-background)",
            //     padding: "var(--spacing-4) 0",
            // }}
        >
            {/* Tab container with all tabs visible */}
            <div
                className={styles.carouselContainer}
                ref={containerRef}
                // style={{
                //     display: "flex",
                //     width: "100%",
                //     justifyContent: "center",
                //     alignItems: "center",
                //     gap: "8px", // Smaller gap between tabs
                //     padding: "0 var(--spacing-4)",
                // }}
            >
                {tabs.map((tab, index) => {
                    const isDisabled = !tab.available;
                    const isActive = index === activeTab;

                    return (
                        <button
                            key={tab.id}
                            ref={(el) => (tabRefs.current[index] = el)}
                            className={`${styles.carouselTab} ${
                                isActive ? styles.active : ""
                            } ${isDisabled ? styles.disabled : ""}`}
                            onClick={() => !isDisabled && setActiveTab(index)}
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
                            // style={{
                            //     display: "flex",
                            //     flexDirection: "column",
                            //     alignItems: "center",
                            //     justifyContent: "center",
                            //     padding: "8px", // Smaller padding
                            //     borderRadius: "var(--radius-md)",
                            //     backgroundColor: isActive
                            //         ? "var(--color-button-selected-bg, var(--color-gray-bold))"
                            //         : "transparent",
                            //     border: isActive
                            //         ? `2px solid var(--color-border-active)`
                            //         : "2px solid transparent",
                            //     cursor: isDisabled ? "default" : "pointer",
                            //     opacity: isDisabled ? 0.4 : isActive ? 1 : 0.7,
                            //     width: "85px", // Fixed smaller width
                            //     height: "90px", // Fixed smaller height
                            //     color: isActive
                            //         ? "var(--color-text-active)"
                            //         : "var(--color-text-inactive)",
                            //     transition: "all var(--transition-normal)",
                            //     boxShadow: isActive
                            //         ? "var(--glow-neon-green)"
                            //         : "none",
                            // }}
                            // onClick={() => !isDisabled && setActiveTab(index)}
                            // disabled={isDisabled}
                            // aria-label={`${tab.name} settings tab${
                            //     isDisabled ? " (coming soon)" : ""
                            // }`}
                            // aria-selected={isActive}
                            // role="tab"
                        >
                            <div
                                className={styles.tabIcon}
                                style={{ color: tab.color }}
                                // style={{
                                //     color: isActive
                                //         ? "var(--color-text-active)"
                                //         : tab.color,
                                //     marginBottom: "6px", // Smaller margin
                                //     display: "flex",
                                //     alignItems: "center",
                                //     justifyContent: "center",
                                //     height: "32px", // Smaller icon container
                                // }}
                            >
                                {React.cloneElement(tab.icon, { size: 24 })}{" "}
                                {/* Smaller icon size */}
                            </div>
                            <span
                                className={styles.tabName}
                                // style={{
                                //     fontSize: "10px", // Smaller font size
                                //     textAlign: "center",
                                //     textTransform: "uppercase",
                                //     letterSpacing: "0.05em", // Slightly tighter letter spacing
                                //     lineHeight: 1.2, // Tighter line height
                                // }}
                            >
                                {tab.name}
                            </span>

                            {isDisabled && (
                                <span
                                    className={styles.comingSoonBadge}
                                    /* style={{
                                        marginTop: "4px",
                                        fontSize: "8px", // Smaller badge font
                                        backgroundColor:
                                            "var(--color-gray-bold)",
                                        color: "var(--color-gray-subtle)",
                                        padding: "1px 4px",
                                        borderRadius: "var(--radius-sm)",
                                        textTransform: "uppercase",
                                    }} */
                                >
                                    In Progress
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SettingsCarousel;
