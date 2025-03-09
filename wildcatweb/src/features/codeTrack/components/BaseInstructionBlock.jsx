/**
 * @file BaseInstructionBlock.jsx
 * @description Base component for all instruction visualizations that provides
 * common layout, styling, and behavior for instruction blocks.
 * @author Jennifer Cross with support from Claude
 */

import React from "react";
import styles from "../styles/CodingTrack.module.css";

/**
 * Base component for all instruction visualizations
 * Provides common layout, styling, and behavior
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Block title
 * @param {React.ReactNode} props.children - Block content
 * @returns {JSX.Element} Instruction block with standardized layout
 */
const BaseInstructionBlock = ({ title, children }) => {
    return (
        <div className={styles.instructionBlock}>
            {children}

            {title && <div className={styles.blockTitle}>{title}</div>}
        </div>
    );
};

export default BaseInstructionBlock;
