/**
 * @file MissionContext.js
 * @description Context provider with corrected handling of mission phases
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useCustomization } from './CustomizationContext';
import { useBLE } from '../features/bluetooth/context/BLEContext';

// Import DEFAULT_MISSIONS directly
const DEFAULT_MISSIONS = [
  {
    missionId: "mission1",
    title: "First Steps with Motors",
    description: "Learn to control a motor and add a wait step",
    difficultyLevel: "beginner",
    totalSteps: 2, // Number of instruction steps (not including stop)
    totalTasks: 8, // Total number of guided tasks
    
    // Introduction phase metadata (NOT tasks)
    hardwareRequirements: [
      { deviceType: 0x30, count: 1 } // One motor required
    ],
    
    initialConfiguration: {
      slots: [
        {
          slotIndex: 0,
          type: "action",
          subtype: "motor",
          // Port will be dynamically determined during hardware detection
          // Initial speed is set to 0
          configuration: { speed: 0 }
        },
        {
          slotIndex: 1,
          type: "input",
          subtype: "time",
          // Initial wait time is set to 0
          configuration: { seconds: 0 }
        }
      ]
    },
    
    // Assets for the mission
    assets: {
      introImage: "/assets/images/missions/motor-mission-intro.jpg",
      completeImage: "/assets/images/missions/motor-mission-complete.jpg",
    },
    
    // UI restrictions for the mission (used by isComponentVisible)
    uiRestrictions: {
      hideTypeSelection: false,
      hideSubtypeSelection: false,
      visibleComponents: [],
      hiddenComponents: [],
      disabledComponents: [],
      prefilledValues: {},
      lockedValues: {}
    },
    
    // Only actual guided tasks
    tasks: [
      // Task 1: Set Motor Speed
      {
        taskId: "set_motor_speed",
        type: "MOTOR_CONFIGURATION",
        targetSlot: 0,
        speedRange: [300, 1000],
        direction: "clockwise",
        instruction: "Make your motor spin clockwise",
        stepTitle: "Set Motor Speed",
        targetElement: ".clockwiseBar",
        uiRestrictions: {
          hideTypeSelection: true,
          hideSubtypeSelection: true
        }
      },
      
      // Task 2: Test Motor Command
      {
        taskId: "test_motor",
        type: "TEST_EXECUTION",
        targetSlot: 0,
        instruction: "Click TEST to see your motor spin",
        stepTitle: "Test Motor",
        targetElement: ".testButton"
      },
      
      // Additional tasks...
      {
        taskId: "navigate_to_wait",
        type: "NAVIGATION",
        targetSlot: 1,
        instruction: "Click the down arrow to move to the next step",
        stepTitle: "Go to Step 2",
        targetElement: ".nextButton"
      },
      
      {
        taskId: "select_input",
        type: "SELECT_INPUT_TYPE",
        targetSlot: 1,
        instruction: "Click on SENSE to access input options",
        stepTitle: "Select SENSE",
        targetElement: ".senseButton button",
        uiRestrictions: {
          hideTypeSelection: false,
          hideSubtypeSelection: true
        }
      },
      
      {
        taskId: "select_timer",
        type: "SELECT_SUBTYPE",
        targetSlot: 1,
        requiredType: "input",
        requiredSubtype: "time",
        instruction: "Click on Wait to set a timer",
        stepTitle: "Select Wait",
        targetElement: '.subtypeButton[aria-label="Select Wait"]'
      },
      
      {
        taskId: "set_timer",
        type: "TIMER_SETTING",
        targetSlot: 1,
        timeRange: [2, 5],
        instruction: "Set the timer to 3 seconds",
        stepTitle: "Set Wait Time",
        targetElement: ".timeButton"
      },
      
      {
        taskId: "test_timer",
        type: "TEST_EXECUTION",
        targetSlot: 1,
        instruction: "Click TEST to see your timer in action",
        stepTitle: "Test Timer",
        targetElement: ".testButton"
      },
      
      {
        taskId: "run_program",
        type: "RUN_PROGRAM",
        targetSlot: 0, // Start from the beginning
        instruction: "Click the PLAY button to run your complete program",
        stepTitle: "Run Program",
        targetElement: ".playButton"
      }
    ],
    
    // Optional prompts
    runPrompt: {
      showPrompt: true,
      message: "Great job setting up your program! Now click PLAY to see what happens.",
      showAfterTask: 7,
      requiredForCompletion: true,
    }
  }
];

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
  const [availableMissions, setAvailableMissions] = useState(DEFAULT_MISSIONS); // Initialize with default missions
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
  
  // Current slot number
  const [currSlotNumber, setCurrSlotNumber] = useState(0);
  
  // Access other contexts
  const { setStepCount } = useCustomization();
  const { isConnected, portStates } = useBLE();

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
    
    // Sync with app's slot data
    syncSlotConfigurations(newConfigs);
    
    console.log("Applied initial configuration with port", config.detectedPort, ":", newConfigs);
  }, []);

  /**
   * Sync slot configurations with the app's slot data
   * This ensures the CodingTrack and run menu are updated with the mission's initial configuration
   * 
   * @param {Object} configs - Slot configurations to sync
   */
  const syncSlotConfigurations = useCallback((configs) => {
    // Convert slot configurations object to array format expected by the app
    const slotData = [];
    const maxSlotIndex = Math.max(...Object.keys(configs).map(Number));
    
    // Initialize all slots up to the maximum index
    for (let i = 0; i <= maxSlotIndex; i++) {
      slotData[i] = configs[i] || {
        type: null,
        subtype: null,
        configuration: {}
      };
    }
    
    // Add stop instruction at the end
    slotData.push({
      type: "special",
      subtype: "stop",
      configuration: { isEnd: true },
      isStopInstruction: true
    });
    
    // Dispatch event to update app's slot data
    window.dispatchEvent(new CustomEvent('updateSlotData', { 
      detail: { slotData } 
    }));
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
    const currentTask = getCurrentTask();
    if (!currentTask) return true;
    
    // Check if the component has explicit visibility rules in the task
    if (currentTask.uiRestrictions) {
      const { uiRestrictions } = currentTask;
      
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
    }
    
    // If no task-specific rules, check mission-level rules
    if (currentMission.uiRestrictions) {
      const { uiRestrictions } = currentMission;
      
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
    }
    
    // Default to visible
    return true;
  }, [isMissionMode, currentMission, introCompleted, getCurrentTask]);

  /**
   * Check if a component is enabled based on mission constraints
   * 
   * @param {string} componentId - ID of the component to check
   * @param {Object} options - Additional context for the check
   * @returns {boolean} Whether the component is enabled
   */
  const isComponentEnabled = useCallback((componentId, options = {}) => {
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
    
    const currentTask = getCurrentTask();
    if (!currentTask) return true;
    
    // Check if the component has explicit enable/disable rules
    if (currentTask.uiRestrictions) {
      const { uiRestrictions } = currentTask;
      
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
    }
    
    // Check mission-level restrictions
    if (currentMission.uiRestrictions) {
      const { uiRestrictions } = currentMission;
      
      // Check if component is in disabled list
      if (uiRestrictions.disabledComponents?.length > 0) {
        return !uiRestrictions.disabledComponents.includes(componentId);
      }
    }
    
    // Default to enabled
    return true;
  }, [isMissionMode, currentMission, introCompleted, getCurrentTask]);

  /**
   * Get prefilled value for a configuration field if specified in the mission
   * 
   * @param {string} fieldName - Name of the configuration field
   * @returns {any} Prefilled value or undefined
   */
  const getPrefilledValue = useCallback((fieldName) => {
    if (!isMissionMode || !currentMission || !introCompleted) return undefined;
    
    const currentTask = getCurrentTask();
    if (!currentTask?.uiRestrictions?.prefilledValues) {
      // Check mission-level prefilled values
      if (currentMission.uiRestrictions?.prefilledValues) {
        return currentMission.uiRestrictions.prefilledValues[fieldName];
      }
      return undefined;
    }
    
    return currentTask.uiRestrictions.prefilledValues[fieldName];
  }, [isMissionMode, currentMission, introCompleted, getCurrentTask]);

  /**
   * Check if a configuration value is locked (cannot be changed)
   * 
   * @param {string} fieldName - Name of the configuration field
   * @returns {boolean} Whether the field is locked
   */
  const isValueLocked = useCallback((fieldName) => {
    if (!isMissionMode || !currentMission || !introCompleted) return false;
    
    const currentTask = getCurrentTask();
    if (!currentTask?.uiRestrictions?.lockedValues) {
      // Check mission-level locked values
      if (currentMission.uiRestrictions?.lockedValues) {
        return fieldName in currentMission.uiRestrictions.lockedValues;
      }
      return false;
    }
    
    return fieldName in currentTask.uiRestrictions.lockedValues;
  }, [isMissionMode, currentMission, introCompleted, getCurrentTask]);

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
          const currentDirection = (data.speed || 0) >= 0 ? "clockwise" : "countercw";
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

  /**
   * Validate a step configuration against mission requirements
   * 
   * @param {Object} instruction - The instruction to validate
   * @returns {Object} Validation result with isValid and message
   */
  const validateStepConfiguration = useCallback((instruction) => {
    // If not in mission mode or no current task, any configuration is valid
    if (!isMissionMode || !currentMission || !introCompleted) {
      return { isValid: true };
    }

    const currentTask = getCurrentTask();
    if (!currentTask) {
      return { isValid: true };
    }

    // If task is for a different slot, don't validate
    if (currentTask.targetSlot !== currSlotNumber) {
      return { isValid: true };
    }

    // If no instruction, it's not valid
    if (!instruction || !instruction.type) {
      return {
        isValid: false,
        message: "Please configure this step according to the mission instructions."
      };
    }

    // Validate against mission requirements using task handlers
    const isValid = validateTaskCompletion(currentTask, instruction.configuration);
    
    return {
      isValid,
      message: isValid ? "" : "This configuration doesn't meet the mission requirements."
    };
  }, [isMissionMode, currentMission, introCompleted, getCurrentTask, validateTaskCompletion, currSlotNumber]);

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
    
    // UI Component visibility/state methods
    isComponentVisible,
    isComponentEnabled,
    getPrefilledValue,
    isValueLocked,
    
    // Task methods
    getCurrentTask,
    isTaskCompleted,
    completeTask,
    validateTaskCompletion,
    validateStepConfiguration,
    exitMission,
    
    // UI state
    showTestPrompt,
    setShowTestPrompt,
    showRunPrompt,
    setShowRunPrompt,
    
    // Slot configuration
    slotConfigurations,

    // Current slot
    currSlotNumber,
    setCurrSlotNumber,

    // Task event dispatching
    dispatchTaskEvent: (eventType, eventData) => {
      // Skip event processing during intro sequence
      if (!introCompleted) return;
      
      const currentTask = getCurrentTask();
      
      // Process the event based on type
      switch (eventType) {
        case 'SUBTYPE_SELECTED':
          // Handle subtype selection event
          if (currentTask?.type === 'SELECT_SUBTYPE') {
            const { type, subtype } = eventData;
            if (type === currentTask.requiredType && subtype === currentTask.requiredSubtype) {
              completeTask(currentTaskIndex, eventData);
            }
          }
          break;
          
        case 'NAVIGATION':
          // Handle navigation event
          if (currentTask?.type === 'NAVIGATION') {
            const { toSlot } = eventData;
            if (toSlot === currentTask.targetSlot) {
              completeTask(currentTaskIndex, eventData);
            }
          }
          break;
          
        case 'TEST_EXECUTION':
          // Handle test execution event
          if (currentTask?.type === 'TEST_EXECUTION') {
            completeTask(currentTaskIndex, eventData);
          }
          break;
          
        case 'RUN_PROGRAM':
          // Handle run program event
          if (currentTask?.type === 'RUN_PROGRAM') {
            completeTask(currentTaskIndex, eventData);
          }
          break;
          
        default:
          console.log(`Unhandled task event: ${eventType}`, eventData);
      }
    },
    syncSlotConfigurations,
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