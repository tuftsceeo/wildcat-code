/**
 * @file TaskHandlers.js
 * @description Implementation of handlers for different task types in the mission system.
 * Each handler provides validation, completion checking, and hint generation.
 * @author Implementation based on design documents
 * @created April 2025
 */

import { TASK_TYPES, registerTaskHandler } from "./TaskRegistry";

/**
 * Hardware connection task handler
 * Validates and checks completion for hardware connection tasks
 */
const hardwareConnectionHandler = {
    /**
     * Validate if the required hardware is connected
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether hardware requirements are met
     */
    validate: (task, state) => {
        const { deviceType, count = 1 } = task;
        const { portStates } = state;

        if (!portStates) {
            return false;
        }

        // Count connected devices of the specified type
        const connectedCount = Object.values(portStates).filter(
            (port) => port && port.deviceType === deviceType,
        ).length;

        // Check if we have the required number of devices
        return connectedCount >= count;
    },

    /**
     * Check if the hardware connection task is completed
     * Same logic as validate for this task type
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether the task is completed
     */
    isCompleted: (task, state) => {
        return hardwareConnectionHandler.validate(task, state);
    },

    /**
     * Get hint for hardware connection task
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {Object} Hint object with selector and animation
     */
    getHint: (task, state) => {
        const { deviceType } = task;

        // Different hints based on device type
        if (deviceType === 0x30) {
            // Motor
            return {
                selector: ".bluetooth-menu button",
                animation: "pulse",
                message: "Connect a motor to your robot",
            };
        } else if (deviceType === 0x3c) {
            // Button/Force sensor
            return {
                selector: ".bluetooth-menu button",
                animation: "pulse",
                message: "Connect a button to your robot",
            };
        }

        return null;
    },
};

/**
 * Action type selection task handler
 * For tasks requiring the student to select the ACTION button
 */
const selectActionTypeHandler = {
    /**
     * Validate if the ACTION type is selected
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether ACTION is selected
     */
    validate: (task, state) => {
        const { currentConfiguration } = state;

        if (!currentConfiguration) {
            return false;
        }

        return currentConfiguration.type === "action";
    },

    /**
     * Check if action type selection task is completed
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether ACTION is selected
     */
    isCompleted: (task, state) => {
        return selectActionTypeHandler.validate(task, state);
    },

    /**
     * Get hint for action type selection
     *
     * @returns {Object} Hint object with selector and animation
     */
    getHint: () => {
        return {
            selector: ".actionButton button",
            animation: "pulse",
            message: "Click the ACTION button",
        };
    },
};

/**
 * Input type selection task handler
 * For tasks requiring the student to select the SENSE button
 */
const selectInputTypeHandler = {
    /**
     * Validate if the SENSE/INPUT type is selected
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether SENSE/INPUT is selected
     */
    validate: (task, state) => {
        const { currentConfiguration } = state;

        if (!currentConfiguration) {
            return false;
        }

        return currentConfiguration.type === "input";
    },

    /**
     * Check if input type selection task is completed
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether SENSE/INPUT is selected
     */
    isCompleted: (task, state) => {
        return selectInputTypeHandler.validate(task, state);
    },

    /**
     * Get hint for input type selection
     *
     * @returns {Object} Hint object with selector and animation
     */
    getHint: () => {
        return {
            selector: ".senseButton button",
            animation: "pulse",
            message: "Click the SENSE button",
        };
    },
};

/**
 * Subtype selection task handler
 * For tasks requiring selection of a specific control subtype
 */
const selectSubtypeHandler = {
    /**
     * Validate if the required subtype is selected
     *
     * @param {Object} task - Task configuration with required type and subtype
     * @param {Object} state - Current application state
     * @returns {boolean} Whether the correct subtype is selected
     */
    validate: (task, state) => {
        const { requiredType, requiredSubtype } = task;
        const { currentConfiguration } = state;

        if (!currentConfiguration) {
            return false;
        }

        return (
            currentConfiguration.type === requiredType &&
            currentConfiguration.subtype === requiredSubtype
        );
    },

    /**
     * Check if subtype selection task is completed
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether the correct subtype is selected
     */
    isCompleted: (task, state) => {
        return selectSubtypeHandler.validate(task, state);
    },

    /**
     * Get hint for subtype selection
     *
     * @param {Object} task - Task configuration
     * @returns {Object} Hint object with selector and animation
     */
    getHint: (task) => {
        const { requiredType, requiredSubtype } = task;

        // Generate selector based on required type and subtype
        let selector = "";

        if (requiredType === "action") {
            if (requiredSubtype === "motor") {
                selector = '.subtypeButton[aria-label="Select Speed"]';
            }
        } else if (requiredType === "input") {
            if (requiredSubtype === "time") {
                selector = '.subtypeButton[aria-label="Select Wait"]';
            } else if (requiredSubtype === "button") {
                selector = '.subtypeButton[aria-label="Select Button"]';
            }
        }

        return {
            selector,
            animation: "pulse",
            message: `Select the ${requiredSubtype} option`,
        };
    },
};

