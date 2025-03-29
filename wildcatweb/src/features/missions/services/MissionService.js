/**
 * @file MissionService.js
 * @description Service for loading, validating, and managing mission data.
 * Updated to support separate introduction phases and guided task sequences.
 */

import { TASK_TYPES, MISSION_PHASES } from "./TaskRegistry";

/**
 * Default missions that are included with the application
 * Updated to separate introduction phases from guided tasks
 */
const DEFAULT_MISSIONS = [
  {
    missionId: "mission1",
    title: "First Steps with Motors",
    description: "Learn to control a motor and add a wait step",
    difficultyLevel: "beginner",
    totalSteps: 2, // Number of instruction steps (not including stop)
    introTaskCount: 3, // Count of introduction tasks (intro, hardware, setup)
    totalTasks: 11, // Total number of tasks in the mission

    // Assets for the mission
    assets: {
      introImage: "/assets/images/missions/motor-mission-intro.jpg",
      completeImage: "/assets/images/missions/motor-mission-complete.jpg",
    },

    // Introduction phase tasks
    tasks: [
      // 3.1 Mission Introduction
      {
        taskId: "mission_intro",
        type: TASK_TYPES.MISSION_INTRO,
        phase: MISSION_PHASES.INTRODUCTION,
        instruction: "Welcome to your first mission!",
        stepTitle: "Get Started",
        targetSlot: 0, // Will start with first slot
      },
      
      // 3.2 Hardware Setup
      {
        taskId: "hardware_setup",
        type: TASK_TYPES.HARDWARE_CHECK,
        phase: MISSION_PHASES.HARDWARE_SETUP,
        requiredDevices: [
          { deviceType: 0x30, count: 1 } // Requires one motor
        ],
        instruction: "Connect a motor to any port",
        stepTitle: "Connect Motor",
        targetSlot: 0,
      },
      
      // 3.3 Initial Configuration
      {
        taskId: "initial_config",
        type: TASK_TYPES.INITIAL_CONFIG,
        phase: MISSION_PHASES.INITIAL_CONFIG,
        presetSlots: [
          {
            slotIndex: 0,
            type: "action",
            subtype: "motor",
            configuration: { port: "A", speed: 500 }
          },
          {
            slotIndex: 1,
            type: "input",
            subtype: "time",
            configuration: { seconds: 3 }
          }
        ],
        instruction: "Setting up your mission...",
        stepTitle: "Mission Setup",
        targetSlot: 0,
      },
      
      // 3.4 Guided Task Sequence - Actual implementation tasks
      
      // Task 1: Set Motor Speed
      {
        taskId: "set_motor_speed",
        type: TASK_TYPES.MOTOR_CONFIGURATION,
        phase: MISSION_PHASES.GUIDED_TASKS,
        targetSlot: 0,
        speedRange: [300, 1000],
        direction: "forward",
        instruction: "Make your motor spin forward",
        stepTitle: "Set Motor Speed",
        targetElement: ".forwardBar", // Target element for visual hint
        hintAnimation: "pulse", // Animation effect for the hint
      },
      
      // Task 2: Test Motor Command
      {
        taskId: "test_motor",
        type: TASK_TYPES.TEST_EXECUTION,
        phase: MISSION_PHASES.GUIDED_TASKS,
        targetSlot: 0,
        instruction: "Click TEST to see your motor spin",
        stepTitle: "Test Motor",
        targetElement: ".testButton", // Target element for visual hint
        hintAnimation: "pulse", // Animation effect for the hint
      },
      
      // Task 3: Navigate to Wait Step
      {
        taskId: "navigate_to_wait",
        type: TASK_TYPES.NAVIGATION,
        phase: MISSION_PHASES.GUIDED_TASKS,
        targetSlot: 1,
        instruction: "Click the down arrow to move to the next step",
        stepTitle: "Go to Step 2",
        targetElement: ".nextButton", // Target element for visual hint
        hintAnimation: "pulse", // Animation effect for the hint
      },
      
      // Task 4: Select SENSE
      {
        taskId: "select_input",
        type: TASK_TYPES.SELECT_INPUT_TYPE,
        phase: MISSION_PHASES.GUIDED_TASKS,
        targetSlot: 1,
        instruction: "Click on SENSE to access input options",
        stepTitle: "Select SENSE",
        targetElement: ".senseButton button", // Target element for visual hint
        hintAnimation: "pulse", // Animation effect for the hint
      },
      
      // Task 5: Select Wait
      {
        taskId: "select_timer",
        type: TASK_TYPES.SELECT_SUBTYPE,
        phase: MISSION_PHASES.GUIDED_TASKS,
        requiredType: "input",
        requiredSubtype: "time",
        targetSlot: 1,
        instruction: "Click on Wait to set a timer",
        stepTitle: "Select Wait",
        targetElement: '.subtypeButton[aria-label="Select Wait"]', // Target element for visual hint
        hintAnimation: "pulse", // Animation effect for the hint
      },
      
      // Task 6: Set Timer Duration
      {
        taskId: "set_timer",
        type: TASK_TYPES.TIMER_SETTING,
        phase: MISSION_PHASES.GUIDED_TASKS,
        targetSlot: 1,
        timeRange: [2, 5],
        instruction: "Set the timer to 3 seconds",
        stepTitle: "Set Wait Time",
        targetElement: ".timeButton", // Target element for visual hint
        hintAnimation: "pulse", // Animation effect for the hint
      },
      
      // Task 7: Test Timer
      {
        taskId: "test_timer",
        type: TASK_TYPES.TEST_EXECUTION,
        phase: MISSION_PHASES.GUIDED_TASKS,
        targetSlot: 1,
        instruction: "Click TEST to see your timer in action",
        stepTitle: "Test Timer",
        targetElement: ".testButton", // Target element for visual hint
        hintAnimation: "pulse", // Animation effect for the hint
      },
      
      // Task 8: Run Program
      {
        taskId: "run_program",
        type: TASK_TYPES.RUN_PROGRAM,
        phase: MISSION_PHASES.GUIDED_TASKS,
        targetSlot: 0, // Start from the beginning
        instruction: "Click the PLAY button to run your complete program",
        stepTitle: "Run Program",
        targetElement: ".playButton", // Target element for visual hint
        hintAnimation: "pulse", // Animation effect for the hint
      }
    ],

    // Optional prompts
    runPrompt: {
      showPrompt: true,
      message: "Great job setting up your program! Now click PLAY to see what happens.",
      showAfterTask: 7, // Show after test_timer task
      requiredForCompletion: true,
    }
  }
];

