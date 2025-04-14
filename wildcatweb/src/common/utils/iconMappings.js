/**
 * @file iconMappings.js
 * @description Utility functions for mapping concepts to Lucide React icons
 * and segmenting text for icon display in the instruction panel.
 */

import React from "react";
import {
    RefreshCw, // For clockwise rotation
    RefreshCcw, // For countercw rotation
    Rabbit, // For fast speed
    Turtle, // For medium speed
    Snail, // For slow speed
    CircleStop, // For stop
    MousePointerClick, // For pressed
    Ban, // For released
    Timer, // For wait/timer operations
    Clock, // For seconds
    EllipsisVertical, // For separating phrases in icon-only mode
    MousePointer, // For select action
} from "lucide-react";

// Color mapping for color sensor icons
const COLOR_MAPPING = {
    black: "#000000",
    pink: "#D432A3",
    purple: "#8A2BE2",
    blue: "#3C90EE",
    azure: "#93E6FC",
    lightblue: "#93E6FC",
    teal: "#40E0D0",
    green: "#4BA551",
    yellow: "#FBE376",
    orange: "#FFA500",
    red: "#EB3327",
    white: "#FFFFFF",
    unknown: "#FFFFFF",
};

/**
 * ColorCircle component for displaying color icons
 *
 * @param {Object} props - Component props
 * @param {string} props.color - Hex color value
 * @param {boolean} props.isUnknown - Whether this is an unknown color
 * @param {number} props.size - Size of the circle in pixels (default: 24)
 * @returns {JSX.Element} - Color circle component
 */
