/**
 * @file HintSystem.js
 * @description Implements a visual-only hint system for guiding users through missions
 * without relying on text hints. Applies visual effects to UI elements.
 */

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import '../styles/HintSystem.css';

/**
 * Apply a visual hint to a target element
 * 
 * @param {string} selector - CSS selector for the target element
 * @param {string} animation - Animation type (pulse, bounce, glow, etc)
 * @param {string} effect - Visual effect (highlight, outline, arrow, etc)
 * @returns {Function} Function to remove the hint
 */
export function applyVisualHint(selector, animation = 'pulse', effect = 'highlight') {
  // Find the target element
  const targetElement = document.querySelector(selector);
  if (!targetElement) {
    console.warn(`Visual hint target not found: ${selector}`);
    return () => {};
  }

  // Create a container for the hint effect
  const hintContainer = document.createElement('div');
  hintContainer.className = 'visual-hint-container';
  document.body.appendChild(hintContainer);

  // Position data for the hint
  const targetRect = targetElement.getBoundingClientRect();
  
  // Create the hint element based on effect type
  let hintElement;
  
  switch (effect) {
    case 'highlight':
      // Create a highlight overlay
      hintElement = document.createElement('div');
      hintElement.className = `visual-hint highlight ${animation}`;
      hintElement.style.top = `${targetRect.top - 5}px`;
      hintElement.style.left = `${targetRect.left - 5}px`;
      hintElement.style.width = `${targetRect.width + 10}px`;
      hintElement.style.height = `${targetRect.height + 10}px`;
      break;
      
    case 'outline':
      // Create an outline around the element
      hintElement = document.createElement('div');
      hintElement.className = `visual-hint outline ${animation}`;
      hintElement.style.top = `${targetRect.top - 4}px`;
      hintElement.style.left = `${targetRect.left - 4}px`;
      hintElement.style.width = `${targetRect.width + 8}px`;
      hintElement.style.height = `${targetRect.height + 8}px`;
      break;
      
    case 'arrow':
      // Create an animated arrow pointing to the element
      hintElement = document.createElement('div');
      hintElement.className = `visual-hint arrow ${animation}`;
      hintElement.style.top = `${targetRect.top - 40}px`;
      hintElement.style.left = `${targetRect.left + targetRect.width / 2 - 15}px`;
      break;
      
    default:
      hintElement = document.createElement('div');
      hintElement.className = `visual-hint default ${animation}`;
      hintElement.style.top = `${targetRect.top - 5}px`;
      hintElement.style.left = `${targetRect.left - 5}px`;
      hintElement.style.width = `${targetRect.width + 10}px`;
      hintElement.style.height = `${targetRect.height + 10}px`;
  }
  
  // Add the hint to the container
  hintContainer.appendChild(hintElement);
  
  // Highlight the actual target as well
  targetElement.classList.add('hint-target');
  
  // Return a cleanup function
  return () => {
    if (document.body.contains(hintContainer)) {
      document.body.removeChild(hintContainer);
    }
    targetElement.classList.remove('hint-target');
  };
}

/**
 * Component that creates and manages visual hints
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.hint - Hint details with selector, animation and effect
 * @returns {null} This component doesn't render anything visible
 */
export function HintManager({ hint }) {
  const [removeHint, setRemoveHint] = useState(null);
  
  // Apply and clean up hint effects
  useEffect(() => {
    // Clear any existing hint
    if (removeHint) {
      removeHint();
      setRemoveHint(null);
    }
    
    // Apply new hint if available
    if (hint && hint.selector) {
      const cleanup = applyVisualHint(
        hint.selector,
        hint.animation || 'pulse',
        hint.effect || 'highlight'
      );
      
      setRemoveHint(() => cleanup);
      
      // Auto-remove hint after 5 seconds
      const timer = setTimeout(() => {
        cleanup();
        setRemoveHint(null);
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        cleanup();
      };
    }
  }, [hint]);
  
  // This component doesn't render anything visible
  return null;
}

/**
 * Register to receive hint events from MissionContext 
 * and apply visual effects to the targeted components
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.activeHint - Current active hint from MissionContext
 * @returns {JSX.Element} Invisible hint manager component
 */
export function HintSystem({ activeHint }) {
  return <HintManager hint={activeHint} />;
}

// Export a helper for components to apply their own hints
export default HintSystem;