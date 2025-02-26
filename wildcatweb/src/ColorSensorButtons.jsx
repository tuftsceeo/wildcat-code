/**
 * @file ColorSensorButtons.jsx
 * @description Reusable color button component for the color sensor interface,
 * allowing selection of different colors.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

import React from "react";
import styles from "./SensorDash.module.css";

export const ColorSensorButtons = ({ color, children, onClick }) => {
    return (
        <button
            className={styles.colorButton}
            style={{
                backgroundColor: color,
                borderColor:
                    color === "#FFFFFF" ? "var(--color-gray-600)" : color,
                boxShadow: color === "#FFFFFF" ? "none" : `0 0 5px ${color}`,
            }}
            onClick={onClick}
        >
            {children}
        </button>
    );
};
