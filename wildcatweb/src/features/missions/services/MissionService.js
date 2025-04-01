/**
 * @file MissionService.js
 * @description Improved service for loading, validating, and managing mission data.
 */

import { logTaskEvent } from '../models/Task';
import TaskFactory, { TASK_TYPES } from '../models/TaskFactory';
import { getDeviceByName } from '../utils/DeviceTypes';

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
    totalTasks: 6, // Total number of guided tasks
    
    // Introduction phase metadata (NOT tasks)
    hardwareRequirements: [
      { deviceName: "motor", count: 1 } // One motor required
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
    
    // UI restrictions for the mission
    uiRestrictions: {
      hideTypeSelection: false,
      hideSubtypeSelection: false,
      visibleComponents: [],
      hiddenComponents: [],
      disabledComponents: [],
      prefilledValues: {},
      lockedValues: {}
    },
    
    // Tasks
    tasks: [
      // Task 1: Set Motor Speed
      {
        taskId: "set_motor_speed",
        type: "MOTOR_CONFIGURATION",
        targetSlot: 0,
        motorRequirements: [
          {
            speedRange: [300, 1000],
            direction: "clockwise"
          }
        ],
        instruction: "Make your motor on port {motorPort} spin clockwise",
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
        instruction: "Click TEST to see your motor on port {motorPort} spin",
        stepTitle: "Test Motor",
        targetElement: ".testButton",
        uiRestrictions: {
          hideTypeSelection: true,
          hideSubtypeSelection: true
        }
      },
      
      // Task 3: Navigate to Wait Step
      {
        taskId: "navigate_to_wait",
        type: "NAVIGATION",
        targetSlot: 1,
        instruction: "Click the down arrow to move to the next step",
        stepTitle: "Go to Step 2",
        targetElement: ".nextButton",
        uiRestrictions: {
          hideTypeSelection: true,
          hideSubtypeSelection: true
        }
      },
      
      // Task 6: Set Timer Duration
      {
        taskId: "set_timer",
        type: "TIMER_SETTING",
        targetSlot: 1,
        timeRange: [3, 5],
        instruction: "Set the timer to 3 seconds",
        stepTitle: "Set Wait Time",
        targetElement: ".timeButton",
        uiRestrictions: {
          hideTypeSelection: true,
          hideSubtypeSelection: true
        }
      },
      
      // Task 7: Test Timer
      {
        taskId: "test_timer",
        type: "TEST_EXECUTION",
        targetSlot: 1,
        instruction: "Click TEST to see your timer in action",
        stepTitle: "Test Timer",
        targetElement: ".testButton",
        uiRestrictions: {
          hideTypeSelection: true,
          hideSubtypeSelection: true
        }
      },
      
      // Task 8: Run Program
      {
        taskId: "run_program",
        type: "RUN_PROGRAM",
        targetSlot: 0, // Start from the beginning
        instruction: "Click the PLAY button to run your complete program",
        stepTitle: "Run Program",
        targetElement: ".playButton",
        uiRestrictions: {
          hideTypeSelection: true,
          hideSubtypeSelection: true
        }
      }
    ],
  },
  {
    missionId: "two_motor_mission",
    title: "Two Motor Challenge",
    description: "Control two motors with different directions and speeds",
    difficultyLevel: "intermediate",
    totalSteps: 3,
    totalTasks: 5,
    
    hardwareRequirements: [
      { deviceName: "motor", count: 2 }
    ],
    
    // Define semantic identities for motors - no port references
    motorIdentities: {
      "left": {
        role: "drive wheel",
        position: "left side" 
      },
      "right": {
        role: "drive wheel",
        position: "right side"
      }
    },
    
    initialConfiguration: {
      slots: [
        {
          slotIndex: 0,
          type: "action",
          subtype: "motor",
          // No port references - ports will be assigned at runtime
          configuration: []
        },
        {
          slotIndex: 1,
          type: "input",
          subtype: "time",
          configuration: { seconds: 0 }
        },
        {
          slotIndex: 2,
          type: "action",
          subtype: "motor",
          // No port references - ports will be assigned at runtime
          configuration: []
        }
      ]
    },
    
    // Assets for the mission
    assets: {
      introImage: "/assets/images/missions/two-motor-intro.jpg",
      completeImage: "/assets/images/missions/two-motor-complete.jpg",
    },
    
    // UI restrictions for the mission
    uiRestrictions: {
      hideTypeSelection: false,
      hideSubtypeSelection: false,
      visibleComponents: [],
      hiddenComponents: [],
      disabledComponents: [],
      prefilledValues: {},
      lockedValues: {}
    },
    
    tasks: [
      // Task 1: Configure left motor
      {
        taskId: "configure_left_motor",
        type: "MOTOR_CONFIGURATION",
        targetSlot: 0,
        targetMotorIdentity: "left", // Identify motor by semantic identity
        motorRequirements: [
          {
            speedRange: [300, 1000],
            direction: "clockwise"
            // No port references
          }
        ],
        // User will see "Make Motor A spin clockwise"
        instruction: "Make Motor {leftMotorPort} spin clockwise",
        stepTitle: "Set First Motor Speed",
        targetElement: ".clockwiseBar"
      },
      
      // Task 2: Configure right motor
      {
        taskId: "configure_right_motor",
        type: "MOTOR_CONFIGURATION",
        targetSlot: 0,
        targetMotorIdentity: "right", // Identify motor by semantic identity
        motorRequirements: [
          {
            speedRange: [300, 1000],
            direction: "countercw"
            // No port references
          }
        ],
        // User will see "Make Motor B spin counter-clockwise"
        instruction: "Make Motor {rightMotorPort} spin counter-clockwise",
        stepTitle: "Set Second Motor Speed",
        targetElement: ".countercwBar"
      },
      
      // Task 3: Set wait time
      {
        taskId: "set_timer",
        type: "TIMER_SETTING",
        targetSlot: 1,
        timeRange: [2, 4],
        instruction: "Set a timer for 3 seconds",
        stepTitle: "Set Wait Time",
        targetElement: ".timeButton"
      },
      
      // Task 4: Stop left motor - same motor from Task 1
      {
        taskId: "stop_left_motor",
        type: "MOTOR_CONFIGURATION",
        targetSlot: 2,
        targetMotorIdentity: "left", // Reference the same motor by identity
        motorRequirements: [
          {
            speedRange: [0, 0], // Speed of 0 = stopped
            direction: "clockwise"
          }
        ],
        // User will see "Stop Motor A"
        instruction: "Stop Motor {leftMotorPort}",
        stepTitle: "Stop First Motor",
        targetElement: ".motorDashContainer"
      },
      
      // Task 5: Run program
      {
        taskId: "run_program",
        type: "RUN_PROGRAM",
        instruction: "Click the PLAY button to run your complete program",
        stepTitle: "Run Program",
        targetElement: ".playButton"
      }
    ]
  }
];

