/**
 * @file TimerInstructionBlock.jsx
 * @description Block for visualizing timer instructions in the code track.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

// TimerInstructionBlock.jsx
import React from "react";
import BaseInstructionBlock from "../../../../codeTrack/components/BaseInstructionBlock";
import TimerAnimation from "./TimerAnimation";

/**
 * Block for visualizing timer instructions
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.configuration - Timer configuration
 * @returns {JSX.Element} Visualization of timer instruction
 */
const TimerInstructionBlock = ({ configuration }) => {
    const { seconds = 3 } = configuration || {};

    return (
        <BaseInstructionBlock title="WAIT">
            <TimerAnimation
                seconds={seconds}
                active={true}
            />
        </BaseInstructionBlock>
    );
};

export default TimerInstructionBlock;
