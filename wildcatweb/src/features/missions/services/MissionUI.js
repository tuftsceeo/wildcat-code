/**
 * @file MissionUI.js
 * @description UI utilities for mission components including visibility control,
 * value prefilling, and UI restrictions
 */

import { logTaskEvent } from '../models/Task';
import { getDeviceByName, deviceMatchesRequirement } from '../utils/DeviceTypes';

/**
 * Class for handling UI visibility and state in mission mode
 */
export default class MissionUI {
  /**
   * Create a new MissionUI instance
   * @param {Object} options - Configuration options 
   */
  constructor(options = {}) {
    this.debugMode = options.debugMode || false;
  }
  
  /**
   * Check if a component should be visible based on mission constraints
   * 
   * @param {string} componentId - ID of the component to check
   * @param {Object} options - Options with current state and task
   * @param {boolean} options.isMissionMode - Whether in mission mode
   * @param {Object} options.currentMission - Current mission data
   * @param {boolean} options.introCompleted - Whether intro phase is completed
   * @param {Object} options.currentTask - Current task if any
   * @returns {boolean} Whether the component should be visible
   */
  isComponentVisible(componentId, { isMissionMode, currentMission, introCompleted, currentTask }) {
    // Default to visible in sandbox mode
    if (!isMissionMode || !currentMission) return true;
    
    // During intro sequence, hide most components
    if (!introCompleted) {
      // Always show these components
      const alwaysVisibleComponents = [
        "bluetooth-menu",
        "mission-button"
      ];
      
      return alwaysVisibleComponents.includes(componentId);
    }
    
    // Get current task if we're in the guided task phase
    if (!currentTask) return true;
    
    // Check if the component has explicit visibility rules in the task
    if (currentTask.uiRestrictions) {
      const { uiRestrictions } = currentTask;
      
      // Check specific component visibility rules
      if (componentId === 'type-selector' && uiRestrictions.hideTypeSelection) {
        if (this.debugMode) {
          logTaskEvent(`Component '${componentId}' hidden by task-level hideTypeSelection`, {
            taskId: currentTask.taskId
          });
        }
        return false;
      }
      
      if (componentId === 'subtype-selector' && uiRestrictions.hideSubtypeSelection) {
        if (this.debugMode) {
          logTaskEvent(`Component '${componentId}' hidden by task-level hideSubtypeSelection`, {
            taskId: currentTask.taskId
          });
        }
        return false;
      }
      
      // Check visibility from explicitly defined lists
      if (uiRestrictions.visibleComponents?.length > 0) {
        const isVisible = uiRestrictions.visibleComponents.includes(componentId);
        if (this.debugMode && !isVisible) {
          logTaskEvent(`Component '${componentId}' not in task-level visibleComponents list`, {
            visibleComponents: uiRestrictions.visibleComponents
          });
        }
        return isVisible;
      }
      
      if (uiRestrictions.hiddenComponents?.length > 0) {
        const isHidden = uiRestrictions.hiddenComponents.includes(componentId);
        if (this.debugMode && isHidden) {
          logTaskEvent(`Component '${componentId}' in task-level hiddenComponents list`, {
            hiddenComponents: uiRestrictions.hiddenComponents
          });
        }
        return !isHidden;
      }
    }
    
    // If no task-specific rules, check mission-level rules
    if (currentMission.uiRestrictions) {
      const { uiRestrictions } = currentMission;
      
      // Check specific component visibility rules
      if (componentId === 'type-selector' && uiRestrictions.hideTypeSelection) {
        if (this.debugMode) {
          logTaskEvent(`Component '${componentId}' hidden by mission-level hideTypeSelection`);
        }
        return false;
      }
      
      if (componentId === 'subtype-selector' && uiRestrictions.hideSubtypeSelection) {
        if (this.debugMode) {
          logTaskEvent(`Component '${componentId}' hidden by mission-level hideSubtypeSelection`);
        }
        return false;
      }
      
      // Check visibility from explicitly defined lists
      if (uiRestrictions.visibleComponents?.length > 0) {
        const isVisible = uiRestrictions.visibleComponents.includes(componentId);
        if (this.debugMode && !isVisible) {
          logTaskEvent(`Component '${componentId}' not in mission-level visibleComponents list`, {
            visibleComponents: uiRestrictions.visibleComponents
          });
        }
        return isVisible;
      }
      
      if (uiRestrictions.hiddenComponents?.length > 0) {
        const isHidden = uiRestrictions.hiddenComponents.includes(componentId);
        if (this.debugMode && isHidden) {
          logTaskEvent(`Component '${componentId}' in mission-level hiddenComponents list`, {
            hiddenComponents: uiRestrictions.hiddenComponents
          });
        }
        return !isHidden;
      }
    }
    
    // Default to visible
    return true;
  }
  
