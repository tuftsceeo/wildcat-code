import React from 'react';
import styles from './CodingTrack.module.css';
import { ReactComponent as CodeSucker } from './assets/code-sucker.svg';
import codeTrackEmpty from './assets/code-track-empty.svg';
import nextStepActive from './assets/next-step-active.svg';
import prevStepActive from './assets/prev-step-active.svg';
import nextStepInactive from './assets/next-step-inactive.svg';
import prevStepInactive from './assets/prev-step-inactive.svg';

const CodingTrackContent = ({
    setPyCode,
    setCanRun,
    currSlotNumber,
    setCurrSlotNumber,
    missionSteps,
    slotData
}) => {
    // Get descriptive text for slot based on its configuration
    const getSlotDescription = (slot) => {
        if (!slot || !slot.type) return 'Empty Slot';
        
        let description = `${slot.type === 'action' ? 'Action' : 'Input'} - `;
        
        if (slot.type === 'action') {
            if (slot.subtype === 'motor') {
                const config = slot.configuration || {};
                description += `Motor ${config.port || ''} - ${config.buttonType || ''}`;
                if (config.buttonType === 'GO' && config.knobAngle) {
                    description += ` (${config.knobAngle}°)`;
                }
            }
        } else if (slot.type === 'input') {
            if (slot.subtype === 'time') {
                const config = slot.configuration || {};
                description += `Wait ${config.seconds || 0} seconds`;
            }
        }
        
        return description;
    };

    const handleBack = () => {
        setCurrSlotNumber(Math.max(0, currSlotNumber - 1));
    };

    const handleForward = () => {
        setCurrSlotNumber(Math.min(currSlotNumber + 1, missionSteps));
    };

    const isNextButtonDisabled = currSlotNumber >= missionSteps;
    const isPrevButtonDisabled = currSlotNumber <= 0;

    const currentSlotDescription = getSlotDescription(slotData?.[currSlotNumber]);

    return (
        <div className={styles.trackContainer}>
            <CodeSucker className={styles.codeSucker} />
            <div className={styles.slotDisplay}>
                <img
                    src={codeTrackEmpty}
                    className={styles.codeTrack}
                    alt="code track"
                />
                <div className={styles.slotDescription}>
                    {currentSlotDescription}
                </div>
            </div>
            <button
                className={styles.nextButton}
                disabled={isNextButtonDisabled}
                onClick={handleForward}
            >
                <img
                    src={isNextButtonDisabled ? nextStepInactive : nextStepActive}
                    alt="next"
                />
            </button>
            <button
                className={styles.prevButton}
                disabled={isPrevButtonDisabled}
                onClick={handleBack}
            >
                <img
                    src={isPrevButtonDisabled ? prevStepInactive : prevStepActive}
                    alt="prev"
                />
            </button>
        </div>
    );
};

const CodingTrack = (props) => {
    return <CodingTrackContent {...props} />;
};

export default CodingTrack;