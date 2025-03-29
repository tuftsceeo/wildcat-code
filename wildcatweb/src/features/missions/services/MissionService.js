/**
 * @file MissionService.js
 * @description Service for loading, validating, and managing mission data.
 * Handles retrieving mission definitions from local storage or files.
 * Updated for flat task structure and task registry integration.
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
        totalTasks: 6, // Total number of tasks to complete

        // Flat task array
        tasks: [
            {
                taskId: "connect_motor",
                type: TASK_TYPES.HARDWARE_CONNECTION,
                deviceType: 0x30, // Motor device type
                count: 1,
                targetSlot: 0,
                parentStepIndex: 0,
                stepTitle: "Connect Motor",
                instruction: "Connect a motor to any port",
                hints: ["Look for the LEGO Spike motor and connect it"],
                uiRestrictions: {
                    // No restrictions for hardware connection
                },
            },
            {
                taskId: "select_action",
                type: TASK_TYPES.SELECT_ACTION_TYPE,
                targetSlot: 0,
                parentStepIndex: 0,
                stepTitle: "Select ACTION",
                instruction: "Click on ACTION to control your motor",
                hints: ["Look for the ACTION button at the top of the panel"],
                uiRestrictions: {
                    // Only show action once the hardware is connected
                    visibleComponents: ["type-selector"],
                },
            },
            {
                taskId: "select_motor_subtype",
                type: TASK_TYPES.SELECT_SUBTYPE,
                requiredType: "action",
                requiredSubtype: "motor",
                targetSlot: 0,
                parentStepIndex: 0,
                stepTitle: "Select Speed",
                instruction: "Click on Speed to control your motor",
                hints: ["Look for the Speed button on the left panel"],
                uiRestrictions: {
                    visibleComponents: ["subtype-selector"],
                },
            },
            {
                taskId: "set_motor_speed",
                type: TASK_TYPES.MOTOR_CONFIGURATION,
                targetSlot: 0,
                parentStepIndex: 0,
                speedRange: [300, 1000],
                direction: "forward",
                stepTitle: "Set Motor Speed",
                instruction: "Make your motor spin forward",
                hints: ["Click on the speed bar to set a forward speed"],
                successMessage:
                    "Great job! You've set your motor to move forward.",
                uiRestrictions: {
                    prefilledValues: {
                        speed: 500,
                    },
                },
            },
            {
                taskId: "test_motor",
                type: TASK_TYPES.TEST_EXECUTION,
                targetSlot: 0,
                parentStepIndex: 0,
                stepTitle: "Test Motor",
                instruction: "Click TEST to see your motor spin",
                hints: [
                    "Look for the TEST button at the bottom of the coding area",
                ],
                successMessage:
                    "Perfect! Now let's add a wait step to make the motor stop after a while.",
            },
            {
                taskId: "navigate_to_wait",
                type: TASK_TYPES.NAVIGATION,
                targetSlot: 1,
                parentStepIndex: 1,
                stepTitle: "Go to Step 2",
                instruction: "Click the down arrow to move to the next step",
                hints: ["Find the arrow at the bottom of the coding area"],
            },
            {
                taskId: "select_input",
                type: TASK_TYPES.SELECT_INPUT_TYPE,
                targetSlot: 1,
                parentStepIndex: 1,
                stepTitle: "Select SENSE",
                instruction: "Click on SENSE to access input options",
                hints: ["Look for the SENSE button at the top of the panel"],
                uiRestrictions: {
                    visibleComponents: ["type-selector"],
                },
            },
            {
                taskId: "select_timer",
                type: TASK_TYPES.SELECT_SUBTYPE,
                requiredType: "input",
                requiredSubtype: "time",
                targetSlot: 1,
                parentStepIndex: 1,
                stepTitle: "Select Wait",
                instruction: "Click on Wait to set a timer",
                hints: ["Look for the Wait button on the right panel"],
                uiRestrictions: {
                    visibleComponents: ["subtype-selector"],
                },
            },
            {
                taskId: "set_timer",
                type: TASK_TYPES.TIMER_SETTING,
                targetSlot: 1,
                parentStepIndex: 1,
                timeRange: [2, 5],
                stepTitle: "Set Wait Time",
                instruction: "Set the timer to 3 seconds",
                hints: ["Use the + button to increase the time"],
                successMessage:
                    "Great job! You've set a timer to pause your program.",
                uiRestrictions: {
                    prefilledValues: {
                        seconds: 3,
                    },
                },
            },
            {
                taskId: "test_timer",
                type: TASK_TYPES.TEST_EXECUTION,
                targetSlot: 1,
                parentStepIndex: 1,
                stepTitle: "Test Timer",
                instruction: "Click TEST to see your timer in action",
                hints: [
                    "Look for the TEST button at the bottom of the coding area",
                ],
                successMessage: "Excellent! Now you can run the whole program.",
            },
            {
                taskId: "run_program",
                type: TASK_TYPES.RUN_PROGRAM,
                targetSlot: 0, // Start from the beginning
                parentStepIndex: 1, // Part of step 2 completion
                stepTitle: "Run Program",
                instruction:
                    "Click the PLAY button to run your complete program",
                hints: ["Look for the Play button in the left panel"],
                successMessage:
                    "Amazing! You've successfully created and run your first program!",
            },
        ],

        runPrompt: {
            showPrompt: true,
            message:
                "Great job setting up your program! Now click PLAY to see what happens.",
            showAfterTask: 9, // Show after test_timer task
            requiredForCompletion: true,
        },
    },
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
    },

    /**
     * Convert old mission format to new flat task structure
     * Utility method for backwards compatibility
     *
     * @param {Object} oldMission - Mission in old nested step/task format
     * @returns {Object} Mission in new flat task format
     */
    convertToFlatTaskStructure: (oldMission) => {
        if (!oldMission || !oldMission.steps) {
            return null;
        }

        // Create new mission object
        const newMission = {
            ...oldMission,
            totalTasks: 0,
            tasks: [],
        };

        // Convert each step and its tasks to flat structure
        oldMission.steps.forEach((step, stepIndex) => {
            // If step has tasks array, convert each task
            if (step.tasks && Array.isArray(step.tasks)) {
                step.tasks.forEach((task) => {
                    // Create new task with parent step reference
                    const newTask = {
                        ...task,
                        parentStepIndex: stepIndex,
                        targetSlot: step.targetSlot || stepIndex,
                        // Map task fields to new format if needed
                    };

                    // Add to flat tasks array
                    newMission.tasks.push(newTask);
                });
            } else {
                // Step doesn't have tasks array, create a task from the step itself
                const newTask = {
                    taskId: `step_${stepIndex}`,
                    type:
                        step.requiredType === "action"
                            ? step.requiredSubtype === "motor"
                                ? TASK_TYPES.MOTOR_CONFIGURATION
                                : TASK_TYPES.SELECT_ACTION_TYPE
                            : step.requiredSubtype === "time"
                            ? TASK_TYPES.TIMER_SETTING
                            : TASK_TYPES.SELECT_INPUT_TYPE,
                    parentStepIndex: stepIndex,
                    targetSlot: step.targetSlot || stepIndex,
                    stepTitle: step.stepTitle,
                    instruction:
                        step.instructions?.instruction ||
                        `Complete step ${stepIndex + 1}`,
                    hints: step.instructions?.hints || [],
                    successMessage: step.instructions?.successMessage,
                    speedRange: step.allowedConfigurations?.speedRange,
                    direction:
                        step.allowedConfigurations?.allowedDirections?.[0],
                    timeRange: step.allowedConfigurations?.timeRange,
                    uiRestrictions: step.uiRestrictions || {},
                };

                // Add to flat tasks array
                newMission.tasks.push(newTask);
            }
        });

        // Update totalTasks
        newMission.totalTasks = newMission.tasks.length;

        return newMission;
    },
};

export default MissionService;
