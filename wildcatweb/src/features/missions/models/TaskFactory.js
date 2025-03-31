/**
 * @file TaskFactory.js
 * @description Factory for creating task models based on task type
 */

import Task from './Task';
import MotorConfigurationTask from './MotorConfigurationTask';
import TimerSettingTask from './TimerSettingTask';
import ButtonConfigurationTask from './ButtonConfigurationTask';
import TestExecutionTask from './TestExecutionTask';
import NavigationTask from './NavigationTask';
import RunProgramTask from './RunProgramTask';
import { ActionTypeSelectionTask, InputTypeSelectionTask } from './TypeSelectionTask';
import SubtypeSelectionTask from './SubtypeSelectionTask';

/**
 * Task types constants
 * @type {Object}
 */
export const TASK_TYPES = {
  MOTOR_CONFIGURATION: 'MOTOR_CONFIGURATION',
  TIMER_SETTING: 'TIMER_SETTING',
  BUTTON_CONFIGURATION: 'BUTTON_CONFIGURATION',
  TEST_EXECUTION: 'TEST_EXECUTION',
  NAVIGATION: 'NAVIGATION',
  SELECT_ACTION_TYPE: 'SELECT_ACTION_TYPE',
  SELECT_INPUT_TYPE: 'SELECT_INPUT_TYPE',
  SELECT_SUBTYPE: 'SELECT_SUBTYPE',
  RUN_PROGRAM: 'RUN_PROGRAM'
};

/**
 * Factory for creating task models based on task type
 */
export default class TaskFactory {
  /**
   * Create a task model from task data
   * @param {Object} taskData - Task data from mission definition
   * @returns {Task} Task model instance
   */
  static createTask(taskData) {
    if (!taskData || !taskData.type) {
      console.error('Invalid task data:', taskData);
      return new Task(taskData || {});
    }
    
    switch (taskData.type) {
      case TASK_TYPES.MOTOR_CONFIGURATION:
        return new MotorConfigurationTask(taskData);
        
      case TASK_TYPES.TIMER_SETTING:
        return new TimerSettingTask(taskData);
        
      case TASK_TYPES.BUTTON_CONFIGURATION:
        return new ButtonConfigurationTask(taskData);
        
      case TASK_TYPES.TEST_EXECUTION:
        return new TestExecutionTask(taskData);
        
      case TASK_TYPES.NAVIGATION:
        return new NavigationTask(taskData);
        
      case TASK_TYPES.SELECT_ACTION_TYPE:
        return new ActionTypeSelectionTask(taskData);
        
      case TASK_TYPES.SELECT_INPUT_TYPE:
        return new InputTypeSelectionTask(taskData);
        
      case TASK_TYPES.SELECT_SUBTYPE:
        return new SubtypeSelectionTask(taskData);
        
      case TASK_TYPES.RUN_PROGRAM:
        return new RunProgramTask(taskData);
        
      default:
        console.warn(`Unknown task type: ${taskData.type}, using base Task model`);
        return new Task(taskData);
    }
  }
  
  /**
   * Create task models from an array of task data
   * @param {Array<Object>} tasksData - Array of task data
   * @returns {Array<Task>} Array of task model instances
   */
  static createTasks(tasksData) {
    if (!Array.isArray(tasksData)) {
      console.error('Invalid tasks data, expected array:', tasksData);
      return [];
    }
    
    return tasksData.map(taskData => TaskFactory.createTask(taskData));
  }
}
