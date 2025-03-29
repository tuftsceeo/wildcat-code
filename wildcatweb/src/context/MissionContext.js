/**
 * @file MissionContext.js
 * @description Context provider for managing mission state with flat task structure.
 * Handles mission selection, progression, validation, and task-level tracking
 * for guided learning experiences. Interacts with CustomizationContext for settings.
 */

import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback,
} from "react";
import { useCustomization } from "./CustomizationContext";
import { useBLE } from "../features/bluetooth/context/BLEContext";
import {
    TASK_TYPES,
    validateTask,
    isTaskCompleted as checkTaskCompletion,
    getTaskHint,
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

    // Task tracking - now using flat structure
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [completedTasks, setCompletedTasks] = useState({});

    // UI state for overlays
    const [showMissionOverlay, setShowMissionOverlay] = useState(false);
    const [overlayContent, setOverlayContent] = useState(null);
    const [showTestPrompt, setShowTestPrompt] = useState(false);
    const [showRunPrompt, setShowRunPrompt] = useState(false);

    // Hint system state
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
            const savedMissionProgress =
                localStorage.getItem("missionProgress");
            if (savedMissionProgress) {
                const progress = JSON.parse(savedMissionProgress);

                if (progress.missionId) {
                    // Get mission from available missions
                    MissionService.getMissionById(progress.missionId).then(
                        (mission) => {
                            if (mission) {
                                setCurrentMission(mission);

                                // Restore task index and completion state
                                if (progress.currentTaskIndex !== undefined) {
                                    setCurrentTaskIndex(
                                        progress.currentTaskIndex,
                                    );
                                }

                                if (progress.completedTasks) {
                                    setCompletedTasks(progress.completedTasks);
                                }
                            }
                        },
                    );
                }
            }
        } catch (error) {
            console.error(
                "Error loading mission state from localStorage:",
                error,
            );
        }
    }, []);

    // Load slot configurations from localStorage
    useEffect(() => {
        try {
            const savedConfigurations = localStorage.getItem(
                "missionSlotConfigurations",
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
                error,
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
            currentMission &&
            (currentTaskIndex > 0 || Object.keys(completedTasks).length > 0)
        ) {
            try {
                localStorage.setItem(
                    "missionProgress",
                    JSON.stringify({
                        missionId: currentMission.missionId,
                        currentTaskIndex,
                        completedTasks,
                    }),
                );
            } catch (error) {
                console.error(
                    "Error saving mission progress to localStorage:",
                    error,
                );
            }
        }
    }, [currentMission, currentTaskIndex, completedTasks]);

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
                    }),
                );
            } catch (error) {
                console.error(
                    "Error saving slot configurations to localStorage:",
                    error,
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
        if (
            isMissionMode &&
            currentMission &&
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
    }, [isMissionMode, currentMission, currentTaskIndex, completedTasks]);

    /**
     * Start a mission by ID
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
                    setIsMissionMode(true);

                    // Reset completion state
                    setCompletedTasks({});

                    // Reset slot configurations
                    setSlotConfigurations({});

                    // Show mission intro overlay
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
                            currentTaskIndex: 0,
                            completedTasks: {},
                        }),
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
        [setStepCount],
    );

    /**
     * Exit the current mission and return to sandbox mode
     */
    const exitMission = useCallback(() => {
        setIsMissionMode(false);
        setCurrentMission(null);
        setCurrentTaskIndex(0);
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
                error,
            );
        }
    }, []);

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

            // If this is a subpart of a step, check if the entire step is complete
            const currentTask = currentMission.tasks[taskIndex];
            if (currentTask && currentTask.parentStepIndex !== undefined) {
                // Find all tasks for this parent step
                const siblingTasks = currentMission.tasks.filter(
                    (task) =>
                        task.parentStepIndex === currentTask.parentStepIndex,
                );

                // Check if all sibling tasks are completed
                const allSiblingsComplete = siblingTasks.every((task) => {
                    const siblingIndex = currentMission.tasks.indexOf(task);
                    return (
                        completedTasks[siblingIndex] ||
                        siblingIndex === taskIndex
                    ); // Include current task
                });

                // If all siblings are complete, show success message
                if (allSiblingsComplete) {
                    // Transition to next step overlay
                    setOverlayContent({
                        type: "success",
                        title: "Great Job!",
                        message:
                            currentTask.successMessage ||
                            "You've completed this step successfully!",
                    });
                    setShowMissionOverlay(true);
                }
            }

            // If not the last task, move to next task
            if (
                taskIndex === currentTaskIndex &&
                taskIndex < currentMission.tasks.length - 1
            ) {
                // Auto-advance to next task
                setCurrentTaskIndex(taskIndex + 1);

                // Reset active hint when moving to a new task
                setActiveHint(null);
            } else if (taskIndex === currentMission.tasks.length - 1) {
                // This was the last task, show mission complete overlay
                setOverlayContent({
                    type: "complete",
                    title: "Mission Complete!",
                    message:
                        "You've successfully completed all the tasks in this mission!",
                    image: currentMission.assets?.completeImage,
                });
                setShowMissionOverlay(true);
            }
        },
        [currentMission, currentTaskIndex, completedTasks],
    );

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
        [currentMission, completedTasks, completeTask],
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
                    }, 30000),
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
                    stateSnapshot,
                )
            ) {
                completeTask(currentTaskIndex, eventData);
            }
        },
        [
            isMissionMode,
            currentMission,
            currentTaskIndex,
            portStates,
            isConnected,
            inactivityTimer,
            activeHint,
            completeTask,
        ],
    );

    /**
     * Get hint for current task
     */
    const showHintForCurrentTask = useCallback(() => {
        if (!isMissionMode || !currentMission) return;

        // Get current task
        const currentTask = currentMission.tasks[currentTaskIndex];
        if (!currentTask) return;

        // Create state snapshot for hint generation
        const stateSnapshot = {
            portStates,
            isConnected,
            currentTask,
        };

        // Get hint from task handler
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
        [completedTasks],
    );

    /**
     * Move to the next task
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

        return currentMission.tasks[currentTaskIndex] || null;
    }, [isMissionMode, currentMission, currentTaskIndex]);

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

            const currentTask = getCurrentTask();
            if (!currentTask) return true;

            const { uiRestrictions } = currentTask;
            if (!uiRestrictions) return true;

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

            // Default to visible
            return true;
        },
        [isMissionMode, currentMission, getCurrentTask],
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

            const currentTask = getCurrentTask();
            if (!currentTask) return true;

            const { uiRestrictions } = currentTask;
            if (!uiRestrictions) return true;

            // Check if component is in disabled list
            if (uiRestrictions.disabledComponents?.length > 0) {
                return !uiRestrictions.disabledComponents.includes(componentId);
            }

            // For subtype options
            if (componentId.startsWith("subtype-") && options.type) {
                const subtypeName = componentId.replace("subtype-", "");
                if (
                    uiRestrictions.disableSubtypeOptions?.includes(subtypeName)
                ) {
                    return false;
                }
            }

            // Default to enabled
            return true;
        },
        [isMissionMode, currentMission, getCurrentTask],
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
        [isMissionMode, currentMission, getCurrentTask],
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
        [isMissionMode, currentMission, getCurrentTask],
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
                stateSnapshot,
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
            getCurrentTask,
            portStates,
            isConnected,
        ],
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

        // Check for hardware connection tasks
        const hardwareTasks = currentMission.tasks.filter(
            (task) => task.type === TASK_TYPES.HARDWARE_CONNECTION,
        );

        // Check each hardware requirement
        hardwareTasks.forEach((task) => {
            const { deviceType, count = 1 } = task;

            // Count connected devices of this type
            const connectedCount = Object.values(portStates).filter(
                (port) => port && port.deviceType === deviceType,
            ).length;

            // Add to missing hardware if not enough connected
            if (connectedCount < count) {
                if (deviceType === 0x30) {
                    // Motor
                    missingHardware.push("motor");
                } else if (deviceType === 0x3c) {
                    // Button/Force sensor
                    missingHardware.push("button");
                } else {
                    missingHardware.push(`Unknown device type: ${deviceType}`);
                }
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
        return currentMission.tasks.every((_, index) => completedTasks[index]);
    }, [isMissionMode, currentMission, completedTasks]);

    /**
     * Clear all mission progress
     * Used for resetting missions
     */
    const clearAllProgress = useCallback(() => {
        setCurrentTaskIndex(0);
        setCompletedTasks({});
        setSlotConfigurations({});

        // Clear from localStorage
        try {
            localStorage.removeItem("missionProgress");
            localStorage.removeItem("missionTaskProgress");
            localStorage.removeItem("missionSlotConfigurations");
        } catch (error) {
            console.error("Error clearing mission progress:", error);
        }
    }, []);

    // Provide context values
    const contextValue = {
        // Mission mode state
        isMissionMode,
        setIsMissionMode,

        // Mission data
        availableMissions,
        currentMission,

        // Task tracking
        currentTaskIndex,
        completedTasks,
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
        clearAllProgress,

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
