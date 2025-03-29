/**
 * @file TaskRegistry.js
 * @description Registry system for task types and their handlers in the mission system.
 */

/**
 * Task type constants
 * These define all possible task types in the mission system
 */
export const TASK_TYPES = {
  // Task types for guided tasks
  MOTOR_CONFIGURATION: "MOTOR_CONFIGURATION",
  TEST_EXECUTION: "TEST_EXECUTION",
  NAVIGATION: "NAVIGATION",
  SELECT_ACTION_TYPE: "SELECT_ACTION_TYPE",
  SELECT_INPUT_TYPE: "SELECT_INPUT_TYPE",
  SELECT_SUBTYPE: "SELECT_SUBTYPE",
  TIMER_SETTING: "TIMER_SETTING",
  BUTTON_CONFIGURATION: "BUTTON_CONFIGURATION",
  RUN_PROGRAM: "RUN_PROGRAM"
};

/**
 * Registry to store task handlers
 * @private
 */
const taskHandlers = {};

/**
 * Register a handler for a specific task type
 *
 * @param {string} taskType - Task type from TASK_TYPES
 * @param {Object} handler - Handler object with validate and isCompleted methods
 */
export function registerTaskHandler(taskType, handler) {
  if (!handler.validate || typeof handler.validate !== "function") {
    console.error(`Handler for ${taskType} missing validate method`);
    return;
  }

  if (!handler.isCompleted || typeof handler.isCompleted !== "function") {
    console.error(`Handler for ${taskType} missing isCompleted method`);
    return;
  }

  taskHandlers[taskType] = handler;
  console.log(`Registered handler for task type: ${taskType}`);
}

/**
 * Validate if a task can be completed in the current state
 *
 * @param {string} taskType - Type of task to validate
 * @param {Object} taskData - Task configuration data
 * @param {Object} currentState - Current application state
 * @returns {boolean} Whether the task is valid
 */
export function validateTask(taskType, taskData, currentState) {
  if (!taskHandlers[taskType]) {
    console.warn(`No handler registered for task type: ${taskType}`);
    return false;
  }

  try {
    return taskHandlers[taskType].validate(taskData, currentState);
  } catch (error) {
    console.error(`Error validating task ${taskType}:`, error);
    return false;
  }
}

/**
 * Check if a task is completed based on current state
 *
 * @param {string} taskType - Type of task to check
 * @param {Object} taskData - Task configuration data
 * @param {Object} currentState - Current application state
 * @returns {boolean} Whether the task is completed
 */
export function isTaskCompleted(taskType, taskData, currentState) {
  if (!taskHandlers[taskType]) {
    console.warn(`No handler registered for task type: ${taskType}`);
    return false;
  }

  try {
    return taskHandlers[taskType].isCompleted(taskData, currentState);
  } catch (error) {
    console.error(`Error checking completion for task ${taskType}:`, error);
    return false;
  }
}

/**
 * Get a hint for the current task based on its state
 * Returns only visual hint details without text
 *
 * @param {string} taskType - Type of task
 * @param {Object} taskData - Task configuration data
 * @param {Object} currentState - Current application state
 * @returns {Object|null} Hint object with selector and animation type, or null
 */
export function getTaskHint(taskType, taskData, currentState) {
  if (!taskHandlers[taskType]) {
    console.warn(`No handler registered for task type: ${taskType}`);
    return null;
  }

  if (!taskHandlers[taskType].getHint) {
    return null;
  }

  try {
    return taskHandlers[taskType].getHint(taskData, currentState);
  } catch (error) {
    console.error(`Error getting hint for task ${taskType}:`, error);
    return null;
  }
}

/**
 * Get registered task types
 *
 * @returns {Array} Array of registered task types
 */
export function getRegisteredTaskTypes() {
  return Object.keys(taskHandlers);
}

/**
 * Default export of all registry functionality
 */
export default {
  TASK_TYPES,
  registerTaskHandler,
  validateTask,
  isTaskCompleted,
  getTaskHint,
  getRegisteredTaskTypes
};