/**
 * @file PlaceholderSettings.jsx
 * @description Placeholder component for settings panels that are under development.
 * Provides a consistent visual for upcoming features that are not yet implemented.
 * @author Jennifer Cross with support from Claude
 */

import React from "react";
import { RotateCcw } from "lucide-react";
import styles from "../styles/PlaceholderSettings.module.css";

/**
 * Placeholder component for future or in-development features
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.feature - Feature information object with name, icon, color and priority
 * @returns {JSX.Element} Placeholder with coming soon messaging
 */
const PlaceholderSettings = ({ feature }) => {
    /**
     * Get appropriate message based on feature priority
     *
     * @returns {string} Message explaining availability timeline
     */
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
        <div className={styles.container}>
            <div
                className={styles.icon}
                style={{
                    color: feature?.color || "var(--panel-text)",
                }}
            >
                {feature?.icon || <RotateCcw size={48} />}
            </div>

            <h3 className={styles.title}>{feature?.name || "Coming Soon"}</h3>

            <p className={styles.message}>{getMessage()}</p>

            <div className={styles.badge}>
                <RotateCcw size={16} />
                <span>Coming Soon</span>
            </div>
        </div>
    );
};

export default PlaceholderSettings;
