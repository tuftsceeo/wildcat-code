/**
 * @file MissionContext.js
 * @description Context provider with corrected handling of mission phases
 * and dynamic port detection for hardware
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useCustomization } from './CustomizationContext';
import { useBLE } from '../features/bluetooth/context/BLEContext';

// Create context
const MissionContext = createContext();

/**
 * Provider component for mission management with proper phase handling
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 */
export const MissionProvider = ({ children }) => {
  // Mission mode state
  const [isMissionMode, setIsMissionMode] = useState(false);
  const [availableMissions, setAvailableMissions] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  
  // Task tracking
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});
  
  // Introduction phase state
  const [showMissionOverlay, setShowMissionOverlay] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  
  // Hardware detection state
  const [detectedMotorPort, setDetectedMotorPort] = useState(null);
  
  // UI state for prompts
  const [showTestPrompt, setShowTestPrompt] = useState(false);
  const [showRunPrompt, setShowRunPrompt] = useState(false);
  
  // Slot configuration persistence
  const [slotConfigurations, setSlotConfigurations] = useState({});
  
  // Access other contexts
  const { setStepCount } = useCustomization();
  const { isConnected, portStates } = useBLE();

  // Load available missions
  useEffect(() => {
    // Implementation to load missions...
  }, []);

  /**
   * Start a mission by ID
   * Shows intro overlay for hardware check and configuration
   * 
   * @param {string} missionId - ID of the mission to start
   */
  const startMission = useCallback((missionId) => {
    const mission = availableMissions.find(m => m.missionId === missionId);
    
    if (mission) {
      setCurrentMission(mission);
      setCurrentTaskIndex(0);
      setCompletedTasks({});
      setSlotConfigurations({});
      setDetectedMotorPort(null);
      setIsMissionMode(true);
      setIntroCompleted(false);
      
      // Show introduction overlay
      setShowMissionOverlay(true);
      
      // Set step count for the mission
      setStepCount(mission.totalSteps + 1); // +1 for stop step
    } else {
      console.error(`Mission with ID ${missionId} not found.`);
    }
  }, [availableMissions, setStepCount]);

  /**
   * Apply initial configuration from mission data, using detected port
   * 
   * @param {Object} config - Configuration data with detected port
   */
  const applyInitialConfiguration = useCallback((config) => {
    if (!config || !config.slots) return;
    
    // Create new slot configurations
    const newConfigs = {};
    
    config.slots.forEach(slot => {
      // For motor configurations, use the detected port
      if (slot.type === "action" && slot.subtype === "motor" && config.detectedPort) {
        newConfigs[slot.slotIndex] = {
          type: slot.type,
          subtype: slot.subtype,
          configuration: { 
            ...slot.configuration,
            port: config.detectedPort
          }
        };
      } else {
        // For other configurations, use as-is
        newConfigs[slot.slotIndex] = {
          type: slot.type,
          subtype: slot.subtype,
          configuration: slot.configuration
        };
      }
    });
    
    // Update slot configurations
    setSlotConfigurations(newConfigs);
    
    console.log("Applied initial configuration with port", config.detectedPort, ":", newConfigs);
  }, []);

  /**
   * Begin guided tasks after intro phase is complete
   * Closes intro overlay and marks intro as completed
   */
  const beginGuidedTasks = useCallback(() => {
    setShowMissionOverlay(false);
    setIntroCompleted(true);
    
    console.log("Beginning guided tasks with detected port:", detectedMotorPort);
  }, [detectedMotorPort]);

  /**
   * Check if the required hardware is connected for the mission
   * 
   * @returns {Object} Validation result with status and missing hardware
   */
  const validateHardwareRequirements = useCallback(() => {
    if (!isMissionMode || !currentMission || !isConnected) {
      return { isValid: true, missingHardware: [] };
    }
    
    const missingHardware = [];
    
    // Check hardware requirements from mission data
    if (currentMission.hardwareRequirements) {
      currentMission.hardwareRequirements.forEach(requirement => {
        const { deviceType, count = 1 } = requirement;
        
        // Count connected devices of this type
        const connectedCount = Object.values(portStates)
          .filter(port => port && port.deviceType === deviceType)
          .length;
        
        // Add to missing hardware if not enough connected
        if (connectedCount < count) {
          if (deviceType === 0x30) {
            // Motor
            missingHardware.push("motor");
          } else if (deviceType === 0x3c) {
            // Button/Force sensor
            missingHardware.push("button");
          } else {
            missingHardware.push(`unknown-${deviceType}`);
          }
        }
      });
    }
    
    return {
      isValid: missingHardware.length === 0,
      missingHardware,
      allowSkip: true // Allow skipping hardware check
    };
  }, [isMissionMode, currentMission, isConnected, portStates]);

  /**
   * Check if a component should be visible based on mission constraints
   * 
   * @param {string} componentId - ID of the component to check
   * @param {Object} options - Additional context for the check
   * @returns {boolean} Whether the component should be visible
   */
  const isComponentVisible = useCallback((componentId, options = {}) => {
    // Default to visible in sandbox mode or if intro is not complete
    if (!isMissionMode || !currentMission || !introCompleted) return true;
    
    // Get current task
    const currentTask = currentMission.tasks[currentTaskIndex];
    if (!currentTask) return true;
    
    // Check for uiRestrictions
    const uiRestrictions = currentTask.uiRestrictions || {};
    
    // Check specific component visibility rules
    if (componentId === 'type-selector' && uiRestrictions.hideTypeSelection) {
      return false;
    }
    
    if (componentId === 'subtype-selector' && uiRestrictions.hideSubtypeSelection) {
      return false;
    }
    
    // Check visibility from explicitly defined lists
    if (uiRestrictions.visibleComponents?.length > 0) {
      return uiRestrictions.visibleComponents.includes(componentId);
    }
    
    if (uiRestrictions.hiddenComponents?.length > 0) {
      return !uiRestrictions.hiddenComponents.includes(componentId);
    }
    
    // Default to visible
    return true;
  }, [isMissionMode, currentMission, introCompleted, currentTaskIndex]);

  /**
   * Check if a component is enabled based on mission constraints
   * 
   * @param {string} componentId - ID of the component to check
   * @param {Object} options - Additional context for the check
   * @returns {boolean} Whether the component is enabled
   */
  const isComponentEnabled = useCallback((componentId, options = {}) => {
    // Default to enabled in sandbox mode or if intro is not complete
    if (!isMissionMode || !currentMission || !introCompleted) return true;
    
    // Get current task
    const currentTask = currentMission.tasks[currentTaskIndex];
    if (!currentTask) return true;
    
    // Check for uiRestrictions
    const uiRestrictions = currentTask.uiRestrictions || {};
    
    // Check if component is in disabled list
    if (uiRestrictions.disabledComponents?.length > 0) {
      return !uiRestrictions.disabledComponents.includes(componentId);
    }
    
    // For subtype options
    if (componentId.startsWith('subtype-') && options.type) {
      const subtypeName = componentId.replace('subtype-', '');
      if (uiRestrictions.disableSubtypeOptions?.includes(subtypeName)) {
        return false;
      }
    }
    
    // Default to enabled
    return true;
  }, [isMissionMode, currentMission, introCompleted, currentTaskIndex]);

  /**
   * Get prefilled value for a configuration field if specified in the mission
   * 
   * @param {string} fieldName - Name of the configuration field
   * @returns {any} Prefilled value or undefined
   */
  const getPrefilledValue = useCallback((fieldName) => {
    if (!isMissionMode || !currentMission || !introCompleted) return undefined;
    
    // Get current task
    const currentTask = currentMission.tasks[currentTaskIndex];
    if (!currentTask?.uiRestrictions?.prefilledValues) return undefined;
    
    return currentTask.uiRestrictions.prefilledValues[fieldName];
  }, [isMissionMode, currentMission, introCompleted, currentTaskIndex]);

  /**
   * Check if a configuration value is locked (cannot be changed)
   * 
   * @param {string} fieldName - Name of the configuration field
   * @returns {boolean} Whether the field is locked
   */
  const isValueLocked = useCallback((fieldName) => {
    if (!isMissionMode || !currentMission || !introCompleted) return false;
    
    // Get current task
    const currentTask = currentMission.tasks[currentTaskIndex];
    if (!currentTask?.uiRestrictions?.lockedValues) return false;
    
    return fieldName in currentTask.uiRestrictions.lockedValues;
  }, [isMissionMode, currentMission, introCompleted, currentTaskIndex]);

  /**
   * Validate if the current configuration meets the mission requirements
   * 
   * @param {Object} configuration - Configuration to validate
   * @returns {Object} Validation result with status and message
   */
  const validateStepConfiguration = useCallback((configuration) => {
    if (!isMissionMode || !currentMission || !introCompleted) {
      return { isValid: true, message: "" };
    }
    
    // Get current task
    const currentTask = currentMission.tasks[currentTaskIndex];
    if (!currentTask) {
      return { isValid: true, message: "" };
    }
    
    // Check required type
    if (currentTask.requiredType && configuration.type !== currentTask.requiredType) {
      return {
        isValid: false,
        message: `This step requires ${currentTask.requiredType} type.`
      };
    }
    
    // Check required subtype
    if (currentTask.requiredSubtype && configuration.subtype !== currentTask.requiredSubtype) {
      return {
        isValid: false,
        message: `This step requires ${currentTask.requiredSubtype} subtype.`
      };
    }
    
    // Motor specific validations
    if (configuration.type === 'action' && configuration.subtype === 'motor') {
      const motorConfig = Array.isArray(configuration.configuration) 
        ? configuration.configuration 
        : [configuration.configuration];
      
      // Check port validation if needed
      if (currentTask.validatePort && detectedMotorPort) {
        const hasInvalidPort = motorConfig.some(config => config.port !== detectedMotorPort);
        
        if (hasInvalidPort) {
          return {
            isValid: false,
            message: `Please use the detected motor on port ${detectedMotorPort}.`
          };
        }
      }
      
      // Check speed range
      if (currentTask.speedRange) {
        const [minSpeed, maxSpeed] = currentTask.speedRange;
        
        const hasInvalidSpeed = motorConfig.some(config => {
          const absSpeed = Math.abs(config.speed || 0);
          return absSpeed < minSpeed || absSpeed > maxSpeed;
        });
        
        if (hasInvalidSpeed) {
          return {
            isValid: false,
            message: `Speed must be between ${minSpeed} and ${maxSpeed}.`
          };
        }
      }
      
      // Check direction constraints
      if (currentTask.direction) {
        const hasInvalidDirection = motorConfig.some(config => {
          const direction = (config.speed || 0) >= 0 ? "forward" : "backward";
          return direction !== currentTask.direction;
        });
        
        if (hasInvalidDirection) {
          return {
            isValid: false,
            message: `Motor must move in ${currentTask.direction} direction.`
          };
        }
      }
    }
    
    // Timer specific validations
    if (configuration.type === 'input' && configuration.subtype === 'time') {
      const { seconds } = configuration.configuration || {};
      
      // Check time range
      if (currentTask.timeRange) {
        const [minTime, maxTime] = currentTask.timeRange;
        
        if (seconds < minTime || seconds > maxTime) {
          return {
            isValid: false,
            message: `Wait time must be between ${minTime} and ${maxTime} seconds.`
          };
        }
      }
    }
    
    // If all validations pass
    return { 
      isValid: true,
      message: "Configuration is valid."
    };
  }, [isMissionMode, currentMission, introCompleted, currentTaskIndex, detectedMotorPort]);

  /**
   * Validate if a task is completable based on current state
   * Including port validation for motor tasks
   * 
   * @param {Object} task - Task to validate
   * @param {Object} data - Current state data
   * @returns {boolean} Whether the task can be completed
   */
  const validateTaskCompletion = useCallback((task, data) => {
    if (!task) return false;
    
    switch (task.type) {
      case 'MOTOR_CONFIGURATION':
        // Check if using the correct port (from hardware detection)
        if (task.validatePort && detectedMotorPort) {
          if (data.port !== detectedMotorPort) {
            return false;
          }
        }
        
        // Check speed range
        if (task.speedRange) {
          const [minSpeed, maxSpeed] = task.speedRange;
          const speed = data.speed || 0;
          if (speed < minSpeed || speed > maxSpeed) {
            return false;
          }
        }
        
        // Check direction
        if (task.direction) {
          const currentDirection = (data.speed || 0) >= 0 ? "forward" : "backward";
          if (task.direction !== currentDirection) {
            return false;
          }
        }
        
        return true;
        
      case 'TEST_EXECUTION':
        // Test button task is always completable
        return true;
        
      case 'TIMER_SETTING':
        // Check timer value
        if (task.timeRange) {
          const [minTime, maxTime] = task.timeRange;
          const seconds = data.seconds || 0;
          return seconds >= minTime && seconds <= maxTime;
        }
        return data && data.seconds && data.seconds > 0;
        
      case 'NAVIGATION':
        // Check if navigated to correct slot
        return data && data.targetSlot === task.targetSlot;
        
      default:
        return false;
    }
  }, [detectedMotorPort]);

  /**
   * Mark a task as completed
   * 
   * @param {number} taskIndex - Index of the task to mark as completed
   * @param {Object} data - Optional data to store with completion
   */
  const completeTask = useCallback((taskIndex, data = {}) => {
    if (!currentMission) return;
    
    setCompletedTasks(prev => ({
      ...prev,
      [taskIndex]: {
        completedAt: Date.now(),
        ...data
      }
    }));
    
    // Play completion sound
    const audio = new Audio('/assets/sounds/marimba-bloop.mp3');
    audio.play().catch(error => {
      console.error('Error playing completion sound:', error);
    });
    
    // Move to next task if this isn't the last task
    if (taskIndex === currentTaskIndex && taskIndex < currentMission.tasks.length - 1) {
      setCurrentTaskIndex(prevIndex => prevIndex + 1);
    }
    
    // Check if run prompt should be shown
    if (currentMission.runPrompt?.showAfterTask === taskIndex) {
      setShowRunPrompt(true);
    }
  }, [currentMission, currentTaskIndex]);

  /**
   * Get current task data
   * 
   * @returns {Object|null} Current task object or null
   */
  const getCurrentTask = useCallback(() => {
    if (!isMissionMode || !currentMission || !introCompleted) return null;
    
    return currentMission.tasks[currentTaskIndex] || null;
  }, [isMissionMode, currentMission, introCompleted, currentTaskIndex]);

  /**
   * Check if a task is completed
   * 
   * @param {number} taskIndex - Index of the task to check
   * @returns {boolean} Whether the task is completed
   */
  const isTaskCompleted = useCallback((taskIndex) => {
    return !!completedTasks[taskIndex];
  }, [completedTasks]);

  /**
   * Exit the current mission and return to sandbox mode
   */
  const exitMission = useCallback(() => {
    setIsMissionMode(false);
    setCurrentMission(null);
    setCurrentTaskIndex(0);
    setDetectedMotorPort(null);
    setCompletedTasks({});
    setSlotConfigurations({});
    setIntroCompleted(false);
    
    // Clear mission data from localStorage
    try {
      localStorage.removeItem("missionProgress");
      localStorage.removeItem("missionTaskProgress");
      localStorage.removeItem("missionSlotConfigurations");
    } catch (error) {
      console.error("Error clearing mission progress from localStorage:", error);
    }
  }, []);

  // Provide context values
  const contextValue = {
    // Mission state
    isMissionMode,
    setIsMissionMode,
    availableMissions,
    currentMission,
    
    // Task management
    currentTaskIndex,
    completedTasks,
    
    // Introduction phase
    showMissionOverlay,
    setShowMissionOverlay,
    introCompleted,
    
    // Hardware detection
    detectedMotorPort,
    setDetectedMotorPort,
    
    // Introduction methods
    startMission,
    applyInitialConfiguration,
    beginGuidedTasks,
    validateHardwareRequirements,
    
    // Task methods
    getCurrentTask,
    isTaskCompleted,
    completeTask,
    validateTaskCompletion,
    exitMission,
    
    // UI state
    showTestPrompt,
    setShowTestPrompt,
    showRunPrompt,
    setShowRunPrompt,
    
    // UI Helpers
    isComponentVisible,
    isComponentEnabled,
    getPrefilledValue,
    isValueLocked,
    validateStepConfiguration,
    
    // Slot configuration
    slotConfigurations,
  };
  
  return (
    <MissionContext.Provider value={contextValue}>
      {children}
    </MissionContext.Provider>
  );
};

/**
 * Hook for accessing mission functionality
 * 
 * @returns {Object} Mission context
 */
export const useMission = () => useContext(MissionContext);

export default MissionContext;