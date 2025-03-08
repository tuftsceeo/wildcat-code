/**
 * @file PlaceholderSettings.jsx
 * @description Placeholder component for settings panels that are under development
 * that properly uses theme variables
 */

import React from "react";
import { RotateCcw } from "lucide-react";
import styles from '../styles/PlaceholderSettings.module.css';ings.module.css";

/**
 * Placeholder component for future or in-development features
 *
 * @param {Object} props Component props
 * @param {Object} props.feature Feature information object
 * @returns {JSX.Element} Placeholder with coming soon messaging
 */
const PlaceholderSettings = ({ feature }) => {
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
        <div className={styles.container}>
            <div
                className={styles.icon}
                style={{ color: feature?.color || "var(--color-gray-500)" }}
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
