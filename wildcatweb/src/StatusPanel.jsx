// StatusPanel.jsx
import React from "react";
import { Volume2 } from "lucide-react";
import styles from "./FunctionDefault.module.css"; // Reusing the same CSS initially

/**
 * StatusPanel component that displays current status with audio feedback option
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.statusText - Text to display in the status panel
 * @param {Function} props.onPlayAudio - Callback function to play audio
 * @returns {JSX.Element} Status panel with text and audio button
 */
const StatusPanel = ({ statusText, onPlayAudio }) => {
    return (
        <div className={styles.statusPanel}>
            <div className={styles.statusText}>{statusText}</div>
            <Volume2
                className={styles.audioIcon}
                size={20}
                onClick={onPlayAudio}
                role="button"
                aria-label="Play audio description"
            />
        </div>
    );
};

export default StatusPanel;
