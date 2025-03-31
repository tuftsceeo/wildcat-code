/**
 * @file MotorConfigurationTask.js
 * @description Specialized task model for motor configuration tasks
 */

import Task, { logTaskEvent } from './Task';

/**
 * Task model for motor configuration tasks
 * @class
 * @extends Task
 */
export default class MotorConfigurationTask extends Task {
  /**
   * Create a motor configuration task
   * @param {Object} taskData - Task data from mission definition
   */
  constructor(taskData) {
    super(taskData);
    
    // Motor-specific properties
    this.speedRange = taskData.speedRange;
    this.direction = taskData.direction;
    this.validatePort = taskData.validatePort === true;
    this.requiredPort = taskData.port;
  }
  
  /**
   * Validate if the motor configuration meets the task requirements
   * @param {Object} eventData - Data from the event
   * @param {Object} appState - Current application state
   * @returns {boolean} Whether the task is completed
   */
  validateCompletion(eventData, appState) {
    // Log the validation attempt
    logTaskEvent(`Validating motor configuration task`, {
      taskId: this.taskId,
      eventData,
      requirements: {
        speedRange: this.speedRange,
        direction: this.direction,
        validatePort: this.validatePort,
        targetSlot: this.targetSlot
      }
    });
    
    // Check if we're in the right slot
    if (this.targetSlot !== undefined && 
        eventData.slotIndex !== undefined && 
        eventData.slotIndex !== this.targetSlot) {
      logTaskEvent('Motor configuration: Wrong slot', {
        expected: this.targetSlot,
        actual: eventData.slotIndex
      });
      return false;
    }
    
    // If this task is not for motor configuration, it's not valid
    if (eventData.configType !== 'action' || eventData.configSubtype !== 'motor') {
      logTaskEvent('Motor configuration: Wrong type or subtype', {
        type: eventData.configType,
        subtype: eventData.configSubtype
      });
      return false;
    }
    
    // Get the configuration
    const config = eventData.configuration;
    if (!config) {
      logTaskEvent('Motor configuration: No configuration provided');
      return false;
    }
    
    // Handle both single and multiple motor configs
    const motorConfigs = Array.isArray(config) ? config : [config];
    
    // Check each motor configuration
    let isValid = motorConfigs.every(motorConfig => {
      // Check port if required
      if (this.validatePort && appState.detectedMotorPort) {
        if (motorConfig.port !== appState.detectedMotorPort) {
          logTaskEvent('Motor configuration: Wrong port', {
            expected: appState.detectedMotorPort,
            actual: motorConfig.port
          });
          return false;
        }
      }
      
      // If a specific port is required (directly specified)
      if (this.requiredPort && motorConfig.port !== this.requiredPort) {
        logTaskEvent('Motor configuration: Wrong port (explicit)', {
          expected: this.requiredPort,
          actual: motorConfig.port
        });
        return false;
      }
      
      // Get motor speed
      const speed = motorConfig.speed || 0;
      
      // Check speed range
      if (this.speedRange) {
        const absSpeed = Math.abs(speed);
        if (!Task.isInRange(absSpeed, this.speedRange)) {
          logTaskEvent('Motor configuration: Speed out of range', {
            speed,
            range: this.speedRange
          });
          return false;
        }
      }
      
      // Check direction
      if (this.direction) {
        const currentDirection = speed >= 0 ? 'clockwise' : 'countercw';
        if (this.direction !== currentDirection) {
          logTaskEvent('Motor configuration: Wrong direction', {
            expected: this.direction,
            actual: currentDirection,
            speed
          });
          return false;
        }
      }
      
      return true;
    });
    
    logTaskEvent(`Motor configuration validation ${isValid ? 'succeeded' : 'failed'}`);
    return isValid;
  }
  
  /**
   * Get visual hint for motor configuration task
   * @param {Object} appState - Current application state
   * @returns {Object} Hint configuration
   */
  getHint(appState) {
    // If a specific target element is provided, use it
    if (this.targetElement) {
      return super.getHint(appState);
    }
    
    // Otherwise, choose hint based on direction
    if (this.direction === 'clockwise') {
      return {
        selector: '.clockwiseBar',
        animation: 'pulse',
        effect: 'highlight'
      };
    } else if (this.direction === 'countercw') {
      return {
        selector: '.countercwBar',
        animation: 'pulse',
        effect: 'highlight'
      };
    }
    
    // Default to the motor dashboard
    return {
      selector: '.motorDashContainer',
      animation: 'pulse',
      effect: 'highlight'
    };
  }
  
  /**
   * For motor configuration, we specifically handle the CONFIGURATION_CHANGED event
   * @param {string} eventType - Event type to check
   * @returns {boolean} Whether this task handles the event type
   */
  handlesEventType(eventType) {
    return super.handlesEventType(eventType) || eventType === 'CONFIGURATION_CHANGED';
  }
}
