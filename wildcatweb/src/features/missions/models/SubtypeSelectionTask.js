/**
 * @file SubtypeSelectionTask.js
 * @description Specialized task model for subtype selection tasks
 */

import Task, { logTaskEvent } from './Task';

/**
 * Task model for subtype selection tasks
 * @class
 * @extends Task
 */
export default class SubtypeSelectionTask extends Task {
  /**
   * Create a subtype selection task
   * @param {Object} taskData - Task data from mission definition
   */
  constructor(taskData) {
    super(taskData);
    
    // Subtype selection specific properties
    this.requiredType = taskData.requiredType;
    this.requiredSubtype = taskData.requiredSubtype;
  }
  
  /**
   * Validate if the subtype selection meets the task requirements
   * @param {Object} eventData - Data from the event
   * @param {Object} appState - Current application state
   * @returns {boolean} Whether the task is completed
   */
  validateCompletion(eventData, appState) {
    // Log the validation attempt
    logTaskEvent(`Validating subtype selection task`, {
      taskId: this.taskId,
      eventData,
      requirements: {
        requiredType: this.requiredType,
        requiredSubtype: this.requiredSubtype,
        targetSlot: this.targetSlot
      }
    });
    
    // Check if we're in the right slot
    if (this.targetSlot !== undefined && 
        eventData.slotIndex !== undefined && 
        eventData.slotIndex !== this.targetSlot) {
      logTaskEvent('Subtype selection: Wrong slot', {
        expected: this.targetSlot,
        actual: eventData.slotIndex
      });
      return false;
    }
    
    // Check if the selected type matches the required type
    if (eventData.type !== this.requiredType) {
      logTaskEvent('Subtype selection: Wrong type', {
        expected: this.requiredType,
        actual: eventData.type
      });
      return false;
    }
    
    // Check if the selected subtype matches the required subtype
    if (eventData.subtype !== this.requiredSubtype) {
      logTaskEvent('Subtype selection: Wrong subtype', {
        expected: this.requiredSubtype,
        actual: eventData.subtype
      });
      return false;
    }
    
    logTaskEvent('Subtype selection validation succeeded');
    return true;
  }
  
  /**
   * Get visual hint for subtype selection task
   * @returns {Object} Hint configuration
   */
  getHint() {
    // If a specific target element is provided, use it
    if (this.targetElement) {
      return super.getHint();
    }
    
    // Generate selector based on required type and subtype
    let selector = '';
    
    if (this.requiredType === 'action') {
      if (this.requiredSubtype === 'motor') {
        selector = '.subtypeButton[aria-label="Select Speed"]';
      }
    } else if (this.requiredType === 'input') {
      if (this.requiredSubtype === 'time') {
        selector = '.subtypeButton[aria-label="Select Wait"]';
      } else if (this.requiredSubtype === 'button') {
        selector = '.subtypeButton[aria-label="Select Button"]';
      }
    }
    
    return {
      selector: selector || '.subtypeSelector',
      animation: 'pulse',
      effect: 'highlight'
    };
  }
}