/**
 * Service for managing mission data
 */
const MissionService = {
  /**
   * Get all available missions
   *
   * @returns {Promise<Array>} Array of mission objects
   */
  getAllMissions: async () => {
    // First check if there are any saved missions in localStorage
    try {
      const savedMissions = localStorage.getItem("customMissions");
      if (savedMissions) {
        const parsed = JSON.parse(savedMissions);
        // Combine default missions with custom ones
        return [...DEFAULT_MISSIONS, ...parsed];
      }
    } catch (error) {
      console.error("Error loading custom missions:", error);
    }

    // Return default missions if no custom ones found
    return DEFAULT_MISSIONS;
  },

  /**
   * Get a specific mission by ID
   *
   * @param {string} missionId - ID of the mission to retrieve
   * @returns {Promise<Object|null>} Mission object or null if not found
   */
  getMissionById: async (missionId) => {
    const allMissions = await MissionService.getAllMissions();
    return (
      allMissions.find((mission) => mission.missionId === missionId) ||
      null
    );
  },

  /**
   * Get introduction tasks for a mission
   * 
   * @param {Object} mission - Mission object
   * @returns {Array} Array of introduction phase tasks
   */
  getIntroductionTasks: (mission) => {
    if (!mission || !mission.tasks) return [];
    
    return mission.tasks.filter(task => 
      task.phase === MISSION_PHASES.INTRODUCTION ||
      task.phase === MISSION_PHASES.HARDWARE_SETUP ||
      task.phase === MISSION_PHASES.INITIAL_CONFIG
    );
  },
  
  /**
   * Get guided tutorial tasks for a mission
   * 
   * @param {Object} mission - Mission object
   * @returns {Array} Array of guided tutorial tasks
   */
  getGuidedTasks: (mission) => {
    if (!mission || !mission.tasks) return [];
    
    return mission.tasks.filter(task => 
      task.phase === MISSION_PHASES.GUIDED_TASKS
    );
  },

  /**
   * Save a custom mission
   *
   * @param {Object} mission - Mission object to save
   * @returns {Promise<boolean>} Success status
   */
  saveCustomMission: async (mission) => {
    // Validate mission first
    const validation = MissionService.validateMission(mission);
    if (!validation.isValid) {
      console.error("Invalid mission format:", validation.errors);
      return false;
    }

    try {
      // Get existing custom missions
      let customMissions = [];
      const saved = localStorage.getItem("customMissions");

      if (saved) {
        customMissions = JSON.parse(saved);
      }

      // Check if mission already exists (for update)
      const existingIndex = customMissions.findIndex(
        (m) => m.missionId === mission.missionId,
      );

      if (existingIndex >= 0) {
        // Update existing mission
        customMissions[existingIndex] = mission;
      } else {
        // Add new mission
        customMissions.push(mission);
      }

      // Save back to localStorage
      localStorage.setItem(
        "customMissions",
        JSON.stringify(customMissions),
      );
      return true;
    } catch (error) {
      console.error("Error saving custom mission:", error);
      return false;
    }
  },

  /**
   * Delete a custom mission
   *
   * @param {string} missionId - ID of the mission to delete
   * @returns {Promise<boolean>} Success status
   */
  deleteCustomMission: async (missionId) => {
    try {
      // Can only delete custom missions, not default ones
      const defaultMission = DEFAULT_MISSIONS.find(
        (m) => m.missionId === missionId,
      );
      if (defaultMission) {
        console.error("Cannot delete default mission");
        return false;
      }

      // Get existing custom missions
      const saved = localStorage.getItem("customMissions");
      if (!saved) return false;

      const customMissions = JSON.parse(saved);
      const updatedMissions = customMissions.filter(
        (m) => m.missionId !== missionId,
      );

      // Save back to localStorage
      localStorage.setItem(
        "customMissions",
        JSON.stringify(updatedMissions),
      );
      return true;
    } catch (error) {
      console.error("Error deleting custom mission:", error);
      return false;
    }
  },

  /**
   * Validate mission data structure
   * Checks if a mission object has all required fields and valid structure
   *
   * @param {Object} mission - Mission object to validate
   * @returns {Object} Validation result with status and errors
   */
  validateMission: (mission) => {
    const errors = [];

    // Check required top-level fields
    if (!mission.missionId) errors.push("Missing missionId");
    if (!mission.title) errors.push("Missing title");
    if (!mission.description) errors.push("Missing description");
    if (!mission.totalTasks) errors.push("Missing totalTasks");

    // Check tasks
    if (!mission.tasks || !Array.isArray(mission.tasks)) {
      errors.push("Missing or invalid tasks array");
    } else if (mission.tasks.length !== mission.totalTasks) {
      errors.push(
        `Mission has ${mission.tasks.length} tasks but totalTasks is ${mission.totalTasks}`,
      );
    } else {
      // Check each task
      mission.tasks.forEach((task, index) => {
        if (!task.taskId)
          errors.push(`Task ${index} is missing taskId`);
        if (!task.type) errors.push(`Task ${index} is missing type`);
        if (!task.instruction)
          errors.push(`Task ${index} is missing instruction`);
        
        // Check phase is valid
        if (!task.phase) {
          errors.push(`Task ${index} is missing phase`);
        } else if (!Object.values(MISSION_PHASES).includes(task.phase)) {
          errors.push(`Task ${index} has unknown phase: ${task.phase}`);
        }

        // Validate task matches a known type
        if (!Object.values(TASK_TYPES).includes(task.type)) {
          errors.push(`Task ${index} has unknown type: ${task.type}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Import mission from JSON string
   *
   * @param {string} jsonString - JSON string containing mission data
   * @returns {Object} Result with imported mission and status
   */
  importMissionFromJson: (jsonString) => {
    try {
      const mission = JSON.parse(jsonString);

      // Validate mission structure
      const validation = MissionService.validateMission(mission);

      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          mission: null,
        };
      }

      return {
        success: true,
        mission,
      };
    } catch (error) {
      return {
        success: false,
        errors: ["Invalid JSON format: " + error.message],
        mission: null,
      };
    }
  },

  /**
   * Export mission to JSON string
   *
   * @param {Object} mission - Mission object to export
   * @returns {string} JSON string representation of the mission
   */
  exportMissionToJson: (mission) => {
    return JSON.stringify(mission, null, 2);
  }
};

export default MissionService;