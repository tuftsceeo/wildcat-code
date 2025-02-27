/**
 * @file PlaceholderSettings.jsx
 * @description Placeholder component for settings panels that are under development
 * or planned for future releases.
 */

import React from "react";
import { RotateCcw } from "lucide-react";
import styles from "./CustomizationPage.module.css";

/**
 * Placeholder component for future or in-development features
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.feature - Feature information object
 * @param {string} props.feature.name - Name of the feature
 * @param {React.ReactNode} props.feature.icon - Icon for the feature
 * @param {string} props.feature.color - Accent color for the feature
 * @param {string} props.feature.priority - Priority level ('low', 'medium', 'high')
 * @returns {JSX.Element} Placeholder for settings panel
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

export default PlaceholderSettings;
