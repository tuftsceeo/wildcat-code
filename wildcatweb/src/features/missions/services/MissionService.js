/**
 * @file MissionService.js
 * @description Service for loading, validating, and managing mission data.
 * Handles retrieving mission definitions from local storage or files.
 */

/**
 * Default missions that are included with the application
 * In a real implementation, these would be loaded from individual JSON files
 */
const DEFAULT_MISSIONS = [
  {
    missionId: "mission1",
    title: "First Steps with Motors",
    description: "Learn to control a motor and add a wait step",
    difficultyLevel: "beginner",
    totalMissionSteps: 2,
    steps: [
      {
        stepNumber: 1,
        stepTitle: "Add a Motor",
        stepDescription: "Make your motor spin forward",
        requiredType: "action",
        requiredSubtype: "motor",
        testPrompt: {
          showPrompt: true,
          message: "Try testing your motor! Click the Test button.",
          requiredForProgress: false
        },
        allowedConfigurations: {
          allowMultipleMotors: false,
          requiredMotorCount: 1,
          allowedPorts: ["A", "B", "C"],
          speedRange: [300, 1000],
          allowedDirections: ["forward"]
        },
        uiRestrictions: {
          hideTypeSelection: true,
          hideSubtypeSelection: true,
          prefilledValues: {
            speed: 500
          }
        },
        instructions: {
          instruction: "Connect your motor to port A and make it spin forward.",
          hints: [
            "Click on the motor in the dashboard",
            "Drag the speed slider to the right"
          ],
          successMessage: "Great job! Your motor is spinning forward."
        }
      },
      {
        stepNumber: 2,
        stepTitle: "Add a Wait Step",
        stepDescription: "Make your program wait for 3 seconds",
        requiredType: "input",
        requiredSubtype: "time",
        allowedConfigurations: {
          timeRange: [2, 5]
        },
        uiRestrictions: {
          hideTypeSelection: false,
          hideSubtypeSelection: false,
          prefilledValues: {
            seconds: 3
          }
        },
        instructions: {
          instruction: "Now add a wait step to make your program pause.",
          hints: [
            "Click on SENSE",
            "Select the Wait option",
            "Set the time to 3 seconds"
          ]
        }
      }
    ],
    runPrompt: {
      showPrompt: true,
      message: "Great job setting up your program! Now click Run to see what happens.",
      showAfterStep: 2,
      requiredForCompletion: true
    }
  },
  {
    missionId: "mission2",
    title: "Button Control",
    description: "Learn to use a button to control your program",
    difficultyLevel: "beginner",
    totalMissionSteps: 3,
    steps: [
      {
        stepNumber: 1,
        stepTitle: "Add a Button",
        stepDescription: "Wait for a button press",
        requiredType: "input",
        requiredSubtype: "button",
        testPrompt: {
          showPrompt: true,
          message: "Try testing your button! Connect a force sensor and click Test.",
          requiredForProgress: false
        },
        allowedConfigurations: {
          allowedPorts: ["A", "B", "C", "D", "E", "F"],
          allowedButtonStates: ["pressed"]
        },
        uiRestrictions: {
          hideTypeSelection: true,
          hideSubtypeSelection: true,
          prefilledValues: {
            waitCondition: "pressed"
          }
        },
        instructions: {
          instruction: "Connect a force sensor to any port and wait for it to be pressed.",
          hints: [
            "Connect a force sensor to port A",
            "Make sure 'pressed' is selected"
          ],
          successMessage: "Great! Your program will now wait for a button press."
        }
      },
      {
        stepNumber: 2,
        stepTitle: "Add a Motor",
        stepDescription: "Make your motor spin when the button is pressed",
        requiredType: "action",
        requiredSubtype: "motor",
        allowedConfigurations: {
          allowMultipleMotors: false,
          requiredMotorCount: 1,
          allowedPorts: ["A", "B", "C", "D", "E", "F"],
          speedRange: [500, 1000],
          allowedDirections: ["forward", "backward"]
        },
        uiRestrictions: {
          hideTypeSelection: false,
          hideSubtypeSelection: false
        },
        instructions: {
          instruction: "After the button is pressed, make a motor spin.",
          hints: [
            "Click on ACTION",
            "Select the Motor option",
            "Set a speed for your motor"
          ]
        }
      },
      {
        stepNumber: 3,
        stepTitle: "Add a Wait Step",
        stepDescription: "Make your program wait before stopping",
        requiredType: "input",
        requiredSubtype: "time",
        allowedConfigurations: {
          timeRange: [2, 5]
        },
        uiRestrictions: {
          hideTypeSelection: false,
          hideSubtypeSelection: false
        },
        instructions: {
          instruction: "Now add a wait step after the motor starts spinning.",
          hints: [
            "Click on SENSE",
            "Select the Wait option",
            "Set the time to 3 seconds"
          ]
        }
      }
    ],
    runPrompt: {
      showPrompt: true,
      message: "Great job! Now run your program and press the button to see what happens.",
      showAfterStep: 3,
      requiredForCompletion: true
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
    return allMissions.find(mission => mission.missionId === missionId) || null;
  },
  
  /**
   * Save a custom mission
   * 
   * @param {Object} mission - Mission object to save
   * @returns {Promise<boolean>} Success status
   */
  saveCustomMission: async (mission) => {
    try {
      // Get existing custom missions
      let customMissions = [];
      const saved = localStorage.getItem("customMissions");
      
      if (saved) {
        customMissions = JSON.parse(saved);
      }
      
      // Check if mission already exists (for update)
      const existingIndex = customMissions.findIndex(m => m.missionId === mission.missionId);
      
      if (existingIndex >= 0) {
        // Update existing mission
        customMissions[existingIndex] = mission;
      } else {
        // Add new mission
        customMissions.push(mission);
      }
      
      // Save back to localStorage
      localStorage.setItem("customMissions", JSON.stringify(customMissions));
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
      const defaultMission = DEFAULT_MISSIONS.find(m => m.missionId === missionId);
      if (defaultMission) {
        console.error("Cannot delete default mission");
        return false;
      }
      
      // Get existing custom missions
      const saved = localStorage.getItem("customMissions");
      if (!saved) return false;
      
      const customMissions = JSON.parse(saved);
      const updatedMissions = customMissions.filter(m => m.missionId !== missionId);
      
      // Save back to localStorage
      localStorage.setItem("customMissions", JSON.stringify(updatedMissions));
      return true;
    } catch (error) {
      console.error("Error deleting custom mission:", error);
      return false;
    }
  },
  
  /**
   * Get mission progress for a specific mission
   * 
   * @param {string} missionId - ID of the mission
   * @returns {Object|null} Mission progress or null if not found
   */
  getMissionProgress: (missionId) => {
    try {
      const savedProgress = localStorage.getItem("missionProgress");
      if (!savedProgress) return null;
      
      const progress = JSON.parse(savedProgress);
      if (progress.activeMissionId !== missionId) return null;
      
      return progress;
    } catch (error) {
      console.error("Error getting mission progress:", error);
      return null;
    }
  },
  
  /**
   * Save mission progress
   * 
   * @param {Object} progress - Progress data to save
   * @returns {boolean} Success status
   */
  saveMissionProgress: (progress) => {
    try {
      localStorage.setItem("missionProgress", JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error("Error saving mission progress:", error);
      return false;
    }
  },
  
  /**
   * Clear all mission progress
   * 
   * @returns {boolean} Success status
   */
  clearMissionProgress: () => {
    try {
      localStorage.removeItem("missionProgress");
      return true;
    } catch (error) {
      console.error("Error clearing mission progress:", error);
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
    if (!mission.totalMissionSteps) errors.push("Missing totalMissionSteps");
    
    // Check steps
    if (!mission.steps || !Array.isArray(mission.steps)) {
      errors.push("Missing or invalid steps array");
    } else {
      if (mission.steps.length !== mission.totalMissionSteps) {
        errors.push(`Mission has ${mission.steps.length} steps but totalMissionSteps is ${mission.totalMissionSteps}`);
      }
      
      // Check each step
      mission.steps.forEach((step, index) => {
        if (!step.stepNumber) errors.push(`Step ${index} is missing stepNumber`);
        if (!step.stepTitle) errors.push(`Step ${index} is missing stepTitle`);
        if (!step.stepDescription) errors.push(`Step ${index} is missing stepDescription`);
        
        // Check if step has required type and subtype
        if (!step.requiredType) {
          errors.push(`Step ${index} is missing requiredType`);
        } else if (!['action', 'input'].includes(step.requiredType)) {
          errors.push(`Step ${index} has invalid requiredType: ${step.requiredType}`);
        }
        
        if (!step.requiredSubtype) {
          errors.push(`Step ${index} is missing requiredSubtype`);
        } else {
          // Check for valid subtypes based on type
          if (step.requiredType === 'action' && !['motor'].includes(step.requiredSubtype)) {
            errors.push(`Step ${index} has invalid action subtype: ${step.requiredSubtype}`);
          } else if (step.requiredType === 'input' && !['time', 'button'].includes(step.requiredSubtype)) {
            errors.push(`Step ${index} has invalid input subtype: ${step.requiredSubtype}`);
          }
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
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
          mission: null
        };
      }
      
      return {
        success: true,
        mission
      };
    } catch (error) {
      return {
        success: false,
        errors: ["Invalid JSON format: " + error.message],
        mission: null
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
