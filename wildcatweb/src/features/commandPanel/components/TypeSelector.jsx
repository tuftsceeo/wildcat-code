/**
 * @file TypeSelector.jsx
 * @description Component for selecting between ACTION and SENSE modes,
 * the primary mode selection for the command panel. Refactored to use
 * consistent design tokens and styling patterns.
 * @author Jennifer Cross with support from Claude
 * @created March 2025
 */

import React from "react";
import styles from "../styles/FunctionDefault.module.css";

/**
 * TypeSelector component for selecting between ACTION and SENSE modes
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.selectedType - Currently selected type ('action' or 'input')
 * @param {Function} props.onTypeChange - Callback function when type changes
 * @returns {JSX.Element} A React component with action/sense selection buttons
 */
const TypeSelector = ({ selectedType, onTypeChange }) => {
    return (
        <div className={styles.actionSenseButtonGroup}>
            <div className={styles.actionButton}>
                <button
                    className={`${styles.actionButtonChild} ${
                        selectedType === "action" ? styles.active : ""
                    }`}
                    onClick={() => onTypeChange("action")}
                    aria-pressed={selectedType === "action"}
                    aria-label="Select Action mode"
                >
                    ACTION
                </button>
            </div>
            <div className={styles.senseButton}>
                <button
                    className={`${styles.actionButtonChild} ${
                        selectedType === "input" ? styles.active : ""
                    }`}
                    onClick={() => onTypeChange("input")}
                    aria-pressed={selectedType === "input"}
                    aria-label="Select Sense mode"
                >
                    SENSE
                </button>
            </div>
        </div>
    );
};

export default TypeSelector;