  /**
   * Check if a component is enabled based on mission constraints
   * 
   * @param {string} componentId - ID of the component to check
   * @param {Object} options - Options with current state and task
   * @param {boolean} options.isMissionMode - Whether in mission mode
   * @param {Object} options.currentMission - Current mission data
   * @param {boolean} options.introCompleted - Whether intro phase is completed
   * @param {Object} options.currentTask - Current task if any
   * @param {Object} options.additionalOptions - Additional component-specific options
   * @returns {boolean} Whether the component is enabled
   */
  isComponentEnabled(componentId, { 
    isMissionMode, 
    currentMission, 
    introCompleted, 
    currentTask,
    additionalOptions = {}
  }) {
    // Default to enabled in sandbox mode
    if (!isMissionMode || !currentMission) return true;
    
    // During intro sequence, disable most components
    if (!introCompleted) {
      // Always enable these components
      const alwaysEnabledComponents = [
        "bluetooth-menu",
        "mission-button"
      ];
      
      return alwaysEnabledComponents.includes(componentId);
    }
    
    if (!currentTask) return true;
    
    // Check if the component has explicit enable/disable rules
    if (currentTask.uiRestrictions) {
      const { uiRestrictions } = currentTask;
      
      // Check if component is in disabled list
      if (uiRestrictions.disabledComponents?.length > 0) {
        const isDisabled = uiRestrictions.disabledComponents.includes(componentId);
        if (this.debugMode && isDisabled) {
          logTaskEvent(`Component '${componentId}' in task-level disabledComponents list`, {
            disabledComponents: uiRestrictions.disabledComponents
          });
        }
        return !isDisabled;
      }
      
      // For subtype options
      if (componentId.startsWith('subtype-') && additionalOptions.type) {
        const subtypeName = componentId.replace('subtype-', '');
        if (uiRestrictions.disableSubtypeOptions?.includes(subtypeName)) {
          if (this.debugMode) {
            logTaskEvent(`Subtype '${subtypeName}' in task-level disableSubtypeOptions list`, {
              disableSubtypeOptions: uiRestrictions.disableSubtypeOptions
            });
          }
          return false;
        }
      }
    }
    
    // Check mission-level restrictions
    if (currentMission.uiRestrictions) {
      const { uiRestrictions } = currentMission;
      
      // Check if component is in disabled list
      if (uiRestrictions.disabledComponents?.length > 0) {
        const isDisabled = uiRestrictions.disabledComponents.includes(componentId);
        if (this.debugMode && isDisabled) {
          logTaskEvent(`Component '${componentId}' in mission-level disabledComponents list`, {
            disabledComponents: uiRestrictions.disabledComponents
          });
        }
        return !isDisabled;
      }
      
      // For subtype options
      if (componentId.startsWith('subtype-') && additionalOptions.type) {
        const subtypeName = componentId.replace('subtype-', '');
        if (uiRestrictions.disableSubtypeOptions?.includes(subtypeName)) {
          if (this.debugMode) {
            logTaskEvent(`Subtype '${subtypeName}' in mission-level disableSubtypeOptions list`, {
              disableSubtypeOptions: uiRestrictions.disableSubtypeOptions
            });
          }
          return false;
        }
      }
    }
    
    // Default to enabled
    return true;
  }
  
