/**
 * @file TaskService.js
 * @description Service for handling task operations, validation, and event processing
 */

import { logTaskEvent } from '../models/Task';
import TaskFactory, { TASK_TYPES } from '../models/TaskFactory';
import { processInstructions } from '../utils/InstructionTemplating';

/**
 * Task management service
 */
class TaskService {
  constructor() {
    this.tasks = []; // Array of task model instances
    this.currentTaskIndex = 0;
    this.completedTasks = {}; // Map of taskIndex to completion data
  }
  
  /**
   * Initialize with tasks from a mission
   * @param {Object} mission - Mission object containing tasks array
   */
  initTasks(mission) {
    if (!mission || !Array.isArray(mission.tasks)) {
      console.error('Invalid mission or tasks array:', mission);
      this.tasks = [];
      return;
    }
    
    // Create task models from mission data
    this.tasks = TaskFactory.createTasks(mission.tasks);
    this.currentTaskIndex = 0;
    this.completedTasks = {};
    
    logTaskEvent('Initialized tasks', {
      missionId: mission.missionId,
      taskCount: this.tasks.length
    });
  }
  
  /**
   * Update task instructions with processed versions
   * @param {Object} devices - Map of device types to port arrays
   */
  updateTaskInstructions(devices) {
    if (!this.tasks || !Array.isArray(this.tasks)) {
      console.error('No tasks to update');
      return;
    }
    
    // Process instructions for all tasks
    processInstructions(this.tasks, devices);
    
    logTaskEvent('Updated task instructions', {
      taskCount: this.tasks.length,
      devices
    });
  }
  
  /**
   * Get the current active task
   * @returns {Task|null} Current task or null if no tasks
   */
  getCurrentTask() {
    if (this.tasks.length === 0 || this.currentTaskIndex >= this.tasks.length) {
      return null;
    }
    return this.tasks[this.currentTaskIndex];
  }
  
  /**
   * Get a task by index
   * @param {number} index - Task index
   * @returns {Task|null} Task at the index or null if not found
   */
  getTask(index) {
    if (index < 0 || index >= this.tasks.length) {
      return null;
    }
    return this.tasks[index];
  }
  
  /**
   * Check if a task is completed
   * @param {number} taskIndex - Index of the task to check
   * @returns {boolean} Whether the task is completed
   */
  isTaskCompleted(taskIndex) {
    return !!this.completedTasks[taskIndex];
  }
  
  /**
   * Get the completion data for a task
   * @param {number} taskIndex - Index of the task
   * @returns {Object|null} Completion data or null if not completed
   */
  getTaskCompletionData(taskIndex) {
    return this.completedTasks[taskIndex] || null;
  }
  
  /**
   * Complete a task manually
   * @param {number} taskIndex - Index of the task to complete
   * @param {Object} data - Completion data
   * @returns {boolean} Whether the completion was successful
   */
  completeTask(taskIndex, data = {}) {
    if (taskIndex < 0 || taskIndex >= this.tasks.length) {
      console.error(`Invalid task index: ${taskIndex}`);
      return false;
    }
    
    const task = this.tasks[taskIndex];
    
    // Check if task exists
    if (!task) {
      console.error(`Task at index ${taskIndex} is undefined`);
      return false;
    }
    
    // Set completion data
    this.completedTasks[taskIndex] = {
      taskId: task.taskId,
      completedAt: Date.now(),
      ...data
    };
    
    logTaskEvent(`Manually completed task ${taskIndex}`, {
      taskId: task.taskId,
      taskType: task.type
    });
    
    // If this is the current task, move to the next one
    if (taskIndex === this.currentTaskIndex && this.currentTaskIndex < this.tasks.length - 1) {
      this.currentTaskIndex++;
      logTaskEvent(`Advanced to next task: ${this.currentTaskIndex}`);
    }
    
    return true;
  }
  
