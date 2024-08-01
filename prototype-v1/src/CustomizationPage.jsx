import React from 'react';
import styles from './CustomizationPage.module.css';
import line from './assets/settings-line.svg';
import accessibilityIcon from './assets/accessibility-icon.svg';
import book from './assets/book.svg';
import groups from './assets/group-mode.svg';
import profiles from './assets/profiles.svg';
import sounds from './assets/sounds.svg';
import steps from './assets/steps.svg';
import Portal from './Portal.js';

export const CustomizationPage = ({ close }) => {
    return (
        <Portal>
            <div className={styles.background}>
                <button className={styles.xOut} onClick={close}> X </button>
                SETTINGS
                <img src={line} alt="Line" />
                <div className={styles.options}>
                    <div className={styles.box}>
                        <img src={profiles} className={styles.icon} alt="Profiles Icon" />
                        <div className={styles.textWrapper}>
                            <p className={styles.heading}> Profiles </p>
                            <p className={styles.bodyText}> Save and track student profiles and progress, create teacher profiles </p>
                        </div>
                    </div>
                    <div className={styles.box}>
                        <img src={book} className={styles.icon} alt="Reading Icon" />
                        <div className={styles.textWrapper}>
                            <p className={styles.heading}> Reading </p>
                            <p className={styles.bodyText}> Control reading difficulty, toggle on/off non-reader version </p>
                        </div>
                    </div>
                    <div className={styles.box}>
                        <img src={groups} className={styles.icon} alt="Group Mode Icon" />
                        <div className={styles.textWrapper}>
                            <p className={styles.heading}> Group Mode </p>
                            <p className={styles.bodyText}> Use Group Mode to connect student devices to the teacher panel </p>
                        </div>
                    </div>
                    <div className={styles.box}>
                        <img src={steps} className={styles.icon} alt="Steps Icon" />
                        <div className={styles.textWrapper}>
                            <p className={styles.heading}> Steps </p>
                            <p className={styles.bodyText}> Control number of steps per code journey </p>
                        </div>
                    </div>
                    <div className={styles.box}>
                        <img src={accessibilityIcon} className={styles.icon} alt="Accessibility Icon" />
                        <div className={styles.textWrapper}>
                            <p className={styles.heading}> Accessibility </p>
                            <p className={styles.bodyText}> Text-to-speech, color contrast, text size, language </p>
                        </div>
                    </div>
                    <div className={styles.box}>
                        <img src={sounds} className={styles.icon} alt="Sounds Icon" />
                        <div className={styles.textWrapper}>
                            <p className={styles.heading}> Sounds </p>
                            <p className={styles.bodyText}> Control volume level, toggle sounds on/off for app and robot </p>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
};