/**
 * Mission service for managing mission data
 */
class MissionService {
  /**
   * Get all available missions
   *
   * @returns {Promise<Array>} Array of mission objects
   */
  async getAllMissions() {
    logTaskEvent('Getting all available missions');
    
    // First check if there are any saved missions in localStorage
    try {
      const savedMissions = localStorage.getItem("customMissions");
      if (savedMissions) {
        const parsed = JSON.parse(savedMissions);
        
        // Combine default missions with custom ones
        const allMissions = [...DEFAULT_MISSIONS, ...parsed];
        logTaskEvent(`Found ${allMissions.length} missions (${DEFAULT_MISSIONS.length} default, ${parsed.length} custom)`);
        
        return allMissions;
      }
    } catch (error) {
      console.error("Error loading custom missions:", error);
    }

    // Return default missions if no custom ones found
    logTaskEvent(`Returning ${DEFAULT_MISSIONS.length} default missions`);
    return DEFAULT_MISSIONS;
  }

  /**
   * Get a specific mission by ID
   *
   * @param {string} missionId - ID of the mission to retrieve
   * @returns {Promise<Object|null>} Mission object or null if not found
   */
  async getMissionById(missionId) {
    logTaskEvent(`Getting mission by ID: ${missionId}`);
    
    const allMissions = await this.getAllMissions();
    const mission = allMissions.find((mission) => mission.missionId === missionId);
    
    if (!mission) {
      logTaskEvent(`Mission with ID ${missionId} not found`);
      return null;
    }
    
    // Pre-validate tasks using our task models
    if (mission.tasks) {
      try {
        // Create task models to validate structure
        const taskModels = TaskFactory.createTasks(mission.tasks);
        logTaskEvent(`Successfully validated ${taskModels.length} tasks in mission ${missionId}`);
      } catch (error) {
        console.error(`Error validating tasks for mission ${missionId}:`, error);
      }
    }
    
    return mission;
  }

