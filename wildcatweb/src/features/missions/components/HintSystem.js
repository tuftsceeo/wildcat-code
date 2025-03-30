/**
 * @file HintSystem.js
 * @description Improved implementation of the visual hint system with better 
 * reliability and error handling
 */

import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { logTaskEvent } from '../models/Task';
import '../styles/HintSystem.css';

/**
 * Apply a visual hint to a target element with better error handling
 * 
 * @param {string} selector - CSS selector for the target element
 * @param {string} animation - Animation type (pulse, bounce, glow, etc)
 * @param {string} effect - Visual effect (highlight, outline, arrow, etc)
 * @returns {Function} Function to remove the hint
 */
export function applyVisualHint(selector, animation = 'pulse', effect = 'highlight') {
  // Find the target element
  let targetElement;
  try {
    targetElement = document.querySelector(selector);
  } catch (error) {
    console.warn(`Invalid selector for visual hint: ${selector}`, error);
    return () => {};
  }
  
  if (!targetElement) {
    console.warn(`Visual hint target not found: ${selector}`);
    return () => {};
  }
  
  // Create a container for the hint effect that will be added to the body
  const hintContainer = document.createElement('div');
  hintContainer.className = 'visual-hint-container';
  hintContainer.setAttribute('data-target-selector', selector);
  hintContainer.setAttribute('data-hint-id', `hint-${Date.now()}`);
  document.body.appendChild(hintContainer);
  
  // Calculate position data for the hint
  const targetRect = targetElement.getBoundingClientRect();
  
  // Create the hint element based on effect type
  let hintElement;
  
  try {
    switch (effect) {
      case 'highlight':
        // Create a highlight overlay
        hintElement = createHighlightEffect(targetRect);
        break;
        
      case 'outline':
        // Create an outline around the element
        hintElement = createOutlineEffect(targetRect);
        break;
        
      case 'arrow':
        // Create an animated arrow pointing to the element
        hintElement = createArrowEffect(targetRect);
        break;
        
      default:
        hintElement = createDefaultEffect(targetRect);
    }
    
    // Apply the animation class
    if (animation && typeof animation === 'string') {
      hintElement.classList.add(animation);
    }
    
    // Add the hint to the container
    hintContainer.appendChild(hintElement);
    
    // Add debug info to the hint container
    if (process.env.NODE_ENV === 'development') {
      const debugInfo = document.createElement('div');
      debugInfo.className = 'hint-debug-info';
      debugInfo.textContent = `Hint for: ${selector}`;
      debugInfo.style.position = 'absolute';
      debugInfo.style.top = '0';
      debugInfo.style.left = '0';
      debugInfo.style.background = 'rgba(0,0,0,0.7)';
      debugInfo.style.color = 'white';
      debugInfo.style.padding = '2px 5px';
      debugInfo.style.fontSize = '10px';
      debugInfo.style.zIndex = '10000';
      hintContainer.appendChild(debugInfo);
    }
    
    // Highlight the actual target as well
    targetElement.classList.add('hint-target');
    
    // Ensure hint stays positioned correctly on scroll and resize
    function updatePosition() {
      const updatedRect = targetElement.getBoundingClientRect();
      
      // Update position based on effect type
      switch (effect) {
        case 'highlight':
          updateHighlightPosition(hintElement, updatedRect);
          break;
        case 'outline':
          updateOutlinePosition(hintElement, updatedRect);
          break;
        case 'arrow':
          updateArrowPosition(hintElement, updatedRect);
          break;
        default:
          updateDefaultPosition(hintElement, updatedRect);
      }
    }
    
    // Add event listeners for scroll and resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    // Return a cleanup function
    return () => {
      try {
        if (document.body.contains(hintContainer)) {
          document.body.removeChild(hintContainer);
        }
        
        if (targetElement && document.body.contains(targetElement)) {
          targetElement.classList.remove('hint-target');
        }
        
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      } catch (error) {
        console.warn('Error cleaning up hint:', error);
      }
    };
  } catch (error) {
    console.error('Error creating visual hint:', error);
    
    // Clean up if there was an error
    if (document.body.contains(hintContainer)) {
      document.body.removeChild(hintContainer);
    }
    
    return () => {};
  }
}

// Helper functions for creating different hint effects

function createHighlightEffect(targetRect) {
  const hintElement = document.createElement('div');
  hintElement.className = 'visual-hint highlight';
  updateHighlightPosition(hintElement, targetRect);
  return hintElement;
}

function updateHighlightPosition(element, rect) {
  element.style.top = `${rect.top - 5}px`;
  element.style.left = `${rect.left - 5}px`;
  element.style.width = `${rect.width + 10}px`;
  element.style.height = `${rect.height + 10}px`;
}

function createOutlineEffect(targetRect) {
  const hintElement = document.createElement('div');
  hintElement.className = 'visual-hint outline';
  updateOutlinePosition(hintElement, targetRect);
  return hintElement;
}