/**
 * Motor configuration task handler
 * For tasks requiring the student to configure a motor
 */
const motorConfigurationHandler = {
    /**
     * Validate if motor configuration meets requirements
     *
     * @param {Object} task - Task configuration with speedRange and direction
     * @param {Object} state - Current application state
     * @returns {boolean} Whether configuration is valid
     */
    validate: (task, state) => {
        const { speedRange, direction } = task;
        const { currentConfiguration } = state;

        if (
            !currentConfiguration ||
            currentConfiguration.type !== "action" ||
            currentConfiguration.subtype !== "motor"
        ) {
            return false;
        }

        const config = currentConfiguration.configuration;
        if (!config) return false;

        const motorConfigs = Array.isArray(config) ? config : [config];

        // Check each motor configuration
        return motorConfigs.every((motorConfig) => {
            const speed = motorConfig.speed || 0;

            // Check speed range if specified
            if (speedRange) {
                const [min, max] = speedRange;
                const absSpeed = Math.abs(speed);
                if (absSpeed < min || absSpeed > max) {
                    return false;
                }
            }

            // Check direction if specified
            if (direction) {
                const currentDirection = speed >= 0 ? "forward" : "backward";
                if (direction !== currentDirection) {
                    return false;
                }
            }

            return true;
        });
    },

    /**
     * Check if motor configuration task is completed
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether motor is properly configured
     */
    isCompleted: (task, state) => {
        return motorConfigurationHandler.validate(task, state);
    },

    /**
     * Get hint for motor configuration
     *
     * @param {Object} task - Task configuration
     * @returns {Object} Hint object with selector and animation
     */
    getHint: (task) => {
        const { direction } = task;

        if (direction === "forward") {
            return {
                selector: ".forwardBar",
                animation: "pulse",
                message: "Set the motor to move forward",
            };
        } else if (direction === "backward") {
            return {
                selector: ".backwardBar",
                animation: "pulse",
                message: "Set the motor to move backward",
            };
        }

        return {
            selector: ".motorDashContainer",
            animation: "pulse",
            message: "Configure the motor speed",
        };
    },
};

/**
 * Timer setting task handler
 * For tasks requiring the student to set a timer
 */
const timerSettingHandler = {
    /**
     * Validate if timer setting meets requirements
     *
     * @param {Object} task - Task configuration with timeRange
     * @param {Object} state - Current application state
     * @returns {boolean} Whether timer is correctly set
     */
    validate: (task, state) => {
        const { timeRange, exactValue } = task;
        const { currentConfiguration } = state;

        if (
            !currentConfiguration ||
            currentConfiguration.type !== "input" ||
            currentConfiguration.subtype !== "time"
        ) {
            return false;
        }

        const config = currentConfiguration.configuration;
        if (!config) return false;

        const seconds = config.seconds || 0;

        // Check for exact value
        if (exactValue !== undefined) {
            return seconds === exactValue;
        }

        // Check time range if specified
        if (timeRange) {
            const [min, max] = timeRange;
            return seconds >= min && seconds <= max;
        }

        // Any non-zero value is valid if no constraints
        return seconds > 0;
    },

    /**
     * Check if timer setting task is completed
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether timer is correctly set
     */
    isCompleted: (task, state) => {
        return timerSettingHandler.validate(task, state);
    },

    /**
     * Get hint for timer setting
     *
     * @returns {Object} Hint object with selector and animation
     */
    getHint: () => {
        return {
            selector: ".timeButton",
            animation: "pulse",
            message: "Set the timer duration",
        };
    },
};

/**
 * Button configuration task handler
 * For tasks requiring the student to configure a button
 */
const buttonConfigurationHandler = {
    /**
     * Validate if button configuration meets requirements
     *
     * @param {Object} task - Task configuration with buttonState
     * @param {Object} state - Current application state
     * @returns {boolean} Whether button is correctly configured
     */
    validate: (task, state) => {
        const { buttonState } = task;
        const { currentConfiguration } = state;

        if (
            !currentConfiguration ||
            currentConfiguration.type !== "input" ||
            currentConfiguration.subtype !== "button"
        ) {
            return false;
        }

        const config = currentConfiguration.configuration;
        if (!config) return false;

        // Check button state if specified
        if (buttonState) {
            return config.state === buttonState;
        }

        // Any valid configuration is acceptable if no specific requirements
        return true;
    },

    /**
     * Check if button configuration task is completed
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether button is correctly configured
     */
    isCompleted: (task, state) => {
        return buttonConfigurationHandler.validate(task, state);
    },

    /**
     * Get hint for button configuration
     *
     * @returns {Object} Hint object with selector and animation
     */
    getHint: () => {
        return {
            selector: ".buttonStateCircle",
            animation: "pulse",
            message: "Configure the button state",
        };
    },
};

