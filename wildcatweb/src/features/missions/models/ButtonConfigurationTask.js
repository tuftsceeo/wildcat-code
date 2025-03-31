/**
 * @file ButtonConfigurationTask.js
 * @description Specialized task model for button/force sensor configuration tasks
 */

import Task, { logTaskEvent } from './Task';

/**
 * Task model for button configuration tasks
 * @class
 * @extends Task
 */
export default class ButtonConfigurationTask extends Task {
  /**
   * Create a button configuration task
   * @param {Object} taskData - Task data from mission definition
   */
  constructor(taskData) {
    super(taskData);
    
    // Button-specific properties
    this.buttonState = taskData.buttonState;
    this.requiredPort = taskData.port;
  }
  
  /**
   * Validate if the button configuration meets the task requirements
   * @param {Object} eventData - Data from the event
   * @param {Object} appState - Current application state
   * @returns {boolean} Whether the task is completed
   */
  validateCompletion(eventData, appState) {
    // Log the validation attempt
    logTaskEvent(`Validating button configuration task`, {
      taskId: this.taskId,
      eventData,
      requirements: {
        buttonState: this.buttonState,
        requiredPort: this.requiredPort,
        targetSlot: this.targetSlot
      }
    });
    
    // Check if we're in the right slot
    if (this.targetSlot !== undefined && 
        eventData.slotIndex !== undefined && 
        eventData.slotIndex !== this.targetSlot) {
      logTaskEvent('Button configuration: Wrong slot', {
        expected: this.targetSlot,
        actual: eventData.slotIndex
      });
      return false;
    }
    
    // If this task is not for button configuration, it's not valid
    if (eventData.configType !== 'input' || eventData.configSubtype !== 'button') {
      logTaskEvent('Button configuration: Wrong type or subtype', {
        type: eventData.configType,
        subtype: eventData.configSubtype
      });
      return false;
    }
    
    // Get the configuration
    const config = eventData.configuration;
    if (!config) {
      logTaskEvent('Button configuration: No configuration provided');
      return false;
    }
    
    // Check port if required
    if (this.requiredPort && config.port !== this.requiredPort) {
      logTaskEvent('Button configuration: Wrong port', {
        expected: this.requiredPort,
        actual: config.port
      });
      return false;
    }
    
    // Check button state if specified
    if (this.buttonState && config.waitCondition !== this.buttonState) {
      logTaskEvent('Button configuration: Wrong state', {
        expected: this.buttonState,
        actual: config.waitCondition
      });
      return false;
    }
    
    // If no specific requirements, any valid configuration is acceptable
    logTaskEvent('Button configuration validation succeeded');
    return true;
  }
  
  /**
   * Get visual hint for button configuration task
   * @returns {Object} Hint configuration
   */
  getHint() {
    // If a specific target element is provided, use it
    if (this.targetElement) {
      return super.getHint();
    }
    
    // Default to the button state selector
    return {
      selector: '.buttonStateCircle',
      animation: 'pulse',
      effect: 'highlight'
    };
  }
  
  /**
   * For button configuration, we specifically handle the CONFIGURATION_CHANGED event
   * @param {string} eventType - Event type to check
   * @returns {boolean} Whether this task handles the event type
   */
  handlesEventType(eventType) {
    return super.handlesEventType(eventType) || eventType === 'CONFIGURATION_CHANGED';
  }
}
