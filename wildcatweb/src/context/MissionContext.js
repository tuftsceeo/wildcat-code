/**
 * @file MissionContext.js
 * @description Context provider for managing mission state with phase support.
 * Handles mission selection, progression, validation, and task-level tracking
 * with distinct phases for introduction and guided tasks.
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useCustomization } from "./CustomizationContext";
import { useBLE } from "../features/bluetooth/context/BLEContext";
import {
  TASK_TYPES,
  MISSION_PHASES,
  validateTask,
  isTaskCompleted as checkTaskCompletion,
  getTaskHint,
  isIntroductionPhaseTask
} from "../features/missions/services/TaskRegistry";
import { registerDefaultHandlers } from "../features/missions/services/TaskHandlers";
import MissionService from "../features/missions/services/MissionService";

// Create context
const MissionContext = createContext();

/**
 * Provider component for mission management
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

  // Current phase tracking
  const [currentPhase, setCurrentPhase] = useState(MISSION_PHASES.INTRODUCTION);
  const [isIntroSequenceComplete, setIsIntroSequenceComplete] = useState(false);

  // Task tracking with flat structure
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});

  // UI state for overlays
  const [showMissionOverlay, setShowMissionOverlay] = useState(false);
  const [overlayContent, setOverlayContent] = useState(null);
  const [showTestPrompt, setShowTestPrompt] = useState(false);
  const [showRunPrompt, setShowRunPrompt] = useState(false);

  // Visual hint system state - no text
  const [activeHint, setActiveHint] = useState(null);
  const [inactivityTimer, setInactivityTimer] = useState(null);

  // Slot configuration persistence
  const [slotConfigurations, setSlotConfigurations] = useState({});

  // Access other contexts
  const { setStepCount } = useCustomization();
  const { isConnected, portStates } = useBLE();

  // Load available missions
  useEffect(() => {
    const loadMissions = async () => {
      try {
        const missions = await MissionService.getAllMissions();
        setAvailableMissions(missions);
      } catch (error) {
        console.error("Error loading missions:", error);
      }
    };

    loadMissions();
  }, []);

  // Initialize task registry
  useEffect(() => {
    registerDefaultHandlers();
  }, []);

  // Load mission mode preference from localStorage
  useEffect(() => {
    try {
      const savedMissionMode = localStorage.getItem("missionMode");
      if (savedMissionMode) {
        setIsMissionMode(JSON.parse(savedMissionMode));
      }

      // Load active mission if in mission mode
      const savedMissionProgress = localStorage.getItem("missionProgress");
      if (savedMissionProgress) {
        const progress = JSON.parse(savedMissionProgress);

        if (progress.missionId) {
          // Get mission from available missions
          MissionService.getMissionById(progress.missionId).then(
            (mission) => {
              if (mission) {
                setCurrentMission(mission);

                // Restore phase and intro sequence status
                if (progress.currentPhase) {
                  setCurrentPhase(progress.currentPhase);
                }
                
                setIsIntroSequenceComplete(progress.isIntroSequenceComplete || false);

                // Restore task index and completion state
                if (progress.currentTaskIndex !== undefined) {
                  setCurrentTaskIndex(progress.currentTaskIndex);
                }

                if (progress.completedTasks) {
                  setCompletedTasks(progress.completedTasks);
                }
              }
            }
          );
        }
      }
    } catch (error) {
      console.error(
        "Error loading mission state from localStorage:",
        error
      );
    }
  }, []);

  // Load slot configurations from localStorage
  useEffect(() => {
    try {
      const savedConfigurations = localStorage.getItem(
        "missionSlotConfigurations"
      );
      if (savedConfigurations && currentMission) {
        const parsed = JSON.parse(savedConfigurations);

        // Only restore if for the current mission
        if (parsed.missionId === currentMission.missionId) {
          setSlotConfigurations(parsed.configurations || {});
        }
      }
    } catch (error) {
      console.error(
        "Error loading slot configurations from localStorage:",
        error
      );
    }
  }, [currentMission]);

  // Save mission mode preference when it changes
  useEffect(() => {
    try {
      localStorage.setItem("missionMode", JSON.stringify(isMissionMode));
    } catch (error) {
      console.error("Error saving mission mode to localStorage:", error);
    }
  }, [isMissionMode]);

  // Update step count in CustomizationContext when mission changes
  useEffect(() => {
    if (isMissionMode && currentMission) {
      // Add 1 for the stop step that's automatically added
      const totalSteps = currentMission.totalSteps + 1;
      setStepCount(totalSteps);
    }
  }, [isMissionMode, currentMission, setStepCount]);

  // Save mission progress when it changes
  useEffect(() => {
    if (
      isMissionMode &&
      currentMission &&
      (currentTaskIndex > 0 || Object.keys(completedTasks).length > 0)
    ) {
      try {
        localStorage.setItem(
          "missionProgress",
          JSON.stringify({
            missionId: currentMission.missionId,
            currentPhase,
            isIntroSequenceComplete,
            currentTaskIndex,
            completedTasks,
          })
        );
      } catch (error) {
        console.error(
          "Error saving mission progress to localStorage:",
          error
        );
      }
    }
  }, [
    isMissionMode,
    currentMission,
    currentPhase,
    isIntroSequenceComplete,
    currentTaskIndex,
    completedTasks
  ]);

  // Save slot configurations to localStorage
  useEffect(() => {
    if (
      isMissionMode &&
      currentMission &&
      Object.keys(slotConfigurations).length > 0
    ) {
      try {
        localStorage.setItem(
          "missionSlotConfigurations",
          JSON.stringify({
            missionId: currentMission.missionId,
            configurations: slotConfigurations,
          })
        );
      } catch (error) {
        console.error(
          "Error saving slot configurations to localStorage:",
          error
        );
      }
    }
  }, [isMissionMode, currentMission, slotConfigurations]);

  // Handle inactivity timer for hints
  useEffect(() => {
    // Clear existing timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    // Only set timer if in mission mode with an active task 
    // and in the guided tasks phase (not intro)
    if (
      isMissionMode &&
      currentMission &&
      currentPhase === MISSION_PHASES.GUIDED_TASKS &&
      currentTaskIndex < currentMission.tasks.length
    ) {
      const timer = setTimeout(() => {
        // Generate hint for current task
        showHintForCurrentTask();
      }, 30000); // Show hint after 30 seconds of inactivity

      setInactivityTimer(timer);
    }

    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [
    isMissionMode,
    currentMission,
    currentPhase,
    currentTaskIndex,
    completedTasks
  ]);

  /**
   * Start a mission by ID
   * Sets up the initial mission state and shows the intro overlay
   *
   * @param {string} missionId - ID of the mission to start
   */
  const startMission = useCallback(
    async (missionId) => {
      try {
        const mission = await MissionService.getMissionById(missionId);

        if (mission) {
          setCurrentMission(mission);
          setCurrentTaskIndex(0);
          setCurrentPhase(MISSION_PHASES.INTRODUCTION);
          setIsIntroSequenceComplete(false);
          setIsMissionMode(true);

          // Reset completion state
          setCompletedTasks({});

          // Reset slot configurations
          setSlotConfigurations({});

          // Show mission intro overlay - this is now the first task in the sequence
          setOverlayContent({
            type: "intro",
            title: mission.title,
            description: mission.description,
            image: mission.assets?.introImage,
          });
          setShowMissionOverlay(true);

          // Save initial mission state
          localStorage.setItem(
            "missionProgress",
            JSON.stringify({
              missionId: mission.missionId,
              currentPhase: MISSION_PHASES.INTRODUCTION,
              isIntroSequenceComplete: false,
              currentTaskIndex: 0,
              completedTasks: {},
            })
          );

          // Initialize required step count
          setStepCount(mission.totalSteps + 1); // +1 for stop step
        } else {
          console.error(`Mission with ID ${missionId} not found.`);
        }
      } catch (error) {
        console.error("Error starting mission:", error);
      }
    },
    [setStepCount]
  );

  /**
   * Exit the current mission and return to sandbox mode
   */
  const exitMission = useCallback(() => {
    setIsMissionMode(false);
    setCurrentMission(null);
    setCurrentTaskIndex(0);
    setCurrentPhase(MISSION_PHASES.INTRODUCTION);
    setIsIntroSequenceComplete(false);
    setCompletedTasks({});
    setSlotConfigurations({});

    // Reset active hint
    setActiveHint(null);

    // Clear mission data from localStorage
    try {
      localStorage.removeItem("missionProgress");
      localStorage.removeItem("missionSlotConfigurations");
    } catch (error) {
      console.error(
        "Error clearing mission progress from localStorage:",
        error
      );
    }
  }, []);



  /**
   * Process the introduction sequence
   * Handles the intro, hardware setup, and initial config phases
   */
  const processIntroductionSequence = useCallback(() => {
    if (!currentMission) return;
    
    // If intro sequence is already complete, skip
    if (isIntroSequenceComplete) return;
    
    const introTasks = MissionService.getIntroductionTasks(currentMission);
    
    // If there are no intro tasks, mark as complete and move to guided tasks
    if (introTasks.length === 0) {
      setIsIntroSequenceComplete(true);
      setCurrentPhase(MISSION_PHASES.GUIDED_TASKS);
      return;
    }
    
    // Find the current intro task based on our progress
    let nextIntroTaskIndex = 0;
    
    // Find the first incomplete intro task
    for (let i = 0; i < introTasks.length; i++) {
      const taskIndex = currentMission.tasks.indexOf(introTasks[i]);
      if (!completedTasks[taskIndex]) {
        nextIntroTaskIndex = taskIndex;
        break;
      }
    }
    
    // Set current task to the next intro task
    setCurrentTaskIndex(nextIntroTaskIndex);
    
    // Get the task
    const nextIntroTask = currentMission.tasks[nextIntroTaskIndex];
    if (!nextIntroTask) return;
    
    // Set current phase based on the task
    setCurrentPhase(nextIntroTask.phase);
    
    // Show appropriate overlay based on the task type
    switch (nextIntroTask.type) {
      case TASK_TYPES.MISSION_INTRO:
        // Introduction overlay already shown when starting the mission
        break;
        
      case TASK_TYPES.HARDWARE_CHECK:
        // Show hardware check overlay
        setOverlayContent({
          type: "hardware",
          title: "Connect Hardware",
          description: nextIntroTask.instruction,
        });
        setShowMissionOverlay(true);
        break;
        
      case TASK_TYPES.INITIAL_CONFIG:
        // Apply initial configuration without showing an overlay
        if (nextIntroTask.presetSlots && Array.isArray(nextIntroTask.presetSlots)) {
          // Apply each configuration
          const newConfigs = {};
          nextIntroTask.presetSlots.forEach(slot => {
            newConfigs[slot.slotIndex] = {
              type: slot.type,
              subtype: slot.subtype,
              configuration: slot.configuration
            };
          });
          
          // Update slot configurations
          setSlotConfigurations(newConfigs);
          
          // Mark this task as completed
          completeTask(nextIntroTaskIndex, { configuredAt: Date.now() });
        }
        break;
        
      default:
        break;
    }
  }, [currentMission, isIntroSequenceComplete, completedTasks]);



  /**
   * Mark a task as completed
   *
   * @param {number} taskIndex - Index of the task to mark as completed
   * @param {Object} data - Optional data to store with completion
   */
  const completeTask = useCallback(
    (taskIndex, data = {}) => {
      if (!currentMission || !currentMission.tasks[taskIndex]) return;

      setCompletedTasks((prev) => ({
        ...prev,
        [taskIndex]: {
          completedAt: Date.now(),
          ...data,
        },
      }));

      // Play completion sound
      const audio = new Audio("/assets/sounds/marimba-bloop.mp3");
      audio.play().catch((error) => {
        console.error("Error playing completion sound:", error);
      });

      // Check if we should show run prompt after this task
      if (currentMission.runPrompt?.showAfterTask === taskIndex) {
        setShowRunPrompt(true);
      }
      
      // Different behavior based on current phase
      const task = currentMission.tasks[taskIndex];
      
      if (isIntroductionPhaseTask(task.type)) {
        // For intro tasks, process the next one
        processIntroductionSequence();
      } else {
        // For guided tasks, move to the next task 
        // If not the last task, move to next task
        if (
          taskIndex === currentTaskIndex &&
          taskIndex < currentMission.tasks.length - 1
        ) {
          // Auto-advance to next task
          const nextTaskIndex = taskIndex + 1;
          setCurrentTaskIndex(nextTaskIndex);
  
          // Reset active hint when moving to a new task
          setActiveHint(null);
          
          // Check if this was the last task
          const isLastTask = nextTaskIndex === currentMission.tasks.length - 1;
          
          if (isLastTask) {
            // Show mission complete overlay
            setOverlayContent({
              type: "complete",
              title: "Mission Complete!",
              message:
                "You've successfully completed all the tasks in this mission!",
              image: currentMission.assets?.completeImage,
            });
            setShowMissionOverlay(true);
          }
        } 
      }
    },
    [currentMission, currentTaskIndex, processIntroductionSequence]
  );


  /**
   * Handle completion of mission intro
   * Called when the intro overlay is dismissed
   */
  const handleMissionIntroComplete = useCallback(() => {
    if (!currentMission) return;
    
    // Mark the intro task as completed
    const introTask = currentMission.tasks.find(task => 
      task.type === TASK_TYPES.MISSION_INTRO
    );
    
    if (introTask) {
      const taskIndex = currentMission.tasks.indexOf(introTask);
      completeTask(taskIndex, { introDismissed: true });
    }
    
    // Process next intro task (hardware)
    processIntroductionSequence();
  }, [currentMission, completeTask, processIntroductionSequence]);

  /**
   * Handle completion of hardware setup
   * Called when hardware requirements are met
   */
  const handleHardwareSetupComplete = useCallback(() => {
    if (!currentMission) return;
    
    // Mark the hardware task as completed
    const hardwareTask = currentMission.tasks.find(task => 
      task.type === TASK_TYPES.HARDWARE_CHECK
    );
    
    if (hardwareTask) {
      const taskIndex = currentMission.tasks.indexOf(hardwareTask);
      completeTask(taskIndex, { hardwareConnected: true });
    }
    
    // Process next intro task (initial config)
    processIntroductionSequence();
  }, [currentMission, completeTask, processIntroductionSequence]);

  /**
   * Check and handle completion of the entire intro sequence
   */
  const checkIntroSequenceCompletion = useCallback(() => {
    if (!currentMission || isIntroSequenceComplete) return;
    
    const introTasks = MissionService.getIntroductionTasks(currentMission);
    
    // Check if all intro tasks are complete
    const allIntroTasksComplete = introTasks.every(task => {
      const taskIndex = currentMission.tasks.indexOf(task);
      return completedTasks[taskIndex];
    });
    
    if (allIntroTasksComplete) {
      // Mark intro sequence as complete
      setIsIntroSequenceComplete(true);
      
      // Move to guided tasks phase
      setCurrentPhase(MISSION_PHASES.GUIDED_TASKS);
      
      // Find the first guided task
      const guidedTasks = MissionService.getGuidedTasks(currentMission);
      if (guidedTasks.length > 0) {
        const firstGuidedTaskIndex = currentMission.tasks.indexOf(guidedTasks[0]);
        setCurrentTaskIndex(firstGuidedTaskIndex);
      }
    }
  }, [currentMission, isIntroSequenceComplete, completedTasks]);

  // Check intro sequence completion whenever tasks are completed
  useEffect(() => {
    checkIntroSequenceCompletion();
  }, [completedTasks, checkIntroSequenceCompletion]);

  /**
   * Update slot configuration
   *
   * @param {number} slotIndex - Index of the slot to update
   * @param {Object} configuration - Configuration to save
   */
  const updateSlotConfiguration = useCallback((slotIndex, configuration) => {
    setSlotConfigurations((prev) => ({
      ...prev,
      [slotIndex]: configuration,
    }));
  }, []);

  /**
   * Get slot configurations
   *
   * @returns {Object} Current slot configurations
   */
  const getSlotConfigurations = useCallback(() => {
    return slotConfigurations;
  }, [slotConfigurations]);

  /**
   * Mark a step as tested
   *
   * @param {number} stepIndex - Index of the step to mark as tested
   */
  const markStepTested = useCallback(
    (stepIndex) => {
      // Find tasks related to this step
      if (!currentMission) return;

      const tasksForStep = currentMission.tasks.filter(
        (task) =>
          task.targetSlot === stepIndex &&
          task.type === TASK_TYPES.TEST_EXECUTION,
      );

      // Mark each related task as completed
      tasksForStep.forEach((task) => {
        const taskIndex = currentMission.tasks.indexOf(task);
        if (taskIndex >= 0 && !completedTasks[taskIndex]) {
          completeTask(taskIndex, { testedAt: Date.now() });
        }
      });

      // Hide test prompt after testing
      setShowTestPrompt(false);
    },
    [currentMission, completedTasks, completeTask]
  );

  /**
   * Mark the mission as run
   */
  const markMissionRun = useCallback(() => {
    if (!currentMission) return;

    // Find run program task
    const runTask = currentMission.tasks.find(
      (task) => task.type === TASK_TYPES.RUN_PROGRAM,
    );

    if (runTask) {
      const taskIndex = currentMission.tasks.indexOf(runTask);
      if (taskIndex >= 0 && !completedTasks[taskIndex]) {
        completeTask(taskIndex, { ranAt: Date.now() });
      }
    }

    // Hide run prompt after running
    setShowRunPrompt(false);
  }, [currentMission, completedTasks, completeTask]);

  /**
   * Process events from components to check for task completion
   *
   * @param {string} eventType - Type of event that occurred
   * @param {Object} eventData - Data associated with the event
   */
  const dispatchTaskEvent = useCallback(
    (eventType, eventData) => {
      if (!isMissionMode || !currentMission) return;

      // Skip event processing during intro sequence
      if (!isIntroSequenceComplete) return;

      // Get current task
      const currentTask = currentMission.tasks[currentTaskIndex];
      if (!currentTask) return;

      // Create state snapshot for task handlers
      const stateSnapshot = {
        portStates,
        isConnected,
        currentSlot: eventData.slotIndex || eventData.currentSlot,
        currentConfiguration: eventData.configuration,
        eventType,
        eventData,
      };

      // Reset inactivity timer when user interacts
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        setInactivityTimer(
          setTimeout(() => {
            showHintForCurrentTask();
          }, 30000)
        );
      }

      // Clear active hint on user interaction
      if (activeHint) {
        setActiveHint(null);
      }

      // Check if the event completes the current task
      if (
        checkTaskCompletion(
          currentTask.type,
          currentTask,
          stateSnapshot
        )
      ) {
        completeTask(currentTaskIndex, eventData);
      }
    },
    [
      isMissionMode,
      currentMission,
      isIntroSequenceComplete,
      currentTaskIndex,
      portStates,
      isConnected,
      inactivityTimer,
      activeHint,
      completeTask
    ]
  );

  /**
   * Get hint for current task
   * Uses the task registry to provide visual-only hints
   */
  const showHintForCurrentTask = useCallback(() => {
    if (!isMissionMode || !currentMission) return;

    // Don't show hints during intro sequence
    if (!isIntroSequenceComplete) return;

    // Get current task
    const currentTask = currentMission.tasks[currentTaskIndex];
    if (!currentTask) return;

    // Create state snapshot for hint generation
    const stateSnapshot = {
      portStates,
      isConnected,
      currentTask,
    };

    // Get hint from task handler - visual hint only, no text
    const hint = getTaskHint(currentTask.type, currentTask, stateSnapshot);

    if (hint) {
      setActiveHint(hint);

      // Auto-hide hint after 5 seconds
      setTimeout(() => {
        setActiveHint(null);
      }, 5000);
    }
  }, [
    isMissionMode,
    currentMission,
    isIntroSequenceComplete,
    currentTaskIndex,
    portStates,
    isConnected,
  ]);

  /**
   * Request a hint for the current task
   */
  const requestHint = useCallback(() => {
    showHintForCurrentTask();
  }, [showHintForCurrentTask]);

  /**
   * Check if a task is completed
   *
   * @param {number} taskIndex - Index of the task to check
   * @returns {boolean} Whether the task is completed
   */
  const isTaskCompleted = useCallback(
    (taskIndex) => {
      return !!completedTasks[taskIndex];
    },
    [completedTasks]
  );

  /**
   * Move to the next task
   * Used by Next button in TaskInstructionPanel
   *
   * @returns {boolean} Whether the operation was successful
   */
  const moveToNextTask = useCallback(() => {
    if (!currentMission) return false;

    // Check if we're at the last task
    if (currentTaskIndex >= currentMission.tasks.length - 1) {
      return false;
    }

    // Move to next task
    setCurrentTaskIndex(currentTaskIndex + 1);

    // Reset active hint
    setActiveHint(null);

    return true;
  }, [currentMission, currentTaskIndex]);

  /**
   * Get current task data
   *
   * @returns {Object|null} Current task object or null
   */
  const getCurrentTask = useCallback(() => {
    if (!isMissionMode || !currentMission) return null;

    // Don't return task during intro sequence
    if (!isIntroSequenceComplete) return null;

    return currentMission.tasks[currentTaskIndex] || null;
  }, [isMissionMode, currentMission, isIntroSequenceComplete, currentTaskIndex]);

  /**
   * Check if a component should be visible based on mission constraints
   *
   * @param {string} componentId - ID of the component to check
   * @param {Object} options - Additional context for the check
   * @returns {boolean} Whether the component should be visible
   */
  const isComponentVisible = useCallback(
    (componentId, options = {}) => {
      // Default to visible in sandbox mode
      if (!isMissionMode || !currentMission) return true;

      // During intro sequence, hide most components
      if (!isIntroSequenceComplete) {
        // Always show these components
        const alwaysVisibleComponents = [
          "bluetooth-menu",
          "mission-button"
        ];
        
        return alwaysVisibleComponents.includes(componentId);
      }

      const currentTask = getCurrentTask();
      if (!currentTask) return true;

      // Check if the component has explicit visibility rules
      if (currentTask.uiRestrictions) {
        const { uiRestrictions } = currentTask;

        // Check specific component visibility rules
        if (
          componentId === "type-selector" &&
          uiRestrictions.hideTypeSelection
        ) {
          return false;
        }

        if (
          componentId === "subtype-selector" &&
          uiRestrictions.hideSubtypeSelection
        ) {
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
    },
    [isMissionMode, currentMission, isIntroSequenceComplete, getCurrentTask]
  );

  /**
   * Check if a component is enabled based on mission constraints
   *
   * @param {string} componentId - ID of the component to check
   * @param {Object} options - Additional context for the check
   * @returns {boolean} Whether the component is enabled
   */
  const isComponentEnabled = useCallback(
    (componentId, options = {}) => {
      // Default to enabled in sandbox mode
      if (!isMissionMode || !currentMission) return true;

      // During intro sequence, disable most components
      if (!isIntroSequenceComplete) {
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
        if (componentId.startsWith("subtype-") && options.type) {
          const subtypeName = componentId.replace("subtype-", "");
          if (uiRestrictions.disableSubtypeOptions?.includes(subtypeName)) {
            return false;
          }
        }
      }

      // Default to enabled
      return true;
    },
    [isMissionMode, currentMission, isIntroSequenceComplete, getCurrentTask]
  );

  /**
   * Get prefilled value for a configuration field if specified in the mission
   *
   * @param {string} fieldName - Name of the configuration field
   * @returns {any} Prefilled value or undefined
   */
  const getPrefilledValue = useCallback(
    (fieldName) => {
      if (!isMissionMode || !currentMission) return undefined;

      const currentTask = getCurrentTask();
      if (!currentTask?.uiRestrictions?.prefilledValues) return undefined;

      return currentTask.uiRestrictions.prefilledValues[fieldName];
    },
    [isMissionMode, currentMission, getCurrentTask]
  );

  /**
   * Check if a configuration value is locked (cannot be changed)
   *
   * @param {string} fieldName - Name of the configuration field
   * @returns {boolean} Whether the field is locked
   */
  const isValueLocked = useCallback(
    (fieldName) => {
      if (!isMissionMode || !currentMission) return false;

      const currentTask = getCurrentTask();
      if (!currentTask?.uiRestrictions?.lockedValues) return false;

      return fieldName in currentTask.uiRestrictions.lockedValues;
    },
    [isMissionMode, currentMission, getCurrentTask]
  );

  /**
   * Validate if the current configuration meets the mission requirements
   *
   * @param {Object} configuration - Configuration to validate
   * @returns {Object} Validation result with status and message
   */
  const validateStepConfiguration = useCallback(
    (configuration) => {
      if (!isMissionMode || !currentMission) {
        return { isValid: true };
      }

      // During intro sequence, skip validation
      if (!isIntroSequenceComplete) {
        return { isValid: true };
      }

      const currentTask = getCurrentTask();
      if (!currentTask) {
        return { isValid: true };
      }

      // Create state snapshot for task validation
      const stateSnapshot = {
        portStates,
        isConnected,
        currentConfiguration: configuration,
      };

      // Validate using registry
      const isValid = validateTask(
        currentTask.type,
        currentTask,
        stateSnapshot
      );

      return {
        isValid,
        message: isValid
          ? "Configuration meets requirements"
          : "Configuration does not meet the requirements for this step.",
      };
    },
    [
      isMissionMode,
      currentMission,
      isIntroSequenceComplete,
      getCurrentTask,
      portStates,
      isConnected,
    ]
  );

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

    // Find hardware check tasks
    const hardwareTasks = currentMission.tasks.filter(
      task => task.type === TASK_TYPES.HARDWARE_CHECK || task.type === TASK_TYPES.HARDWARE_CONNECTION
    );

    // Check each hardware requirement
    hardwareTasks.forEach(task => {
      if (task.requiredDevices) {
        task.requiredDevices.forEach(requirement => {
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
    });

    return {
      isValid: missingHardware.length === 0,
      missingHardware,
    };
  }, [isMissionMode, currentMission, isConnected, portStates]);

  /**
   * Check if a mission is completed
   *
   * @returns {boolean} Whether the mission is completed
   */
  const isMissionComplete = useCallback(() => {
    if (!isMissionMode || !currentMission) return false;

    // Check if all tasks are completed
    const allTasksCompleted = currentMission.tasks.every((_, index) => completedTasks[index]);

    // Check if run is required and done
    const runTask = currentMission.tasks.find(task => task.type === TASK_TYPES.RUN_PROGRAM);
    const runComplete = !runTask || (runTask && completedTasks[currentMission.tasks.indexOf(runTask)]);

    return allTasksCompleted && runComplete;
  }, [isMissionMode, currentMission, completedTasks]);

  /**
   * Handler for overlay dismissal
   * Process different actions based on current phase
   */
  const handleOverlayDismiss = useCallback(() => {
    // Close the overlay first
    setShowMissionOverlay(false);
    
    // Different handling based on current phase
    if (currentPhase === MISSION_PHASES.INTRODUCTION) {
      // Introduction overlay dismissed - proceed to hardware setup
      handleMissionIntroComplete();
    } else if (currentPhase === MISSION_PHASES.HARDWARE_SETUP) {
      // Hardware setup overlay dismissed - check hardware and proceed if valid
      const validation = validateHardwareRequirements();
      if (validation.isValid) {
        handleHardwareSetupComplete();
      }
      // If not valid, overlay will be shown again on next check
    }
  }, [
    currentPhase, 
    handleMissionIntroComplete,
    validateHardwareRequirements,
    handleHardwareSetupComplete
  ]);

  // Provide context values
  const contextValue = {
    // Mission mode state
    isMissionMode,
    setIsMissionMode,

    // Mission data
    availableMissions,
    currentMission,
    currentPhase,

    // Task tracking
    currentTaskIndex,
    completedTasks,
    isIntroSequenceComplete,
    isTaskCompleted,
    completeTask,
    moveToNextTask,
    getCurrentTask,
    requestHint,
    activeHint,

    // Mission actions
    startMission,
    exitMission,
    markStepTested,
    markMissionRun,

    // Event handling
    dispatchTaskEvent,

    // Slot configuration
    slotConfigurations,
    updateSlotConfiguration,
    getSlotConfigurations,

    // Mission UI helpers
    isComponentVisible,
    isComponentEnabled,
    getPrefilledValue,
    isValueLocked,

    // Mission validation
    validateStepConfiguration,
    validateHardwareRequirements,
    isMissionComplete,

    // Overlay state
    showMissionOverlay,
    setShowMissionOverlay,
    overlayContent,
    setOverlayContent,
    showTestPrompt,
    setShowTestPrompt,
    showRunPrompt,
    setShowRunPrompt,
    handleOverlayDismiss
  };

  return (
    <MissionContext.Provider value={contextValue}>
      {children}
    </MissionContext.Provider>
  );
};

/**
 * Hook for accessing mission functionality from any component
 *
 * @returns {Object} Mission context functions and state
 */
export const useMission = () => useContext(MissionContext);

export default MissionContext;