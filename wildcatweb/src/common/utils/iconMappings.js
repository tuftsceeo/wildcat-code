/**
 * @file iconMappings.js
 * @description Utility functions for mapping concepts to Lucide React icons
 * and segmenting text for icon display in the instruction panel.
 */

import React from 'react';
import {
  RefreshCw,         // For clockwise rotation
  RefreshCcw,        // For countercw rotation
  Rabbit,            // For fast speed
  Turtle,            // For slow speed
  ChevronRight,      // For medium speed
  CircleStop,           // For stop
  MousePointerClick, // For pressed
  Ban,               // For released
  Timer,        // For wait/timer operations
  Clock,             // For seconds
  EllipsisVertical,  // For separating phrases in icon-only mode
  MousePointer,      // For select action
} from 'lucide-react';

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
  if (concept === 'separator') {
    return <EllipsisVertical {...props} />;
  }
  
  // Check if this is a number (for seconds in wait instructions)
  if (concept === 'number') {
    // The actual number is passed in the numberValue prop
    const { numberValue, ...restProps } = props;
    return (
      <span
        style={{
          fontWeight: 'bold',
          fontSize: '1.2em',
          ...(restProps.style || {})
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
  
  // Map concepts to appropriate Lucide icons
  switch (lowerConcept) {
    // Direction icons
    case 'clockwise':
    case 'clockwise':
    case 'horario':
      return <RefreshCw {...props} />;
    case 'countercw':
    case 'counterclockwise':
    case 'antihorario':
      return <RefreshCcw {...props} />;
    
    // Speed icons
    case 'fast':
      return <Rabbit {...props} />;
    case 'medium':
      return <ChevronRight {...props} />;
    case 'slow':
      return <Turtle {...props} />;
    case 'stop':
    case 'stops':
    case 'stopped':
    case 'parado':
    case 'para':
      return <CircleStop color="var(--color-error-main)" fill="var(--color-error-main)" {...props} />;
    
    // Button state icons
    case 'pressed':
      return <MousePointerClick {...props} />;
    case 'released':
      return <Ban {...props} />;
    
    // Timer icons
    case 'wait':
    case 'waits':
      return <Timer {...props} />;
    
    // Selection icons
    case 'select':
    case 'seleccionar':
      return <MousePointer {...props} />;

    // Choice icons
    case 'or':
    case 'o':  // Spanish "or"
      return (
        <span
          style={{
            fontWeight: 'bold',
            fontSize: '1.5em',
            ...(props.style || {})
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
        return <span 
          style={{
            fontWeight: 'bold',
            fontSize: '1.5em',
            ...(props.style || {})
          }}
          {...props}
        >
          {concept}
        </span>;
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
  const processedText = text.replace(/\./g, ' . ');
  
  // Split by spaces to get words
  const words = processedText.split(/\s+/).filter(word => word.length > 0);
  const segments = [];
  
  // Process each word
  words.forEach((word, index) => {
    // Clean the word (remove punctuation for matching)
    const cleanWord = word.replace(/[.,;:!?]$/, '');
    const lowerWord = cleanWord.toLowerCase();
    
    // Check if we have an icon mapping for this word
    let iconType = null;
    let numberValue = null;
    
    // Direction words
    if (lowerWord === 'clockwise' || lowerWord === 'clockwise' || lowerWord === 'horario') iconType = 'clockwise';
    else if (lowerWord === 'countercw' || lowerWord === 'counterclockwise' || lowerWord === 'antihorario') iconType = 'countercw';
    
    // Speed words
    else if (lowerWord === 'fast') iconType = 'fast';
    else if (lowerWord === 'medium') iconType = 'medium';
    else if (lowerWord === 'slow') iconType = 'slow';
    else if (lowerWord === 'stop' || lowerWord === 'stops' || lowerWord === 'stopped' || 
             lowerWord === 'parado' || lowerWord === 'para') iconType = 'stop';
    
    // Button-related words
    else if (lowerWord === 'pressed') iconType = 'pressed';
    else if (lowerWord === 'released') iconType = 'released';
    
    // Timer-related words
    else if (lowerWord === 'wait' || lowerWord === 'waits') iconType = 'wait';
    else if (lowerWord === 'seconds') iconType = 'seconds';
    
    // Selection words
    else if (lowerWord === 'select' || lowerWord === 'seleccionar') iconType = 'select';
    
    // Choice words
    else if (lowerWord === 'or' || lowerWord === 'o') iconType = 'or';
    
    // Port letters
    else if (/^[A-F]$/.test(cleanWord)) iconType = cleanWord;
    
    // Check if this is a number (for seconds in wait instructions)
    else if (/^\d+$/.test(cleanWord)) {
      iconType = 'number';
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
      isImportantWord: iconType === 'or' || iconType === 'stop' || iconType === 'select'
    });
    
    // If this is a period and we're including breaks, add a separator
    if (includeBreaks && word === '.' && index < words.length - 1) {
      // Check if the next word is "Next" or "Then" (connector words) - if so,
      // we don't need an extra separator since the structure already indicates a break
      const nextWord = words[index + 1];
      if (nextWord && !['next', 'then', 'first'].includes(nextWord.toLowerCase())) {
        // Add a separator segment
        segments.push({
          text: '|',
          iconType: 'separator',
          isSeparator: true
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
  return segments.filter(segment => 
    segment.iconType || 
    segment.isSeparator || 
    segment.isImportantWord
  );
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