function updateOutlinePosition(element, rect) {
  element.style.top = `${rect.top - 4}px`;
  element.style.left = `${rect.left - 4}px`;
  element.style.width = `${rect.width + 8}px`;
  element.style.height = `${rect.height + 8}px`;
}

function createArrowEffect(targetRect) {
  const hintElement = document.createElement('div');
  hintElement.className = 'visual-hint arrow';
  updateArrowPosition(hintElement, targetRect);
  return hintElement;
}

function updateArrowPosition(element, rect) {
  element.style.top = `${rect.top - 40}px`;
  element.style.left = `${rect.left + rect.width / 2 - 15}px`;
}

function createDefaultEffect(targetRect) {
  const hintElement = document.createElement('div');
  hintElement.className = 'visual-hint default';
  updateDefaultPosition(hintElement, targetRect);
  return hintElement;
}

function updateDefaultPosition(element, rect) {
  element.style.top = `${rect.top - 5}px`;
  element.style.left = `${rect.left - 5}px`;
  element.style.width = `${rect.width + 10}px`;
  element.style.height = `${rect.height + 10}px`;
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
  const hintTimerRef = useRef(null);
  
  // Apply and clean up hint effects
  useEffect(() => {
    // Clear any existing hint and timer
    if (removeHint) {
      removeHint();
      setRemoveHint(null);
    }
    
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    
    // Apply new hint if available
    if (hint && hint.selector) {
      // Log hint application
      logTaskEvent('Applying visual hint', hint);
      
      try {
        const cleanup = applyVisualHint(
          hint.selector,
          hint.animation || 'pulse',
          hint.effect || 'highlight'
        );
        
        setRemoveHint(() => cleanup);
        
        // Auto-remove hint after 5 seconds
        hintTimerRef.current = setTimeout(() => {
          cleanup();
          setRemoveHint(null);
          hintTimerRef.current = null;
        }, 5000);
      } catch (error) {
        console.error('Error applying visual hint:', error);
      }
      
      return () => {
        if (hintTimerRef.current) {
          clearTimeout(hintTimerRef.current);
        }
      };
    }
  }, [hint]);
  
  // This component doesn't render anything visible
  return null;
}

/**
 * Component to display a list of possible hint targets (for debugging)
 * Only shown in development mode
 * 
 * @component
 * @returns {JSX.Element|null} Debug component or null in production
 */
export function HintDebugger() {
  const [elements, setElements] = useState([]);
  const [visible, setVisible] = useState(false);
  
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const scanPage = () => {
    // Common selectors used in the mission system
    const selectors = [
      '.clockwiseBar',
      '.countercwBar',
      '.testButton',
      '.nextButton',
      '.prevButton',
      '.playButton',
      '.timeButton',
      '.buttonStateCircle',
      '.actionButton button',
      '.senseButton button',
      '.subtypeButton',
      '.motorDashContainer'
    ];
    
    const found = [];
    
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          found.push({
            selector,
            count: elements.length
          });
        }
      } catch (error) {
        console.warn(`Error finding ${selector}:`, error);
      }
    });
    
    setElements(found);
    setVisible(true);
  };
  
  const applyTestHint = (selector) => {
    const cleanup = applyVisualHint(selector, 'pulse', 'highlight');
    setTimeout(cleanup, 3000);
  };
  
  if (!visible) {
    return (
      <button 
        onClick={scanPage}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 10000,
          padding: '5px',
          background: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          opacity: 0.7
        }}
      >
        Hint Debug
      </button>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      zIndex: 10000,
      background: '#333',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      maxHeight: '300px',
      overflowY: 'auto',
      maxWidth: '300px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong>Hint Targets Found</strong>
        <button onClick={() => setVisible(false)}>Close</button>
      </div>
      <ul style={{ margin: 0, padding: '0 0 0 20px' }}>
        {elements.map((item, index) => (
          <li key={index} style={{ marginBottom: '5px' }}>
            <span>{item.selector} ({item.count})</span>
            <button 
              onClick={() => applyTestHint(item.selector)}
              style={{ marginLeft: '10px', fontSize: '12px' }}
            >
              Test
            </button>
          </li>
        ))}
      </ul>
      {elements.length === 0 && <p>No common hint targets found.</p>}
      <button onClick={scanPage} style={{ marginTop: '10px' }}>Rescan</button>
    </div>
  );
}

/**
 * Register to receive hint events from MissionContext 
 * and apply visual effects to the targeted components
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.activeHint - Current active hint from MissionContext
 * @returns {JSX.Element} Hint manager component
 */
export default function HintSystem({ activeHint }) {
  return (
    <>
      <HintManager hint={activeHint} />
      {process.env.NODE_ENV === 'development' && <HintDebugger />}
    </>
  );
}