const ColorCircle = ({ color, isUnknown, size = 24, ...props }) => {
    // Calculate the actual size (80% of the provided size)
    const actualSize = Math.floor(size * 0.8);

    return (
        <div
            style={{
                width: `${actualSize}px`,
                height: `${actualSize}px`,
                borderRadius: "50%",
                backgroundColor: color,
                border: `1px solid var(--color-text-primary)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...(props.style || {}),
            }}
            {...props}
        >
            {isUnknown && <span style={{ color: "var(--color-text-primary)", fontSize: "0.8em" }}>?</span>}
        </div>
    );
};

/**
 * Get the appropriate icon component for a concept
 *
 * @param {string} concept - The concept to get an icon for (e.g., 'clockwise', 'slow')
 * @param {Object} props - Props to pass to the icon component
 * @returns {JSX.Element|null} - The icon component or null if no matching icon
 */
export function getIconForConcept(concept, props = {}) {
    if (!concept) return null;

    // Special cases
    if (concept === "separator") {
        return <EllipsisVertical {...props} />;
    }

    // Check if this is a number (for seconds in wait instructions)
    if (concept === "number") {
        // The actual number is passed in the numberValue prop
        const { numberValue, ...restProps } = props;
        return (
            <span
                style={{
                    fontWeight: "bold",
                    fontSize: "1.2em",
                    ...(restProps.style || {}),
                }}
                {...restProps}
            >
                {numberValue}
            </span>
        );
    }

    const FilledCircleStop = (props) => {
        return React.cloneElement(<CircleStop />, { fill: "currentColor", ...props });
    };

    const lowerConcept = concept.toLowerCase();

    // Check if this is a color
    if (COLOR_MAPPING[lowerConcept]) {
        return (
            <ColorCircle
                color={COLOR_MAPPING[lowerConcept]}
                isUnknown={lowerConcept === "unknown"}
                {...props}
            />
        );
    }

    // Map concepts to appropriate Lucide icons
    switch (lowerConcept) {
        // Direction icons
        case "clockwise":
        case "clockwise":
        case "horario":
            return <RefreshCw {...props} />;
        case "countercw":
        case "counterclockwise":
        case "antihorario":
            return <RefreshCcw {...props} />;

        // Speed icons
        case "fast":
            return <Rabbit {...props} />;
        case "medium":
            return <Turtle {...props} />;
        case "slow":
            return <Snail {...props} />;
        case "stop":
        case "stops":
        case "stopped":
        case "parado":
        case "para":
            return (
                <CircleStop
                    color="var(--color-error-main)"
                    {...props}
                />
            );

        // Button state icons
        case "pressed":
            return <MousePointerClick {...props} />;
        case "released":
            return <Ban {...props} />;

        // Timer icons
        case "wait":
        case "waits":
            return <Timer {...props} />;

        // Selection icons
        case "select":
        case "seleccionar":
            return <MousePointer {...props} />;

        // Choice icons
        case "or":
        case "o": // Spanish "or"
            return (
                <span
                    style={{
                        fontWeight: "bold",
                        fontSize: "1.5em",
                        ...(props.style || {}),
                    }}
                    {...props}
                >
                    ?
                </span>
            );

        // Port icons - just return the port letter
        default:
            // Check if it's a port letter (A-F)
            if (/^[A-F]$/.test(concept)) {
                return (
                    <span
                        style={{
                            fontWeight: "bold",
                            fontSize: "1.5em",
                            ...(props.style || {}),
                        }}
                        {...props}
                    >
                        {concept}
                    </span>
                );
            }
            return null;
    }
}

/**
 * Segment a description text into words with associated icons
 * Also add separators at sentence breaks for multi-instruction text
 *
 * @param {string} text - The description text to segment
 * @param {boolean} includeBreaks - Whether to include sentence break markers
 * @returns {Array} - Array of segments with text and iconType properties
 */
export function segmentDescriptionText(text, includeBreaks = false) {
    if (!text) return [];

    // Replace periods with spaces and periods to ensure proper separation
    const processedText = text.replace(/\./g, " . ");

    // Split by spaces to get words
    const words = processedText.split(/\s+/).filter((word) => word.length > 0);
    const segments = [];

    // Process each word
    words.forEach((word, index) => {
        // Clean the word (remove punctuation for matching)
        const cleanWord = word.replace(/[.,;:!?]$/, "");
        const lowerWord = cleanWord.toLowerCase();

        // Get the previous word if it exists
        const prevWord = index > 0 ? words[index - 1].replace(/[.,;:!?]$/, "").toLowerCase() : null;

        // Check if we have an icon mapping for this word
        let iconType = null;
        let numberValue = null;

        // Check for multi-word color concepts first
        if (prevWord === "light" && lowerWord === "blue") {
            // Handle "light blue" as a single color concept
            iconType = "lightblue";
        } else if (Object.keys(COLOR_MAPPING).includes(lowerWord)) {
            // Single word color
            iconType = lowerWord;
        }
        // Direction words
        else if (lowerWord === "clockwise" || lowerWord === "clockwise" || lowerWord === "horario") iconType = "clockwise";
        else if (lowerWord === "countercw" || lowerWord === "counterclockwise" || lowerWord === "antihorario") iconType = "countercw";
        // Speed words
        else if (lowerWord === "fast") iconType = "fast";
        else if (lowerWord === "medium") iconType = "medium";
        else if (lowerWord === "slow") iconType = "slow";
        else if (lowerWord === "stop" || lowerWord === "stops" || lowerWord === "stopped" || lowerWord === "parado" || lowerWord === "para") iconType = "stop";
        // Button-related words
        else if (lowerWord === "pressed") iconType = "pressed";
        else if (lowerWord === "released") iconType = "released";
        // Timer-related words
        else if (lowerWord === "wait" || lowerWord === "waits") iconType = "wait";
        else if (lowerWord === "seconds") iconType = "seconds";
        // Selection words
        else if (lowerWord === "select" || lowerWord === "seleccionar") iconType = "select";
        // Choice words
        else if (lowerWord === "or" || lowerWord === "o") iconType = "or";
        // Port letters
        else if (/^[A-F]$/.test(cleanWord)) iconType = cleanWord;
        // Check if this is a number (for seconds in wait instructions)
        else if (/^\d+$/.test(cleanWord)) {
            iconType = "number";
            numberValue = cleanWord;
        }

        // Special handling for Motor + letter (like "Motor A")
        else if (/^motor$/i.test(lowerWord)) {
            // Look ahead to see if the next word is a port letter
            const nextWord = words[index + 1];
            if (nextWord && /^[A-F]$/.test(nextWord)) {
                iconType = null; // Don't show icon for "Motor" when followed by a port letter
            } else {
                iconType = null; // Don't show an icon for "Motor" by itself
            }
        }

        // Add segment with original word and icon type
        segments.push({
            text: word,
            iconType: iconType,
            numberValue: numberValue,
            // Add a flag for words that should always show in icon-only mode
            isImportantWord: iconType === "or" || iconType === "stop" || iconType === "select" || Object.keys(COLOR_MAPPING).includes(iconType),
        });

        // If this is a period and we're including breaks, add a separator
        if (includeBreaks && word === "." && index < words.length - 1) {
            // Check if the next word is "Next" or "Then" (connector words) - if so,
            // we don't need an extra separator since the structure already indicates a break
            const nextWord = words[index + 1];
            if (nextWord && !["next", "then", "first"].includes(nextWord.toLowerCase())) {
                // Add a separator segment
                segments.push({
                    text: "|",
                    iconType: "separator",
                    isSeparator: true,
                });
            }
        }
    });

    return segments;
}

/**
 * Filter segments to only include those with icons
 * Useful for icon-only mode
 *
 * @param {Array} segments - Array of segments from segmentDescriptionText
 * @returns {Array} - Filtered array with only segments that have icons
 */
export function filterIconSegments(segments) {
    return segments.filter((segment) => segment.iconType || segment.isSeparator || segment.isImportantWord);
}

/**
 * Modify text to add pauses for text-to-speech between separate instructions
 *
 * @param {string} text - Original description text
 * @returns {string} - Modified text with added pauses for TTS
 */
export function addTTSPauses(text) {
    // Replace periods between sentences with a period and a pause marker
    return text.replace(/\.\s+/g, '. <break time="1s"/> ');
}