  /**
   * Save a custom mission
   *
   * @param {Object} mission - Mission object to save
   * @returns {Promise<boolean>} Success status
   */
  async saveCustomMission(mission) {
    // Validate mission first
    const validation = this.validateMission(mission);
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
      
      logTaskEvent(`Saved custom mission: ${mission.title}`, {
        missionId: mission.missionId,
        taskCount: mission.tasks.length
      });
      
      return true;
    } catch (error) {
      console.error("Error saving custom mission:", error);
      return false;
    }
  }

  /**
   * Delete a custom mission
   *
   * @param {string} missionId - ID of the mission to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteCustomMission(missionId) {
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
      
      logTaskEvent(`Deleted custom mission with ID: ${missionId}`);
      return true;
    } catch (error) {
      console.error("Error deleting custom mission:", error);
      return false;
    }
  }

  /**
   * Validate a mission's format and requirements
   * @param {Object} mission - Mission object to validate
   * @returns {Object} Validation result with isValid flag and errors array
   */
  validateMission(mission) {
    const errors = [];
    
    // Check required fields
    if (!mission.missionId) errors.push("Missing missionId");
    if (!mission.title) errors.push("Missing title");
    if (!mission.description) errors.push("Missing description");
    if (!mission.difficultyLevel) errors.push("Missing difficultyLevel");
    if (!mission.totalSteps) errors.push("Missing totalSteps");
    if (!mission.totalTasks) errors.push("Missing totalTasks");
    
    // Validate hardware requirements
    if (mission.hardwareRequirements) {
      mission.hardwareRequirements.forEach((req, index) => {
        if (!req.deviceName) {
          errors.push(`Hardware requirement ${index} missing deviceName`);
        } else {
          // Check if device name is valid
          const device = getDeviceByName(req.deviceName);
          if (!device) {
            errors.push(`Invalid device name in hardware requirement ${index}: ${req.deviceName}`);
          }
        }
        if (req.count === undefined || req.count < 1) {
          errors.push(`Invalid count in hardware requirement ${index}`);
        }
      });
    }
    
    // Validate tasks
    if (mission.tasks) {
      mission.tasks.forEach((task, index) => {
        if (!task.taskId) errors.push(`Task ${index} missing taskId`);
        if (!task.type) errors.push(`Task ${index} missing type`);
        if (!task.instruction) errors.push(`Task ${index} missing instruction`);
        
        // Validate motor configuration tasks
        if (task.type === "MOTOR_CONFIGURATION") {
          if (!task.motorRequirements || !Array.isArray(task.motorRequirements)) {
            errors.push(`Task ${index} missing or invalid motorRequirements`);
          } else {
            task.motorRequirements.forEach((req, reqIndex) => {
              if (req.speedRange && (!Array.isArray(req.speedRange) || req.speedRange.length !== 2)) {
                errors.push(`Task ${index} motor requirement ${reqIndex} has invalid speedRange`);
              }
              if (req.direction && !["clockwise", "countercw"].includes(req.direction)) {
                errors.push(`Task ${index} motor requirement ${reqIndex} has invalid direction`);
              }
            });
          }
        }
        
        // Validate port placeholders in instructions
        if (task.instruction) {
          const placeholders = task.instruction.match(/{(\w+)}/g) || [];
          placeholders.forEach(placeholder => {
            const deviceName = placeholder.slice(1, -1).replace('Port', '');
            if (!getDeviceByName(deviceName)) {
              errors.push(`Task ${index} instruction contains invalid device placeholder: ${placeholder}`);
            }
          });
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Import mission from JSON string
   *
   * @param {string} jsonString - JSON string containing mission data
   * @returns {Object} Result with imported mission and status
   */
  importMissionFromJson(jsonString) {
    try {
      const mission = JSON.parse(jsonString);

      // Validate mission structure
      const validation = this.validateMission(mission);

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
  }

  /**
   * Export mission to JSON string
   *
   * @param {Object} mission - Mission object to export
   * @returns {string} JSON string representation of the mission
   */
  exportMissionToJson(mission) {
    return JSON.stringify(mission, null, 2);
  }
  
  /**
   * Get mission progress for a mission
   * 
   * @param {string} missionId - Mission ID to check
   * @returns {Object|null} Progress data or null if not found
   */
  getMissionProgress(missionId) {
    try {
      const progressData = localStorage.getItem(`mission_${missionId}_progress`);
      
      if (!progressData) {
        return null;
      }
      
      return JSON.parse(progressData);
    } catch (error) {
      console.error('Error retrieving mission progress:', error);
      return null;
    }
  }
  
  /**
   * Save mission progress
   * 
   * @param {string} missionId - Mission ID 
   * @param {Object} progress - Progress data
   * @returns {boolean} Success status
   */
  saveMissionProgress(missionId, progress) {
    try {
      localStorage.setItem(
        `mission_${missionId}_progress`, 
        JSON.stringify(progress)
      );
      return true;
    } catch (error) {
      console.error('Error saving mission progress:', error);
      return false;
    }
  }
}

// Create singleton instance
const missionService = new MissionService();

export default missionService;
