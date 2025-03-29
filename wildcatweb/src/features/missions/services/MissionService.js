/**
 * @file MissionService.js
 * @description Service for loading, validating, and managing mission data.
 * Uses the corrected structure with introduction phases separate from tasks.
 */

import { TASK_TYPES } from "./TaskRegistry";

/**
 * Default missions that are included with the application
 */
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
    
    // Only actual guided tasks
    tasks: [
      // Task 1: Set Motor Speed
      {
        taskId: "set_motor_speed",
        type: "MOTOR_CONFIGURATION",
        targetSlot: 0,
        speedRange: [300, 1000],
        direction: "forward",
        instruction: "Make your motor spin forward",
        stepTitle: "Set Motor Speed",
        targetElement: ".forwardBar",
        // Will check against the detected port from hardware setup
        validatePort: true
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
      
      // Task 3: Navigate to Wait Step
      {
        taskId: "navigate_to_wait",
        type: "NAVIGATION",
        targetSlot: 1,
        instruction: "Click the down arrow to move to the next step",
        stepTitle: "Go to Step 2",
        targetElement: ".nextButton"
      },
      
      // Task 4: Select SENSE
      {
        taskId: "select_input",
        type: "SELECT_INPUT_TYPE",
        targetSlot: 1,
        instruction: "Click on SENSE to access input options",
        stepTitle: "Select SENSE",
        targetElement: ".senseButton button"
      },
      
      // Task 5: Select Wait
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
      
      // Task 6: Set Timer Duration
      {
        taskId: "set_timer",
        type: "TIMER_SETTING",
        targetSlot: 1,
        timeRange: [2, 5],
        instruction: "Set the timer to 3 seconds",
        stepTitle: "Set Wait Time",
        targetElement: ".timeButton"
      },
      
      // Task 7: Test Timer
      {
        taskId: "test_timer",
        type: "TEST_EXECUTION",
        targetSlot: 1,
        instruction: "Click TEST to see your timer in action",
        stepTitle: "Test Timer",
        targetElement: ".testButton"
      },
      
      // Task 8: Run Program
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
    if (!mission.totalSteps) errors.push("Missing totalSteps");

    // Check introduction phase properties
    if (!mission.hardwareRequirements || !Array.isArray(mission.hardwareRequirements)) {
      errors.push("Missing or invalid hardwareRequirements");
    }
    
    if (!mission.initialConfiguration || !mission.initialConfiguration.slots) {
      errors.push("Missing or invalid initialConfiguration");
    }

    // Check tasks
    if (!mission.tasks || !Array.isArray(mission.tasks)) {
      errors.push("Missing or invalid tasks array");
    } else if (mission.tasks.length !== mission.totalTasks) {
      errors.push(
        `Mission has ${mission.tasks.length} tasks but totalTasks is ${mission.totalTasks}`
      );
    } else {
      // Check each task
      mission.tasks.forEach((task, index) => {
        if (!task.taskId)
          errors.push(`Task ${index} is missing taskId`);
        if (!task.type) errors.push(`Task ${index} is missing type`);
        if (!task.instruction)
          errors.push(`Task ${index} is missing instruction`);
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