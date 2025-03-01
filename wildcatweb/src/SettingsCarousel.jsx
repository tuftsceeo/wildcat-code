/**
 * @file SettingsCarousel.jsx
 * @description Improved carousel for settings tabs with animation and proper centering
 */

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./SettingsCarousel.module.css";

/**
 * Settings tab carousel with proper centering and animations
 *
 * @param {Object} props Component props
 * @param {Array} props.tabs Array of tab objects
 * @param {number} props.activeTab Currently active tab index
 * @param {Function} props.setActiveTab Function to set active tab
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
        <div className="settings-carousel">
            <button
                className="carousel-nav carousel-prev"
                onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                aria-label="Previous tab"
            >
                <ChevronLeft size={24} />
            </button>

            <div
                className="carousel-container"
                ref={containerRef}
            >
                <div className="carousel-track">
                    {tabs.map((tab, index) => {
                        const isActive = index === activeTab;
                        const isDisabled = !tab.available;

                        return (
                            <button
                                key={tab.id}
                                ref={(el) => (tabRefs.current[index] = el)}
                                className={`carousel-tab ${
                                    isActive ? "active" : ""
                                } ${isDisabled ? "disabled" : ""}`}
                                onClick={() =>
                                    !isDisabled && setActiveTab(index)
                                }
                                disabled={isDisabled}
                                style={{
                                    borderColor: isActive
                                        ? tab.color
                                        : "transparent",
                                    color: isActive
                                        ? tab.color
                                        : "var(--color-text-inactive)",
                                }}
                                aria-label={`${tab.name} settings tab${
                                    isDisabled ? " (coming soon)" : ""
                                }`}
                                aria-selected={isActive}
                                role="tab"
                            >
                                <div
                                    className="tab-icon"
                                    style={{ color: tab.color }}
                                >
                                    {tab.icon}
                                </div>
                                <span className="tab-name">{tab.name}</span>

                                {isDisabled && (
                                    <span className="coming-soon-badge">
                                        Coming Soon
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <button
                className="carousel-nav carousel-next"
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
