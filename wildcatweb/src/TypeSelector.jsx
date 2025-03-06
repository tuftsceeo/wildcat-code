/**
 * @file TypeSelector.jsx
 * @description Component for selecting between ACTION and SENSE modes,
 * the primary mode selection for the command panel.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

// TypeSelector.jsx
import React from "react";
import styles from "./FunctionDefault.module.css"; // We'll use the same CSS initially

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
                >
                    SENSE
                </button>
            </div>
        </div>
    );
};

export default TypeSelector;
