/**
 * @file SubtypeSelector.jsx
 * @description Component for selecting specific subtypes based on the main type (action/input),
 * allowing users to choose between different control options.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

// SubtypeSelector.jsx
import React from "react";
import styles from "./FunctionDefault.module.css"; // Reusing the same CSS initially

/**
 * Component for selecting specific subtypes based on the main type (action/input)
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.controlTypes - Available control types with their configurations
 * @param {string} props.selectedType - Currently selected main type ('action' or 'input')
 * @param {string} props.selectedSubtype - Currently selected subtype
 * @param {Function} props.onSubtypeSelect - Callback function when subtype is selected
 * @returns {JSX.Element} Set of subtype selection buttons
 */
const SubtypeSelector = ({
    controlTypes,
    selectedType,
    selectedSubtype,
    onSubtypeSelect,
}) => {
    if (!selectedType || !controlTypes[selectedType]) {
        return null;
    }

    return (
        <div className={styles.subtypeSelection}>
            {Object.entries(controlTypes[selectedType]).map(([key, value]) => (
                <button
                    key={key}
                    onClick={() => onSubtypeSelect(key)}
                    className={`${styles.subtypeButton} ${
                        selectedSubtype === key ? styles.active : ""
                    }`}
                >
                    {/* Show icon for action buttons */}
                    {value.icon && (
                        <span className={styles.icon}>{value.icon}</span>
                    )}
                    {value.name}
                </button>
            ))}
        </div>
    );
};

export default SubtypeSelector;