  /**
   * Process a task event and check for task completion
   * @param {string} eventType - Type of event
   * @param {Object} eventData - Event data
   * @param {Object} appState - Current application state
   * @returns {Object} Processing result with completed task index if any
   */
  processTaskEvent(eventType, eventData, appState) {
    logTaskEvent(`Processing ${eventType} event`, eventData);
    
    const result = {
      processed: false,
      taskCompleted: false,
      completedTaskIndex: null,
      isCurrentTask: false
    };
    
    // Get current task first
    const currentTask = this.getCurrentTask();
    
    // If we have a current task and it handles this event type, check it first
    if (currentTask && currentTask.handlesEventType(eventType)) {
      // Check if the current task is already completed
      if (!this.isTaskCompleted(this.currentTaskIndex)) {
        // Validate against the current task
        const isCompleted = currentTask.validateCompletion(eventData, appState);
        
        if (isCompleted) {
          // Complete the current task
          this.completedTasks[this.currentTaskIndex] = currentTask.createCompletionData(eventData);
          
          logTaskEvent(`Event completed current task ${this.currentTaskIndex}`, {
            taskId: currentTask.taskId,
            taskType: currentTask.type
          });
          
          // Move to the next task
          if (this.currentTaskIndex < this.tasks.length - 1) {
            this.currentTaskIndex++;
            logTaskEvent(`Advanced to next task: ${this.currentTaskIndex}`);
          }
          
          result.processed = true;
          result.taskCompleted = true;
          result.completedTaskIndex = this.currentTaskIndex - 1;
          result.isCurrentTask = true;
          
          return result;
        }
      }
    }
    
    // If the event didn't match the current task, check other tasks
    // This helps with tasks that might be completed out of order
    for (let i = 0; i < this.tasks.length; i++) {
      // Skip already completed tasks
      if (this.isTaskCompleted(i)) {
        continue;
      }
      
      const task = this.tasks[i];
      
      // Skip if this task doesn't handle this event type
      if (!task.handlesEventType(eventType)) {
        continue;
      }
      
      // Validate the task
      const isCompleted = task.validateCompletion(eventData, appState);
      
      if (isCompleted) {
        // Complete this task
        this.completedTasks[i] = task.createCompletionData(eventData);
        
        logTaskEvent(`Event completed task ${i}`, {
          taskId: task.taskId,
          taskType: task.type,
          isCurrentTask: i === this.currentTaskIndex
        });
        
        // If this is the current task, move to the next one
        if (i === this.currentTaskIndex && this.currentTaskIndex < this.tasks.length - 1) {
          this.currentTaskIndex++;
          logTaskEvent(`Advanced to next task: ${this.currentTaskIndex}`);
        }
        
        result.processed = true;
        result.taskCompleted = true;
        result.completedTaskIndex = i;
        result.isCurrentTask = i === this.currentTaskIndex;
        
        return result;
      }
    }
    
    logTaskEvent(`No task was completed by ${eventType} event`);
    return result;
  }
  
  /**
   * Get visual hint for the current task
   * @param {Object} appState - Current application state
   * @returns {Object|null} Hint object with selector and animation type, or null
   */
  getCurrentTaskHint(appState) {
    const currentTask = this.getCurrentTask();
    if (!currentTask) {
      return null;
    }
    
    return currentTask.getHint(appState);
  }
  
  /**
   * Validate a step configuration against the current task requirements
   * @param {Object} instruction - Instruction configuration to validate
   * @param {Object} appState - Current application state
   * @returns {Object} Validation result with isValid and message
   */
  validateStepConfiguration(instruction, appState) {
    const currentTask = this.getCurrentTask();
    
    // If no current task or not on the task's target slot, any config is valid
    if (!currentTask || 
        (currentTask.targetSlot !== undefined && 
         appState.currSlotNumber !== currentTask.targetSlot)) {
      return { isValid: true };
    }
    
    // If no instruction, it's not valid
    if (!instruction || !instruction.type) {
      return {
        isValid: false,
        message: "Please configure this step according to the mission instructions."
      };
    }
    
    // Create the event data structure expected by the validation method
    const eventData = {
      slotIndex: appState.currSlotNumber,
      configType: instruction.type,
      configSubtype: instruction.subtype,
      configuration: instruction.configuration,
      currentSlot: appState.currSlotNumber
    };
    
    // Check if this configuration would satisfy the current task
    const isValid = currentTask.validateCompletion(eventData, appState);
    
    return {
      isValid,
      message: isValid 
        ? "" 
        : "This configuration doesn't meet the mission requirements."
    };
  }
  
  /**
   * Reset task state
   */
  resetTasks() {
    this.tasks = [];
    this.currentTaskIndex = 0;
    this.completedTasks = {};
  }
  
  /**
   * Get all task types
   * @returns {Object} Object with task type constants
   */
  getTaskTypes() {
    return TASK_TYPES;
  }
  
  /**
   * Get all tasks
   * @returns {Array<Task>} Array of all tasks
   */
  getAllTasks() {
    return this.tasks;
  }
  
  /**
   * Get completion status summary
   * @returns {Object} Summary of task completion status
   */
  getCompletionSummary() {
    const total = this.tasks.length;
    const completed = Object.keys(this.completedTasks).length;
    
    return {
      total,
      completed,
      remaining: total - completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
  
  /**
   * Check if all tasks are completed
   * @returns {boolean} Whether all tasks are completed
   */
  isAllTasksCompleted() {
    return this.tasks.length > 0 && 
           this.tasks.length === Object.keys(this.completedTasks).length;
  }
}

// Create singleton instance
const taskService = new TaskService();

export default taskService;
