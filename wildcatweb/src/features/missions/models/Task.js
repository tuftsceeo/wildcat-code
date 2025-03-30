/**
 * @file Task.js
 * @description Base Task model that defines the core structure and validation methods
 * for all task types in the mission system. Provides a foundation for specialized task types.
 */

/**
 * Debug flag to enable/disable task-related logging
 * @type {boolean}
 */
export const DEBUG_TASKS = true;

/**
 * Log a task-related message with optional data if debugging is enabled
 * @param {string} message - Message to log
 * @param {Object} [data] - Optional data to include in log
 */
export function logTaskEvent(message, data) {
  if (DEBUG_TASKS) {
    console.log(`[TASK EVENT] ${message}`, data || '');
  }
}

/**
 * Base Task class that all specific task types extend
 * @class
 */
export default class Task {
  /**
   * Create a new Task
   * @param {Object} taskData - Raw task data from mission definition
   */
  constructor(taskData) {
    this.taskId = taskData.taskId || `task-${Date.now()}`;
    this.type = taskData.type;
    this.targetSlot = taskData.targetSlot;
    this.instruction = taskData.instruction || '';
    this.stepTitle = taskData.stepTitle || '';
    this.targetElement = taskData.targetElement;
    this.uiRestrictions = taskData.uiRestrictions || {};
    
    // Additional properties from task data
    this.rawTaskData = taskData;
  }

  /**
   * Validate if task can be completed based on current state and event
   * Base implementation always returns false - specialized tasks must override
   * 
   * @param {Object} eventData - Data from the triggering event
   * @param {Object} appState - Current application state
   * @returns {boolean} Whether the task is completed
   */
  validateCompletion(eventData, appState) {
    // Base implementation - should be overridden by subclasses
    logTaskEvent(`Base validation called for ${this.type} (this should be overridden)`, {
      taskId: this.taskId,
      eventData,
      taskType: this.type
    });
    return false;
  }
  
  /**
   * Get visual hint details for this task
   * @param {Object} appState - Current application state
   * @returns {Object|null} Hint object with selector and animation properties
   */
  getHint(appState) {
    // Default implementation returns hint based on targetElement
    if (this.targetElement) {
      return {
        selector: this.targetElement,
        animation: "pulse",
        effect: "highlight"
      };
    }
    return null;
  }
  
  /**
   * Check if this task is targeted at a specific slot
   * @param {number} slotIndex - Slot index to check
   * @returns {boolean} Whether this task targets the specified slot
   */
  isForSlot(slotIndex) {
    return this.targetSlot === slotIndex;
  }
  
  /**
   * Check if this task can handle a specific event type
   * @param {string} eventType - Event type to check
   * @returns {boolean} Whether this task handles the event type
   */
  handlesEventType(eventType) {
    return this.type === eventType;
  }
  
  /**
   * Create event data for task completion
   * @param {Object} baseEventData - Original event data
   * @returns {Object} Enhanced event data for task completion
   */
  createCompletionData(baseEventData) {
    return {
      ...baseEventData,
      taskId: this.taskId,
      taskType: this.type,
      completedAt: Date.now()
    };
  }
  
  /**
   * Utility method to safely check if a value is within a range
   * @param {number} value - Value to check
   * @param {Array<number>} range - [min, max] range
   * @returns {boolean} Whether value is within range (inclusive)
   */
  static isInRange(value, range) {
    if (!range || !Array.isArray(range) || range.length !== 2) {
      return true; // No valid range specified, so consider it valid
    }
    
    const [min, max] = range;
    return value >= min && value <= max;
  }
  
  /**
   * Factory method to create the appropriate task type from task data
   * @param {Object} taskData - Raw task data
   * @returns {Task} Task instance of the appropriate type
   */
  static createFromData(taskData) {
    // This will be implemented after specialized task classes are defined
    // We'll import all task types and return the appropriate one based on taskData.type
    return new Task(taskData);
  }
}
