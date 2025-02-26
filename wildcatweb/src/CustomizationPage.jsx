/**
 * @file CustomizationPage.jsx
 * @description Settings and customization modal for adjusting app preferences,
 * including profiles, reading levels, accessibility options, and more.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

// Import necessary modules and assets
import React, { useEffect, useRef, useState } from "react";
import styles from "./CustomizationPage.module.css";
import line from "./assets/settings-line.svg";
import accessibilityIcon from "./assets/accessibility-icon.svg";
import book from "./assets/book.svg";
import groups from "./assets/group-mode.svg";
import profiles from "./assets/profiles.svg";
import sounds from "./assets/sounds.svg";
import steps from "./assets/steps.svg";
import Portal from "./Portal.js";

// CustomizationPage component for displaying settings and sub-settings
export const CustomizationPage = ({ close }) => {
    const popupRef = useRef(null); // Ref to detect clicks outside the popup area
    const [currentView, setCurrentView] = useState("main"); // State to track the current view (main or specific setting detail)

    // Effect to close the customization page if a user clicks outside the popup area
    useEffect(() => {
        // Define function to handle clicks outside the popup
        const handleClickOutside = (event) => {
            // Check if the clicked element is outside the popup
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                close(); // Close the customization page if clicked outside
            }
        };

        // Add event listener for mousedown events to detect outside clicks
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [close]);

    // Function to return to the main settings view
    const handleBack = () => {
        setCurrentView("main"); // Reset view to main settings page
    };

    // Function to render content based on the current view (main or specific setting detail)
    const renderContent = () => {
        switch (currentView) {
            case "profiles":
                // View for Profiles setting detail
                return (
                    <div className={styles.detailView}>
                        <h2>Profiles</h2>
                        <p>
                            Save and track student profiles and progress, create
                            teacher profiles.
                        </p>
                        <button
                            onClick={handleBack}
                            className={styles.backButton}
                        >
                            ◀
                        </button>
                    </div>
                );
            case "reading":
                // View for Reading setting detail
                return (
                    <div className={styles.detailView}>
                        <h2>Reading</h2>
                        <p>
                            Control reading difficulty, toggle on/off non-reader
                            version.
                        </p>
                        <button
                            onClick={handleBack}
                            className={styles.backButton}
                        >
                            ◀
                        </button>
                    </div>
                );
            case "groupMode":
                // View for Group Mode setting detail
                return (
                    <div className={styles.detailView}>
                        <h2>Group Mode</h2>
                        <p>
                            Use Group Mode to connect student devices to the
                            teacher panel.
                        </p>
                        <button
                            onClick={handleBack}
                            className={styles.backButton}
                        >
                            ◀
                        </button>
                    </div>
                );
            case "steps":
                // View for Steps setting detail
                return (
                    <div className={styles.detailView}>
                        <h2>Steps</h2>
                        <p>Control number of steps per code journey.</p>
                        <button
                            onClick={handleBack}
                            className={styles.backButton}
                        >
                            ◀
                        </button>
                    </div>
                );
            case "accessibility":
                // View for Accessibility setting detail
                return (
                    <div className={styles.detailView}>
                        <h2>Accessibility</h2>
                        <p>
                            Text-to-speech, color contrast, text size, language
                            options.
                        </p>
                        <button
                            onClick={handleBack}
                            className={styles.backButton}
                        >
                            ◀
                        </button>
                    </div>
                );
            case "sounds":
                // View for Sounds setting detail
                return (
                    <div className={styles.detailView}>
                        <h2>Sounds</h2>
                        <p>
                            Control volume level, toggle sounds on/off for app
                            and robot.
                        </p>
                        <button
                            onClick={handleBack}
                            className={styles.backButton}
                        >
                            ◀
                        </button>
                    </div>
                );
            default:
                // Main settings view with options
                return (
                    <>
                        {/* Close button for the entire settings modal */}
                        <button className={styles.xOut} onClick={close}>
                            {" "}
                            X{" "}
                        </button>
                        SETTINGS
                        <img src={line} alt="Line" />
                        <div className={styles.options}>
                            {/* Profiles setting box with click event to show detail view */}
                            <div
                                className={styles.box}
                                onClick={() => setCurrentView("profiles")}
                            >
                                <img
                                    src={profiles}
                                    className={styles.icon}
                                    alt="Profiles Icon"
                                />
                                <div className={styles.textWrapper}>
                                    <p className={styles.heading}>Profiles</p>
                                    <p className={styles.bodyText}>
                                        Save and track student profiles and
                                        progress, create teacher profiles.
                                    </p>
                                </div>
                            </div>
                            {/* Reading setting box */}
                            <div
                                className={styles.box}
                                onClick={() => setCurrentView("reading")}
                            >
                                <img
                                    src={book}
                                    className={styles.icon}
                                    alt="Reading Icon"
                                />
                                <div className={styles.textWrapper}>
                                    <p className={styles.heading}>Reading</p>
                                    <p className={styles.bodyText}>
                                        Control reading difficulty, toggle
                                        on/off non-reader version.
                                    </p>
                                </div>
                            </div>
                            {/* Group Mode setting box */}
                            <div
                                className={styles.box}
                                onClick={() => setCurrentView("groupMode")}
                            >
                                <img
                                    src={groups}
                                    className={styles.icon}
                                    alt="Group Mode Icon"
                                />
                                <div className={styles.textWrapper}>
                                    <p className={styles.heading}>Group Mode</p>
                                    <p className={styles.bodyText}>
                                        Use Group Mode to connect student
                                        devices to the teacher panel.
                                    </p>
                                </div>
                            </div>
                            {/* Steps setting box */}
                            <div
                                className={styles.box}
                                onClick={() => setCurrentView("steps")}
                            >
                                <img
                                    src={steps}
                                    className={styles.icon}
                                    alt="Steps Icon"
                                />
                                <div className={styles.textWrapper}>
                                    <p className={styles.heading}>Steps</p>
                                    <p className={styles.bodyText}>
                                        Control number of steps per code
                                        journey.
                                    </p>
                                </div>
                            </div>
                            {/* Accessibility setting box */}
                            <div
                                className={styles.box}
                                onClick={() => setCurrentView("accessibility")}
                            >
                                <img
                                    src={accessibilityIcon}
                                    className={styles.icon}
                                    alt="Accessibility Icon"
                                />
                                <div className={styles.textWrapper}>
                                    <p className={styles.heading}>
                                        Accessibility
                                    </p>
                                    <p className={styles.bodyText}>
                                        Text-to-speech, color contrast, text
                                        size, language options.
                                    </p>
                                </div>
                            </div>
                            {/* Sounds setting box */}
                            <div
                                className={styles.box}
                                onClick={() => setCurrentView("sounds")}
                            >
                                <img
                                    src={sounds}
                                    className={styles.icon}
                                    alt="Sounds Icon"
                                />
                                <div className={styles.textWrapper}>
                                    <p className={styles.heading}>Sounds</p>
                                    <p className={styles.bodyText}>
                                        Control volume level, toggle sounds
                                        on/off for app and robot.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <Portal>
            {/* Background overlay for the settings page; click detection outside popup handled via ref */}
            <div className={styles.background} ref={popupRef}>
                {renderContent()}{" "}
                {/* Render main or detailed view based on currentView state */}
            </div>
        </Portal>
    );
};
