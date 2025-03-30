/**
 * @file TypeSelectionTask.js
 * @description Specialized task models for selecting action or input types
 */

import Task, { logTaskEvent } from './Task';

/**
 * Base class for type selection tasks
 * @class
 * @extends Task
 */
class TypeSelectionTask extends Task {
  /**
   * Create a type selection task
   * @param {Object} taskData - Task data from mission definition
   */
  constructor(taskData) {
    super(taskData);
    this.requiredType = null; // To be set by subclasses
  }
  
  /**
   * Validate if the type selection meets the task requirements
   * @param {Object} eventData - Data from the event
   * @param {Object} appState - Current application state
   * @returns {boolean} Whether the task is completed
   */
  validateCompletion(eventData, appState) {
    // Log the validation attempt
    logTaskEvent(`Validating type selection task`, {
      taskId: this.taskId,
      eventData,
      requirements: {
        requiredType: this.requiredType,
        targetSlot: this.targetSlot
      }
    });
    
    // Check if we're in the right slot
    if (this.targetSlot !== undefined && 
        eventData.slotIndex !== undefined && 
        eventData.slotIndex !== this.targetSlot) {
      logTaskEvent('Type selection: Wrong slot', {
        expected: this.targetSlot,
        actual: eventData.slotIndex
      });
      return false;
    }
    
    // Check if the selected type matches the required type
    if (eventData.type !== this.requiredType) {
      logTaskEvent('Type selection: Wrong type', {
        expected: this.requiredType,
        actual: eventData.type
      });
      return false;
    }
    
    logTaskEvent('Type selection validation succeeded');
    return true;
  }
}

/**
 * Task model for selecting the ACTION type
 * @class
 * @extends TypeSelectionTask
 */
export class ActionTypeSelectionTask extends TypeSelectionTask {
  /**
   * Create an action type selection task
   * @param {Object} taskData - Task data from mission definition
   */
  constructor(taskData) {
    super(taskData);
    this.requiredType = 'action';
  }
  
  /**
   * Get visual hint for action type selection task
   * @returns {Object} Hint configuration
   */
  getHint() {
    // If a specific target element is provided, use it
    if (this.targetElement) {
      return super.getHint();
    }
    
    // Default to the action button
    return {
      selector: '.actionButton button',
      animation: 'pulse',
      effect: 'highlight'
    };
  }
  
  /**
   * For action type selection, we handle the ACTION_TYPE_SELECTED event
   * @param {string} eventType - Event type to check
   * @returns {boolean} Whether this task handles the event type
   */
  handlesEventType(eventType) {
    return super.handlesEventType(eventType) || eventType === 'ACTION_TYPE_SELECTED';
  }
}

/**
 * Task model for selecting the INPUT type
 * @class
 * @extends TypeSelectionTask
 */
export class InputTypeSelectionTask extends TypeSelectionTask {
  /**
   * Create an input type selection task
   * @param {Object} taskData - Task data from mission definition
   */
  constructor(taskData) {
    super(taskData);
    this.requiredType = 'input';
  }
  
  /**
   * Get visual hint for input type selection task
   * @returns {Object} Hint configuration
   */
  getHint() {
    // If a specific target element is provided, use it
    if (this.targetElement) {
      return super.getHint();
    }
    
    // Default to the sense button
    return {
      selector: '.senseButton button',
      animation: 'pulse',
      effect: 'highlight'
    };
  }
  
  /**
   * For input type selection, we handle the INPUT_TYPE_SELECTED event
   * @param {string} eventType - Event type to check
   * @returns {boolean} Whether this task handles the event type
   */
  handlesEventType(eventType) {
    return super.handlesEventType(eventType) || eventType === 'INPUT_TYPE_SELECTED';
  }
}
