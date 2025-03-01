/**
 * @file PlaceholderSettings.jsx
 * @description Placeholder component for settings panels that are under development
 */

import React from "react";
import { RotateCcw } from "lucide-react";

// Using inline styles to avoid CSS module dependencies
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "300px",
        textAlign: "center",
        color: "var(--color-gray-400)",
        animation: "fadeIn 0.3s ease",
    },
    icon: {
        fontSize: "4rem",
        marginBottom: "16px",
        opacity: 0.7,
    },
    title: {
        fontSize: "24px",
        marginBottom: "8px",
        color: "var(--color-gray-300)",
    },
    message: {
        maxWidth: "60%",
        fontSize: "16px",
    },
    badge: {
        marginTop: "16px",
        backgroundColor: "var(--color-gray-700)",
        color: "var(--color-gray-300)",
        fontSize: "14px",
        padding: "4px 12px",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
};

/**
 * Placeholder component for future or in-development features
 *
 * @param {Object} props Component props
 * @param {Object} props.feature Feature information object
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
        <div style={styles.container}>
            <div
                style={{
                    ...styles.icon,
                    color: feature?.color || "var(--color-gray-500)",
                }}
            >
                {feature?.icon || <RotateCcw size={48} />}
            </div>

            <h3 style={styles.title}>{feature?.name || "Coming Soon"}</h3>

            <p style={styles.message}>{getMessage()}</p>

            <div style={styles.badge}>
                <RotateCcw size={16} />
                <span>Coming Soon</span>
            </div>
        </div>
    );
};

export default PlaceholderSettings;