/**
 * Test execution task handler
 * For tasks requiring the student to test their code
 */
const testExecutionHandler = {
    /**
     * Validate if test execution is possible
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether test can be executed
     */
    validate: (task, state) => {
        const { targetSlot } = task;
        const { currentSlot, isConnected } = state;

        // Can't test without Bluetooth connection
        if (!isConnected) {
            return false;
        }

        // Check if we're on the right slot
        if (targetSlot !== undefined && currentSlot !== targetSlot) {
            return false;
        }

        return true;
    },

    /**
     * Check if test execution task is completed
     * Based on the TEST_EXECUTED event
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether test was executed
     */
    isCompleted: (task, state) => {
        const { targetSlot } = task;
        const { eventType, eventData } = state;

        if (eventType !== "TEST_EXECUTED") {
            return false;
        }

        // Check if test was executed on the target slot
        if (targetSlot !== undefined && eventData.slotIndex !== targetSlot) {
            return false;
        }

        return true;
    },

    /**
     * Get hint for test execution
     *
     * @returns {Object} Hint object with selector and animation
     */
    getHint: () => {
        return {
            selector: ".testButton",
            animation: "pulse",
            message: "Click the Test button",
        };
    },
};

/**
 * Navigation task handler
 * For tasks requiring the student to navigate between slots
 */
const navigationHandler = {
    /**
     * Validate if navigation is possible
     *
     * @param {Object} task - Task configuration with targetSlot
     * @param {Object} state - Current application state
     * @returns {boolean} Whether navigation is possible
     */
    validate: (task, state) => {
        const { targetSlot } = task;
        const { currentSlot } = state;

        // Already on target slot
        if (currentSlot === targetSlot) {
            return false;
        }

        return true;
    },

    /**
     * Check if navigation task is completed
     * Based on the NAVIGATION event or current slot
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether navigation occurred
     */
    isCompleted: (task, state) => {
        const { targetSlot } = task;
        const { eventType, eventData, currentSlot } = state;

        // Check if we're already on the target slot
        if (currentSlot === targetSlot) {
            return true;
        }

        // Check if navigation event happened and matches target
        if (eventType === "NAVIGATION" && eventData.toSlot === targetSlot) {
            return true;
        }

        return false;
    },

    /**
     * Get hint for navigation
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {Object} Hint object with selector and animation
     */
    getHint: (task, state) => {
        const { targetSlot } = task;
        const { currentSlot } = state;

        if (targetSlot > currentSlot) {
            return {
                selector: ".nextButton",
                animation: "pulse",
                message: "Click the down arrow to go to the next step",
            };
        } else {
            return {
                selector: ".prevButton",
                animation: "pulse",
                message: "Click the up arrow to go to the previous step",
            };
        }
    },
};

/**
 * Run program task handler
 * For tasks requiring the student to run the full program
 */
const runProgramHandler = {
    /**
     * Validate if running the program is possible
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether program can be run
     */
    validate: (task, state) => {
        const { requiredSlotCount } = task;
        const { isConnected } = state;

        // Can't run without Bluetooth connection
        if (!isConnected) {
            return false;
        }

        return true;
    },

    /**
     * Check if run program task is completed
     * Based on the RUN_PROGRAM event
     *
     * @param {Object} task - Task configuration
     * @param {Object} state - Current application state
     * @returns {boolean} Whether program was run
     */
    isCompleted: (task, state) => {
        const { eventType } = state;

        return eventType === "RUN_PROGRAM";
    },

    /**
     * Get hint for running the program
     *
     * @returns {Object} Hint object with selector and animation
     */
    getHint: () => {
        return {
            selector: ".playButton",
            animation: "pulse",
            message: "Click the Play button to run your program",
        };
    },
};

/**
 * Register all default task handlers with the registry
 */
export function registerDefaultHandlers() {
    registerTaskHandler(
        TASK_TYPES.HARDWARE_CONNECTION,
        hardwareConnectionHandler,
    );
    registerTaskHandler(TASK_TYPES.SELECT_ACTION_TYPE, selectActionTypeHandler);
    registerTaskHandler(TASK_TYPES.SELECT_INPUT_TYPE, selectInputTypeHandler);
    registerTaskHandler(TASK_TYPES.SELECT_SUBTYPE, selectSubtypeHandler);
    registerTaskHandler(
        TASK_TYPES.MOTOR_CONFIGURATION,
        motorConfigurationHandler,
    );
    registerTaskHandler(TASK_TYPES.TIMER_SETTING, timerSettingHandler);
    registerTaskHandler(
        TASK_TYPES.BUTTON_CONFIGURATION,
        buttonConfigurationHandler,
    );
    registerTaskHandler(TASK_TYPES.TEST_EXECUTION, testExecutionHandler);
    registerTaskHandler(TASK_TYPES.NAVIGATION, navigationHandler);
    registerTaskHandler(TASK_TYPES.RUN_PROGRAM, runProgramHandler);
}
