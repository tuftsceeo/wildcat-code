/**
 * @file TaskRegistry.js
 * @description Registry system for task types and their handlers in the mission system.
 * Provides a centralized way to register, validate, and check completion for different task types.
 * @author Implementation based on design documents
 * @created April 2025
 */

/**
 * Common task type constants
 * These define all possible task types in the mission system
 */
export const TASK_TYPES = {
    HARDWARE_CONNECTION: "hardware_connection",
    SELECT_ACTION_TYPE: "select_action_type",
    SELECT_INPUT_TYPE: "select_input_type",
    SELECT_SUBTYPE: "select_subtype",
    MOTOR_CONFIGURATION: "motor_configuration",
    TIMER_SETTING: "timer_setting",
    BUTTON_CONFIGURATION: "button_configuration",
    TEST_EXECUTION: "test_execution",
    NAVIGATION: "navigation",
    RUN_PROGRAM: "run_program",
};

/**
 * Registry to store task handlers
 * Maps task types to their handler implementation
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
 * Unregister a task handler
 * Used primarily for testing or dynamic handler swapping
 *
 * @param {string} taskType - Task type to unregister
 */
export function unregisterTaskHandler(taskType) {
    if (taskHandlers[taskType]) {
        delete taskHandlers[taskType];
        console.log(`Unregistered handler for task type: ${taskType}`);
    }
}
