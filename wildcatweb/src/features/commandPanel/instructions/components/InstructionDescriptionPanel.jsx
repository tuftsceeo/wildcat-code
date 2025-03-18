/**
 * @file InstructionDescriptionPanel.jsx
 * @description Component for displaying instruction descriptions with audio support.
 * Enhanced to display mission-specific instructions when in mission mode.
 * Ensures port independence in mission instructions.
 * @author Jennifer Cross with support from Claude
 */

import React from "react";
import { Volume2 } from "lucide-react";
import styles from "../styles/InstructionDescriptionPanel.module.css";
import { generateDescription } from "../../../../code-generation/InstructionDescriptionGenerator.js";
import { useMission } from "../../../../context/MissionContext.js";
import { useCustomization } from "../../../../context/CustomizationContext.js";

/**
 * Process instruction text to ensure it doesn't reference specific ports
 * 
 * @param {string} text - Original instruction text
 * @returns {string} - Processed text without specific port references
 */
const processPortIndependentText = (text) => {
    if (!text) return "";
    
    // Replace references like "port A" or "Port B" with "any port" or "a port"
    return text.replace(/port\s+[A-F]/gi, "any port");
};

/**
 * Panel that displays instruction descriptions with optional audio playback
 * and mission-specific instructions when available
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.instruction - Current instruction configuration
 * @param {Function} props.onPlayAudio - Callback for audio button
 * @param {number} props.slotNumber - Current slot number
 * @returns {JSX.Element} Instruction description panel
 */
const InstructionDescriptionPanel = ({
    instruction,
    onPlayAudio,
    slotNumber,
}) => {
    // Get mission context
    const { 
        isMissionMode, 
        currentMission, 
        currentStepIndex,
    } = useMission();

    // Get language for localization
    const { language } = useCustomization();

    // Get the instruction description
    const description = instruction
        ? generateDescription(instruction, language)
        : "No instruction configured.";

    // Determine if we're on a mission step
    const isMissionStep = isMissionMode && 
        currentMission && 
        slotNumber === currentStepIndex;

    // Get mission instructions if applicable
    const missionStep = isMissionStep ? 
        currentMission.steps[currentStepIndex] : null;

    // Process mission instruction to be port-independent
    const missionInstruction = missionStep?.instructions?.instruction 
        ? processPortIndependentText(missionStep.instructions.instruction)
        : missionStep?.stepDescription 
            ? processPortIndependentText(missionStep.stepDescription)
            : "";
            
    // Process mission hints to be port-independent
    const missionHints = missionStep?.instructions?.hints 
        ? missionStep.instructions.hints.map(hint => processPortIndependentText(hint))
        : [];

    // Handle audio playback
    const handlePlayAudio = () => {
        if (onPlayAudio) {
            // If in mission mode, prioritize mission instructions
            if (isMissionStep && missionInstruction) {
                onPlayAudio(missionInstruction);
            } else {
                onPlayAudio(description);
            }
        }
    };

    return (
        <div className={`${styles.panel} ${isMissionStep ? styles.missionPanel : ''}`}>
            {/* If in mission mode and on the current step, show mission instructions */}
            {isMissionStep && missionStep && (
                <div className={styles.missionInstructions}>
                    <h3 className={styles.missionStepTitle}>
                        Step {missionStep.stepNumber}: {missionStep.stepTitle}
                    </h3>
                    <p className={styles.missionInstruction}>
                        {missionInstruction}
                    </p>
                    
                    {/* Show hints if available */}
                    {missionHints.length > 0 && (
                        <div className={styles.missionHints}>
                            <p className={styles.hintLabel}>Hint:</p>
                            <p className={styles.hintText}>{missionHints[0]}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Always show the normal instruction description */}
            <div className={styles.descriptionContainer}>
                <p className={styles.descriptionText}>{description}</p>
                <Volume2
                    className={styles.audioIcon}
                    size={20}
                    onClick={handlePlayAudio}
                    role="button"
                    aria-label="Play audio description"
                />
            </div>
        </div>
    );
};

export default InstructionDescriptionPanel;