  /**
   * Get prefilled value for a configuration field if specified in the mission
   * 
   * @param {string} fieldName - Name of the configuration field
   * @param {Object} options - Options with current state and task
   * @param {boolean} options.isMissionMode - Whether in mission mode
   * @param {Object} options.currentMission - Current mission data
   * @param {boolean} options.introCompleted - Whether intro phase is completed
   * @param {Object} options.currentTask - Current task if any
   * @returns {any} Prefilled value or undefined
   */
  getPrefilledValue(fieldName, { isMissionMode, currentMission, introCompleted, currentTask }) {
    if (!isMissionMode || !currentMission || !introCompleted) return undefined;
    
    if (!currentTask?.uiRestrictions?.prefilledValues) {
      // Check mission-level prefilled values
      if (currentMission.uiRestrictions?.prefilledValues) {
        const value = currentMission.uiRestrictions.prefilledValues[fieldName];
        if (this.debugMode && value !== undefined) {
          logTaskEvent(`Mission-level prefilled value for ${fieldName}`, { value });
        }
        return value;
      }
      return undefined;
    }
    
    const value = currentTask.uiRestrictions.prefilledValues[fieldName];
    if (this.debugMode && value !== undefined) {
      logTaskEvent(`Task-level prefilled value for ${fieldName}`, { value, taskId: currentTask.taskId });
    }
    return value;
  }
  
  /**
   * Check if a configuration value is locked (cannot be changed)
   * 
   * @param {string} fieldName - Name of the configuration field
   * @param {Object} options - Options with current state and task
   * @param {boolean} options.isMissionMode - Whether in mission mode
   * @param {Object} options.currentMission - Current mission data
   * @param {boolean} options.introCompleted - Whether intro phase is completed
   * @param {Object} options.currentTask - Current task if any
   * @returns {boolean} Whether the field is locked
   */
  isValueLocked(fieldName, { isMissionMode, currentMission, introCompleted, currentTask }) {
    if (!isMissionMode || !currentMission || !introCompleted) return false;
    
    if (!currentTask?.uiRestrictions?.lockedValues) {
      // Check mission-level locked values
      if (currentMission.uiRestrictions?.lockedValues) {
        const isLocked = fieldName in currentMission.uiRestrictions.lockedValues;
        if (this.debugMode && isLocked) {
          logTaskEvent(`Mission-level locked value for ${fieldName}`);
        }
        return isLocked;
      }
      return false;
    }
    
    const isLocked = fieldName in currentTask.uiRestrictions.lockedValues;
    if (this.debugMode && isLocked) {
      logTaskEvent(`Task-level locked value for ${fieldName}`, { taskId: currentTask.taskId });
    }
    return isLocked;
  }
  
  /**
   * Check if the current setup has all required hardware
   * 
   * @param {Object} options - Options with current state and mission
   * @param {Object} options.currentMission - Current mission data
   * @param {boolean} options.isConnected - Whether Bluetooth is connected
   * @param {Object} options.portStates - Current port states
   * @returns {Object} Validation result with status and missing hardware
   */
  validateHardwareRequirements({ currentMission, isConnected, portStates }) {
    if (!currentMission || !isConnected) {
      return { isValid: true, missingHardware: [] };
    }
    
    const missingHardware = [];
    
    // Check hardware requirements from mission data
    if (currentMission.hardwareRequirements) {
      currentMission.hardwareRequirements.forEach(requirement => {
        const { deviceName, count = 1 } = requirement;
        
        // Count connected devices of this type
        const connectedCount = Object.values(portStates)
          .filter(port => port && deviceMatchesRequirement(port.deviceType, deviceName))
          .length;
        
        // Add to missing hardware if not enough connected
        if (connectedCount < count) {
          missingHardware.push(deviceName);
        }
      });
    }
    
    if (this.debugMode) {
      logTaskEvent(`Hardware validation ${missingHardware.length === 0 ? 'succeeded' : 'failed'}`, {
        missingHardware,
        requirements: currentMission.hardwareRequirements,
        connectedDevices: portStates
      });
    }
    
    return {
      isValid: missingHardware.length === 0,
      missingHardware,
      allowSkip: true // Allow skipping hardware check
    };
  }
}
