/**
 * @file MissionContext.js
 * @description Refactored mission context provider with improved architecture
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { useCustomization } from './CustomizationContext';
import { useBLE } from '../features/bluetooth/context/BLEContext';
import { logTaskEvent } from '../features/missions/models/Task';
import MissionService from '../features/missions/services/MissionService';
import TaskService from '../features/missions/services/TaskService';
import MissionUI from '../features/missions/services/MissionUI';
import MissionCelebration from '../features/missions/components/MissionCelebration';
import { getDeviceByCode } from '../features/missions/utils/DeviceTypes';
import { processInstructions } from '../features/missions/utils/InstructionTemplating';
import motorIdentityManager from '../features/missions/utils/MotorIdentity';
import {
  missionReducer,
  createInitialMissionState,
  startMission as startMissionAction,
  exitMission as exitMissionAction,
  completeIntro,
  setDetectedPort,
  applyConfigurations,
  setCurrentSlot,
  setShowTestPrompt,
  setShowRunPrompt,
  setShowCelebration,
  setDetectedDevices,
  setMotorIdentities,
  setMotorAssignments
} from '../features/missions/services/MissionState';

// Create mission context
const MissionContext = createContext();

// Create UI helper
const missionUI = new MissionUI({ debugMode: true });

/**
 * Provider component for mission management
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 */
export const MissionProvider = ({ children }) => {
  // Get other contexts
  const { setStepCount } = useCustomization();
  const { isConnected, portStates } = useBLE();
  
  // Initialize mission state using the reducer
  const [state, dispatch] = useReducer(missionReducer, null, createInitialMissionState);
  
  // Destructure state for convenience
  const {
    isMissionMode,
    currentMission,
    showMissionOverlay,
    introCompleted,
    detectedMotorPort,
    currSlotNumber,
    slotConfigurations,
    showTestPrompt,
    showRunPrompt,
    activeHint,
    showCelebration,
    detectedDevicesByType
  } = state;
  
  // Track available missions
  const [availableMissions, setAvailableMissions] = useState([]);
  
  // Load available missions on mount
  useEffect(() => {
    const loadMissions = async () => {
      try {
        const missions = await MissionService.getAllMissions();
        setAvailableMissions(missions);
      } catch (error) {
        console.error('Failed to load missions:', error);
        setAvailableMissions([]);
      }
    };
    
    loadMissions();
  }, []);
  
  /**
   * Start a mission by ID
   * Shows intro overlay for hardware check and configuration
   * 
   * @param {string} missionId - ID of the mission to start
   */
  const startMission = useCallback(async (missionId) => {
    try {
      // Get mission data
      const mission = await MissionService.getMissionById(missionId);
      
      if (!mission) {
        console.error(`Mission with ID ${missionId} not found.`);
        return;
      }
      
      // Initialize task service with mission data
      TaskService.initTasks(mission);
      
      // Update step count
      setStepCount(mission.totalSteps + 1); // +1 for stop step
      
      // Initialize motor identity system if mission uses it
      if (mission.motorIdentities) {
        motorIdentityManager.setIdentityDefinitions(mission.motorIdentities);
        dispatch(setMotorIdentities(mission.motorIdentities));
      }
      
      // Dispatch mission start action
      dispatch(startMissionAction(mission));
      
      logTaskEvent(`Started mission: ${mission.title}`, {
        missionId: mission.missionId,
        taskCount: mission.tasks?.length || 0,
        hasMotorIdentities: !!mission.motorIdentities
      });
    } catch (error) {
      console.error('Error starting mission:', error);
    }
  }, [setStepCount]);
  
  /**
   * Exit the current mission and return to sandbox mode
   */
  const exitMission = useCallback(() => {
    // Reset task service
    TaskService.resetTasks();
    
    // Clear motor identity mappings
    motorIdentityManager.clear();
    
    // Dispatch exit mission action
    dispatch(exitMissionAction());
    
    // Clear mission data from localStorage
    try {
      localStorage.removeItem("missionProgress");
      localStorage.removeItem("missionTaskProgress");
      localStorage.removeItem("missionSlotConfigurations");
    } catch (error) {
      console.error("Error clearing mission progress from localStorage:", error);
    }
    
    logTaskEvent('Exited mission');
  }, []);
  
  /**
   * Get the current active task
   * @returns {Object|null} Current task or null
   */
  const getCurrentTask = useCallback(() => {
    if (!isMissionMode || !currentMission || !introCompleted) {
      return null;
    }
    
    return TaskService.getCurrentTask();
  }, [isMissionMode, currentMission, introCompleted]);
  
  /**
   * Detect connected devices and map them by type
   * @returns {Object} Map of device types to port arrays
   */
  const detectConnectedDevices = useCallback(() => {
    const devices = {};
    
    // Check all ports for connected devices
    Object.entries(portStates).forEach(([port, state]) => {
      if (state && state.deviceType) {
        const device = getDeviceByCode(state.deviceType);
        if (device) {
          if (!devices[device.name]) {
            devices[device.name] = [];
          }
          devices[device.name].push(port);
        }
      }
    });
    
    // If we have motor identities defined, assign ports to them
    if (currentMission?.motorIdentities && devices.motor) {
      const assignments = motorIdentityManager.assignPorts(devices.motor);
      dispatch(setMotorAssignments(assignments));
      
      logTaskEvent('Assigned motor identities to ports', assignments);
    }
    
    // Update state with detected devices
    dispatch(setDetectedDevices(devices));
    
    return devices;
  }, [portStates, currentMission]);
  
  /**
   * Begin guided tasks after intro phase is complete
   */
  const beginGuidedTasks = useCallback(() => {
    // Detect connected devices
    const devices = detectConnectedDevices();
    
    // Process instructions with detected devices
    if (currentMission && currentMission.tasks) {
      processInstructions(currentMission.tasks, devices);
    }
    
    dispatch(completeIntro());
    
    logTaskEvent('Beginning guided tasks', {
      detectedDevices: devices
    });
  }, [currentMission, detectConnectedDevices]);
  
  /**
   * Set the detected motor port
   * @param {string} port - Port letter (A-F)
   */
  const setDetectedMotorPort = useCallback((port) => {
    dispatch(setDetectedPort(port));
    
    logTaskEvent(`Detected motor port: ${port}`);
  }, []);
  
  /**
   * Apply initial configuration from mission data
   * @param {Object} config - Configuration data
   */
  const applyInitialConfiguration = useCallback((config) => {
    if (!config || !config.slots) return;
    
    // Detect connected devices
    const devices = detectConnectedDevices();
    
    // Create new slot configurations
    const newConfigs = {};
    
    config.slots.forEach(slot => {
      // For motor configurations, handle both legacy and identity-based configs
      if (slot.type === "action" && slot.subtype === "motor") {
        if (currentMission?.motorIdentities) {
          // For identity-based configs, use the motor identity manager
          const motorPorts = devices.motor || [];
          if (motorPorts.length > 0) {
            // Get the first motor's identity and port
            const firstIdentity = Object.keys(currentMission.motorIdentities)[0];
            const firstPort = motorIdentityManager.getPort(firstIdentity);
            
            if (firstPort) {
              newConfigs[slot.slotIndex] = {
                type: slot.type,
                subtype: slot.subtype,
                configuration: { 
                  ...slot.configuration,
                  port: firstPort
                }
              };
            }
          }
        } else {
          // Legacy behavior for non-identity missions
          const motorPorts = devices.motor || [];
          if (motorPorts.length > 0) {
            newConfigs[slot.slotIndex] = {
              type: slot.type,
              subtype: slot.subtype,
              configuration: { 
                ...slot.configuration,
                port: motorPorts[0]
              }
            };
          }
        }
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
    dispatch(applyConfigurations(newConfigs));
    
    logTaskEvent('Applied initial configuration', {
      slotConfigs: newConfigs,
      hasMotorIdentities: !!currentMission?.motorIdentities
    });
  }, [currentMission, detectConnectedDevices]);
  
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
    
    // Dispatch event to update app's slot data
    window.dispatchEvent(new CustomEvent('updateSlotData', { 
      detail: { slotData } 
    }));
    
    logTaskEvent('Synchronized slot configurations with app', {
      slotCount: slotData.length
    });
  }, []);
  
  /**
   * Check if a task is completed
   * @param {number} taskIndex - Index of the task to check
   * @returns {boolean} Whether the task is completed
   */
  const isTaskCompleted = useCallback((taskIndex) => {
    return TaskService.isTaskCompleted(taskIndex);
  }, []);
  
  /**
   * Complete a task manually
   * @param {number} taskIndex - Index of the task to complete
   * @param {Object} data - Additional completion data
   */
  const completeTask = useCallback((taskIndex, data = {}) => {
    const result = TaskService.completeTask(taskIndex, data);
    
    if (result) {
      // Play completion sound
      try {
        const audio = new Audio('/assets/sounds/marimba-bloop.mp3');
        audio.play().catch(error => {
          console.error('Error playing completion sound:', error);
        });
      } catch (error) {
        console.error('Error playing sound:', error);
      }
      
      // Check if run prompt should be shown
      if (currentMission?.runPrompt?.showAfterTask === taskIndex) {
        dispatch(setShowRunPrompt(true));
      }

      // Check if this was the last task
      if (TaskService.isAllTasksCompleted()) {
        dispatch(setShowCelebration(true));
        logTaskEvent('Mission completed!', {
          missionId: currentMission.missionId,
          totalTasks: currentMission.tasks?.length || 0
        });
      }
    }
  }, [currentMission]);
  
  /**
   * Process a task event and check for task completion
   * @param {string} eventType - Type of event
   * @param {Object} eventData - Event data
   */
  const dispatchTaskEvent = useCallback((eventType, eventData) => {
    // Skip event processing during intro sequence
    if (!introCompleted) return;
    
    logTaskEvent(`Dispatching event: ${eventType}`, eventData);
    
    // Create app state for task validation
    const appState = {
      isMissionMode,
      currentMission,
      introCompleted,
      detectedMotorPort,
      currSlotNumber,
      isConnected,
      portStates
    };
    
    // Process the event
    const result = TaskService.processTaskEvent(eventType, eventData, appState);
    
    if (result.taskCompleted) {
      // Play completion sound
      try {
        const audio = new Audio('/assets/sounds/marimba-bloop.mp3');
        audio.play().catch(error => {
          console.error('Error playing completion sound:', error);
        });
      } catch (error) {
        console.error('Error playing sound:', error);
      }
      
      // Check if run prompt should be shown
      if (currentMission?.runPrompt?.showAfterTask === result.completedTaskIndex) {
        dispatch(setShowRunPrompt(true));
      }

      // Check if this was the last task
      if (TaskService.isAllTasksCompleted()) {
        dispatch(setShowCelebration(true));
        logTaskEvent('Mission completed!', {
          missionId: currentMission.missionId,
          totalTasks: currentMission.tasks?.length || 0
        });
      }
    }
  }, [
    introCompleted, 
    isMissionMode, 
    currentMission, 
    detectedMotorPort, 
    currSlotNumber, 
    isConnected, 
    portStates
  ]);
  
  /**
   * Check if hardware requirements are met for the current mission
   * @returns {Object} Result with status and missing hardware
   */
  const validateHardwareRequirements = useCallback(() => {
    return missionUI.validateHardwareRequirements({
      currentMission,
      isConnected,
      portStates
    });
  }, [currentMission, isConnected, portStates]);
  
  /**
   * Validate a step configuration against mission requirements
   * @param {Object} instruction - Instruction configuration to validate
   * @returns {Object} Validation result with isValid and message
   */
  const validateStepConfiguration = useCallback((instruction) => {
    // If not in mission mode or no current task, any configuration is valid
    if (!isMissionMode || !currentMission || !introCompleted) {
      return { isValid: true };
    }
    
    // Create app state for task validation
    const appState = {
      isMissionMode,
      currentMission,
      introCompleted,
      detectedMotorPort,
      currSlotNumber,
      isConnected,
      portStates
    };
    
    return TaskService.validateStepConfiguration(instruction, appState);
  }, [
    isMissionMode,
    currentMission, 
    introCompleted, 
    detectedMotorPort, 
    currSlotNumber, 
    isConnected,
    portStates
  ]);
  
  /**
   * Check if a component should be visible
   * @param {string} componentId - ID of the component to check
   * @returns {boolean} Whether the component should be visible
   */
  const isComponentVisible = useCallback((componentId) => {
    return missionUI.isComponentVisible(componentId, {
      isMissionMode,
      currentMission,
      introCompleted,
      currentTask: getCurrentTask()
    });
  }, [isMissionMode, currentMission, introCompleted, getCurrentTask]);
  
  /**
   * Check if a component is enabled
   * @param {string} componentId - ID of the component to check
   * @param {Object} options - Additional options
   * @returns {boolean} Whether the component is enabled
   */
  const isComponentEnabled = useCallback((componentId, additionalOptions = {}) => {
    return missionUI.isComponentEnabled(componentId, {
      isMissionMode,
      currentMission,
      introCompleted,
      currentTask: getCurrentTask(),
      additionalOptions
    });
  }, [isMissionMode, currentMission, introCompleted, getCurrentTask]);
  
  /**
   * Get prefilled value for a field
   * @param {string} fieldName - Name of the field
   * @returns {any} Prefilled value or undefined
   */
  const getPrefilledValue = useCallback((fieldName) => {
    return missionUI.getPrefilledValue(fieldName, {
      isMissionMode,
      currentMission,
      introCompleted,
      currentTask: getCurrentTask()
    });
  }, [isMissionMode, currentMission, introCompleted, getCurrentTask]);
  
  /**
   * Check if a value is locked
   * @param {string} fieldName - Name of the field
   * @returns {boolean} Whether the value is locked
   */
  const isValueLocked = useCallback((fieldName) => {
    return missionUI.isValueLocked(fieldName, {
      isMissionMode,
      currentMission,
      introCompleted,
      currentTask: getCurrentTask()
    });
  }, [isMissionMode, currentMission, introCompleted, getCurrentTask]);
  
  // Handle celebration close
  const handleCelebrationClose = useCallback(() => {
    dispatch(setShowCelebration(false));
    exitMission();
  }, [exitMission]);
  
  // Provide context values
  const contextValue = {
    // Mission state
    isMissionMode,
    availableMissions,
    currentMission,
    setIsMissionMode: useCallback((value) => {
      if (!value) {
        // If setting to false, exit mission mode
        exitMission();
      }
    }, [exitMission]),
    
    // Introduction phase
    showMissionOverlay,
    introCompleted,
    
    // Hardware detection
    detectedMotorPort,
    setDetectedMotorPort,
    
    // Slot management
    currSlotNumber,
    setCurrSlotNumber: useCallback((slotNumber) => {
      dispatch(setCurrentSlot(slotNumber));
    }, []),
    
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
    validateStepConfiguration,
    exitMission,
    
    // UI state
    showTestPrompt,
    setShowTestPrompt: useCallback((show) => {
      dispatch(setShowTestPrompt(show));
    }, []),
    showRunPrompt,
    setShowRunPrompt: useCallback((show) => {
      dispatch(setShowRunPrompt(show));
    }, []),
    
    // Slot configuration
    slotConfigurations,
    
    // Hint system
    activeHint,
    
    // Task event dispatching
    dispatchTaskEvent,
    syncSlotConfigurations,
    
    // Celebration
    showCelebration,
    handleCelebrationClose,
    
    // Device detection
    detectedDevicesByType
  };
  
  return (
    <MissionContext.Provider value={contextValue}>
      {children}
      {showCelebration && currentMission && (
        <MissionCelebration
          onClose={handleCelebrationClose}
          missionTitle={currentMission.title}
        />
      )}
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
