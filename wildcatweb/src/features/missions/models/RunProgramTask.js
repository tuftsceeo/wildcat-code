/**
 * @file RunProgramTask.js
 * @description Specialized task model for running the full program
 */

import Task, { logTaskEvent } from './Task';

/**
 * Task model for run program tasks
 * @class
 * @extends Task
 */
export default class RunProgramTask extends Task {
  /**
   * Create a run program task
   * @param {Object} taskData - Task data from mission definition
   */
  constructor(taskData) {
    super(taskData);
  }
  
  /**
   * Validate if the program run meets the task requirements
   * @param {Object} eventData - Data from the event
   * @returns {boolean} Whether the task is completed
   */
  validateCompletion(eventData) {
    // Log the validation attempt
    logTaskEvent(`Validating run program task`, {
      taskId: this.taskId,
      eventData
    });
    
    // Check starting slot if specified
    if (this.targetSlot !== undefined && 
        eventData.currentSlot !== undefined && 
        eventData.currentSlot !== this.targetSlot) {
      logTaskEvent('Run program: Not starting from target slot', {
        expected: this.targetSlot,
        actual: eventData.currentSlot
      });
      // This is a warning but not a blocker - user might want to run from any slot
    }
    
    // Basic check: the run program event happened
    logTaskEvent('Run program validation succeeded');
    return true;
  }
  
  /**
   * Get visual hint for run program task
   * @returns {Object} Hint configuration
   */
  getHint() {
    // If a specific target element is provided, use it
    if (this.targetElement) {
      return super.getHint();
    }
    
    // Default to the play button
    return {
      selector: '.playButton',
      animation: 'pulse',
      effect: 'highlight'
    };
  }
}
