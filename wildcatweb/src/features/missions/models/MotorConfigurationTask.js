/**
 * @file MotorConfigurationTask.js
 * @description Specialized task model for motor configuration tasks
 */

import Task, { logTaskEvent } from './Task';
import motorIdentityManager from '../utils/MotorIdentity';

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
    
    // Support new multi-motor format
    if (taskData.motorRequirements && Array.isArray(taskData.motorRequirements)) {
      this.motorRequirements = taskData.motorRequirements;
    } else {
      // Convert legacy format to new format
      this.motorRequirements = [{
        speedRange: taskData.speedRange,
        direction: taskData.direction,
        validatePort: taskData.validatePort,
        requiredPort: taskData.port
      }];
    }
    
    // Store target motor identity if specified
    this.targetMotorIdentity = taskData.targetMotorIdentity;
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
      requirements: this.motorRequirements,
      targetSlot: this.targetSlot,
      targetMotorIdentity: this.targetMotorIdentity
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
    
    // If we have a target motor identity, we need to find a configuration for that specific motor
    if (this.targetMotorIdentity) {
      // Find configuration for the target motor by looking up its current port assignment
      const targetPort = motorIdentityManager.getPort(this.targetMotorIdentity);
      
      if (!targetPort) {
        logTaskEvent('Motor configuration: Target motor identity not assigned to any port', {
          identity: this.targetMotorIdentity
        });
        return false;
      }
      
      // Find the motor config matching this port
      const targetConfig = motorConfigs.find(cfg => cfg.port === targetPort);
      
      if (!targetConfig) {
        logTaskEvent('Motor configuration: No configuration for target motor', {
          identity: this.targetMotorIdentity,
          port: targetPort
        });
        return false;
      }
      
      // Validate this specific motor configuration
      const isValid = this.motorRequirements.some(requirement => {
        return this.motorConfigMeetsRequirement(targetConfig, requirement, appState);
      });
      
      logTaskEvent(`Motor configuration for ${this.targetMotorIdentity} validation ${isValid ? 'succeeded' : 'failed'}`);
      return isValid;
    }
    
    // If no specific target identity, use the original validation logic
    const allRequirementsMet = this.motorRequirements.every(requirement => {
      return motorConfigs.some(motorConfig => {
        return this.motorConfigMeetsRequirement(motorConfig, requirement, appState);
      });
    });
    
    logTaskEvent(`Motor configuration validation ${allRequirementsMet ? 'succeeded' : 'failed'}`);
    return allRequirementsMet;
  }
  
  /**
   * Check if a motor configuration meets a specific requirement
   * @param {Object} motorConfig - The motor configuration to check
   * @param {Object} requirement - The requirement to check against
   * @param {Object} appState - Current application state
   * @returns {boolean} Whether the configuration meets the requirement
   */
  motorConfigMeetsRequirement(motorConfig, requirement, appState) {
    // Check port if required
    if (requirement.validatePort && appState.detectedMotorPort) {
      if (motorConfig.port !== appState.detectedMotorPort) {
        logTaskEvent('Motor configuration: Wrong port', {
          expected: appState.detectedMotorPort,
          actual: motorConfig.port
        });
        return false;
      }
    }
    
    // If a specific port is required (directly specified)
    if (requirement.requiredPort && motorConfig.port !== requirement.requiredPort) {
      logTaskEvent('Motor configuration: Wrong port (explicit)', {
        expected: requirement.requiredPort,
        actual: motorConfig.port
      });
      return false;
    }
    
    // Get motor speed
    const speed = motorConfig.speed || 0;
    
    // Check speed range
    if (requirement.speedRange) {
      const absSpeed = Math.abs(speed);
      if (!Task.isInRange(absSpeed, requirement.speedRange)) {
        logTaskEvent('Motor configuration: Speed out of range', {
          speed,
          range: requirement.speedRange
        });
        return false;
      }
    }
    
    // Check direction
    if (requirement.direction) {
      const currentDirection = speed >= 0 ? 'clockwise' : 'countercw';
      if (requirement.direction !== currentDirection) {
        logTaskEvent('Motor configuration: Wrong direction', {
          expected: requirement.direction,
          actual: currentDirection,
          speed
        });
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get visual hint for motor configuration task
   * @param {Object} appState - Current application state
   * @returns {Object} Hint configuration
   */
  getHint(appState) {
    // If a specific motor identity is targeted, get its port
    if (this.targetMotorIdentity) {
      const motorPort = motorIdentityManager.getPort(this.targetMotorIdentity);
      if (motorPort) {
        // Use the existing port-based selector
        if (this.motorRequirements[0]?.direction === 'clockwise') {
          return {
            selector: `.singleMotorDash[data-port="${motorPort}"] .clockwiseBar`,
            animation: 'pulse',
            effect: 'highlight'
          };
        } else if (this.motorRequirements[0]?.direction === 'countercw') {
          return {
            selector: `.singleMotorDash[data-port="${motorPort}"] .countercwBar`,
            animation: 'pulse',
            effect: 'highlight'
          };
        } else {
          return {
            selector: `.singleMotorDash[data-port="${motorPort}"]`,
            animation: 'pulse',
            effect: 'highlight'
          };
        }
      }
    }
    
    // Fall back to default behavior
    if (this.targetElement) {
      return super.getHint(appState);
    }
    
    // Default behaviors for direction hints
    const requirement = this.motorRequirements[0];
    if (requirement?.direction === 'clockwise') {
      return {
        selector: '.clockwiseBar',
        animation: 'pulse',
        effect: 'highlight'
      };
    } else if (requirement?.direction === 'countercw') {
      return {
        selector: '.countercwBar',
        animation: 'pulse',
        effect: 'highlight'
      };
    }
    
    // Default
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
