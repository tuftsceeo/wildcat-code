/**
 * @file TestExecutionTask.js
 * @description Specialized task model for test execution tasks
 */

import Task, { logTaskEvent } from './Task';

/**
 * Task model for test execution tasks
 * @class
 * @extends Task
 */
export default class TestExecutionTask extends Task {
  /**
   * Create a test execution task
   * @param {Object} taskData - Task data from mission definition
   */
  constructor(taskData) {
    super(taskData);
  }
  
  /**
   * Validate if the test execution meets the task requirements
   * @param {Object} eventData - Data from the event
   * @param {Object} appState - Current application state
   * @returns {boolean} Whether the task is completed
   */
  validateCompletion(eventData, appState) {
    // Log the validation attempt
    logTaskEvent(`Validating test execution task`, {
      taskId: this.taskId,
      eventData,
      requirements: {
        targetSlot: this.targetSlot
      }
    });
    
    // Check if we're in the right slot
    if (this.targetSlot !== undefined && 
        eventData.slotIndex !== undefined && 
        eventData.slotIndex !== this.targetSlot) {
      logTaskEvent('Test execution: Wrong slot', {
        expected: this.targetSlot,
        actual: eventData.slotIndex
      });
      return false;
    }
    
    // For test execution, we mainly verify that the test was triggered
    // We might want to check the instruction type in the future
    
    // Make sure we have the current slot in the event data
    if (eventData.currentSlot !== undefined && 
        this.targetSlot !== undefined && 
        eventData.currentSlot !== this.targetSlot) {
      logTaskEvent('Test execution: Not on the target slot', {
        expected: this.targetSlot, 
        actual: eventData.currentSlot
      });
      return false;
    }
    
    logTaskEvent('Test execution validation succeeded');
    return true;
  }
  
  /**
   * Get visual hint for test execution task
   * @returns {Object} Hint configuration
   */
  getHint() {
    // If a specific target element is provided, use it
    if (this.targetElement) {
      return super.getHint();
    }
    
    // Default to the test button
    return {
      selector: '.testButton',
      animation: 'pulse',
      effect: 'highlight'
    };
  }
}
