/**
 * @file NavigationTask.js
 * @description Specialized task model for navigation tasks
 */

import Task, { logTaskEvent } from './Task';

/**
 * Task model for navigation tasks
 * @class
 * @extends Task
 */
export default class NavigationTask extends Task {
  /**
   * Create a navigation task
   * @param {Object} taskData - Task data from mission definition
   */
  constructor(taskData) {
    super(taskData);
    
    // Navigation-specific properties
    this.direction = taskData.direction; // Optional: "next" or "previous"
  }
  
  /**
   * Validate if the navigation meets the task requirements
   * @param {Object} eventData - Data from the event
   * @param {Object} appState - Current application state
   * @returns {boolean} Whether the task is completed
   */
  validateCompletion(eventData, appState) {
    // Log the validation attempt
    logTaskEvent(`Validating navigation task`, {
      taskId: this.taskId,
      eventData,
      requirements: {
        targetSlot: this.targetSlot,
        direction: this.direction
      }
    });
    
    // Check if we're already at the target slot
    if (appState.currSlotNumber === this.targetSlot) {
      logTaskEvent('Navigation: Already at target slot', {
        slot: this.targetSlot
      });
      return true;
    }
    
    // Check if the navigation reached the target slot
    if (eventData.toSlot !== this.targetSlot) {
      logTaskEvent('Navigation: Wrong destination slot', {
        expected: this.targetSlot,
        actual: eventData.toSlot
      });
      return false;
    }
    
    // Check direction if specified
    if (this.direction && eventData.direction !== this.direction) {
      logTaskEvent('Navigation: Wrong direction', {
        expected: this.direction,
        actual: eventData.direction
      });
      return false;
    }
    
    logTaskEvent('Navigation validation succeeded');
    return true;
  }
  
  /**
   * Get visual hint for navigation task based on direction
   * @param {Object} appState - Current application state
   * @returns {Object} Hint configuration
   */
  getHint(appState) {
    // If a specific target element is provided, use it
    if (this.targetElement) {
      return super.getHint();
    }
    
    // Determine direction based on current slot vs target slot
    const currentSlot = appState.currSlotNumber;
    
    if (this.targetSlot > currentSlot) {
      return {
        selector: '.nextButton',
        animation: 'pulse',
        effect: 'highlight'
      };
    } else {
      return {
        selector: '.prevButton',
        animation: 'pulse',
        effect: 'highlight'
      };
    }
  }
}
