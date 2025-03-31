/**
 * @file TimerSettingTask.js
 * @description Specialized task model for timer setting tasks
 */

import Task, { logTaskEvent } from './Task';

/**
 * Task model for timer setting tasks
 * @class
 * @extends Task
 */
export default class TimerSettingTask extends Task {
  /**
   * Create a timer setting task
   * @param {Object} taskData - Task data from mission definition
   */
  constructor(taskData) {
    super(taskData);
    
    // Timer-specific properties
    this.timeRange = taskData.timeRange;
    this.exactValue = taskData.exactValue;
  }
  
  /**
   * Validate if the timer configuration meets the task requirements
   * @param {Object} eventData - Data from the event
   * @param {Object} appState - Current application state
   * @returns {boolean} Whether the task is completed
   */
  validateCompletion(eventData, appState) {
    // Log the validation attempt
    logTaskEvent(`Validating timer setting task`, {
      taskId: this.taskId,
      eventData,
      requirements: {
        timeRange: this.timeRange,
        exactValue: this.exactValue,
        targetSlot: this.targetSlot
      }
    });
    
    // Check if we're in the right slot
    if (this.targetSlot !== undefined && 
        eventData.slotIndex !== undefined && 
        eventData.slotIndex !== this.targetSlot) {
      logTaskEvent('Timer setting: Wrong slot', {
        expected: this.targetSlot,
        actual: eventData.slotIndex
      });
      return false;
    }
    
    // If this task is not for timer setting, it's not valid
    if (eventData.configType !== 'input' || eventData.configSubtype !== 'time') {
      logTaskEvent('Timer setting: Wrong type or subtype', {
        type: eventData.configType,
        subtype: eventData.configSubtype
      });
      return false;
    }
    
    // Get the configuration
    const config = eventData.configuration;
    if (!config) {
      logTaskEvent('Timer setting: No configuration provided');
      return false;
    }
    
    // Get timer seconds
    const seconds = config.seconds || 0;
    
    // Check for exact value match if specified
    if (this.exactValue !== undefined) {
      const isValid = seconds === this.exactValue;
      logTaskEvent(`Timer setting exact value check: ${isValid ? 'succeeded' : 'failed'}`, {
        expected: this.exactValue,
        actual: seconds
      });
      return isValid;
    }
    
    // Check range if specified
    if (this.timeRange) {
      const isValid = Task.isInRange(seconds, this.timeRange);
      logTaskEvent(`Timer setting range check: ${isValid ? 'succeeded' : 'failed'}`, {
        value: seconds,
        range: this.timeRange
      });
      return isValid;
    }
    
    // If no specific requirements, any non-zero value is valid
    const isValid = seconds > 0;
    logTaskEvent(`Timer setting non-zero check: ${isValid ? 'succeeded' : 'failed'}`);
    return isValid;
  }
  
  /**
   * Get visual hint for timer setting task
   * @returns {Object} Hint configuration
   */
  getHint() {
    // If a specific target element is provided, use it
    if (this.targetElement) {
      return super.getHint();
    }
    
    // Default to the time button
    return {
      selector: '.timeButton',
      animation: 'pulse',
      effect: 'highlight'
    };
  }
  
  /**
   * For timer setting, we specifically handle the CONFIGURATION_CHANGED event
   * @param {string} eventType - Event type to check
   * @returns {boolean} Whether this task handles the event type
   */
  handlesEventType(eventType) {
    return super.handlesEventType(eventType) || eventType === 'CONFIGURATION_CHANGED';
  }
}
