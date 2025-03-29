/**
 * @file TaskHandlers.js
 * @description Implementation of handlers for different task types in the mission system.
 * Updated to handle introduction phases and implement text-free visual hints.
 */

import { TASK_TYPES, MISSION_PHASES, registerTaskHandler } from "./TaskRegistry";

/**
 * Mission introduction task handler
 * Used for the initial mission overlay
 */
const missionIntroHandler = {
  /**
   * Validate if mission intro can be shown
   * Always valid since this is the starting point
   */
  validate: () => true,
  
  /**
   * Check if mission intro task is completed
   * Based on user clicking through the intro overlay
   */
  isCompleted: (task, state) => {
    const { introDismissed } = state;
    return !!introDismissed;
  },
  
  /**
   * No hint for intro screens - user must proceed manually
   */
  getHint: () => null
};

/**
 * Hardware setup task handler
 * For verifying that required hardware is connected
 */
const hardwareCheckHandler = {
  /**
   * Validate if hardware check can be performed
   */
  validate: (task, state) => {
    const { isConnected } = state;
    return isConnected;
  },
  
  /**
   * Check if hardware requirements are met
   */
  isCompleted: (task, state) => {
    const { requiredDevices = [] } = task;
    const { portStates, isConnected } = state;
    
    // Can't complete without connection
    if (!isConnected) return false;
    
    // If no specific requirements, consider it complete
    if (requiredDevices.length === 0) return true;
    
    // Check each required device
    return requiredDevices.every(requirement => {
      const { deviceType, count = 1 } = requirement;
      
      // Count connected devices of this type
      const connectedCount = Object.values(portStates)
        .filter(port => port && port.deviceType === deviceType)
        .length;
      
      return connectedCount >= count;
    });
  },
  
  /**
   * Visual hint for hardware connection
   */
  getHint: () => ({
    selector: ".bluetooth-menu button",
    animation: "pulse",
    effect: "highlight"
  })
};

/**
 * Initial configuration task handler
 * For setting up the initial slot configurations
 */
const initialConfigHandler = {
  /**
   * Validate if initial configuration can be set
   */
  validate: () => true,
  
  /**
   * Check if initial configuration is complete
   */
  isCompleted: (task, state) => {
    const { configurationApplied } = state;
    return !!configurationApplied;
  },
  
  /**
   * No hint for initial configuration - system applies it automatically
   */
  getHint: () => null
};

/**
 * Hardware connection task handler
 * Validates and checks completion for hardware connection tasks
 */
const hardwareConnectionHandler = {
  /**
   * Validate if the required hardware is connected
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
   */
  isCompleted: (task, state) => {
    return hardwareConnectionHandler.validate(task, state);
  },

  /**
   * Visual hint for hardware connection
   */
  getHint: () => ({
    selector: ".bluetooth-menu button",
    animation: "pulse",
    effect: "highlight"
  })
};

/**
 * Action type selection task handler
 * For tasks requiring the student to select the ACTION button
 */
const selectActionTypeHandler = {
  /**
   * Validate if the ACTION type is selected
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
   */
  isCompleted: (task, state) => {
    return selectActionTypeHandler.validate(task, state);
  },

  /**
   * Visual hint for action type selection
   */
  getHint: () => ({
    selector: ".actionButton button",
    animation: "pulse",
    effect: "highlight"
  })
};

/**
 * Input type selection task handler
 * For tasks requiring the student to select the SENSE button
 */
const selectInputTypeHandler = {
  /**
   * Validate if the SENSE/INPUT type is selected
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
   */
  isCompleted: (task, state) => {
    return selectInputTypeHandler.validate(task, state);
  },

  /**
   * Visual hint for input type selection
   */
  getHint: () => ({
    selector: ".senseButton button",
    animation: "pulse",
    effect: "highlight"
  })
};

/**
 * Subtype selection task handler
 * For tasks requiring selection of a specific control subtype
 */
const selectSubtypeHandler = {
  /**
   * Validate if the required subtype is selected
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
   */
  isCompleted: (task, state) => {
    return selectSubtypeHandler.validate(task, state);
  },

  /**
   * Visual hint for subtype selection - dynamically based on requirements
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
      effect: "highlight"
    };
  }
};

/**
 * Motor configuration task handler
 * For tasks requiring the student to configure a motor
 */
const motorConfigurationHandler = {
  /**
   * Validate if motor configuration meets requirements
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
   */
  isCompleted: (task, state) => {
    return motorConfigurationHandler.validate(task, state);
  },

  /**
   * Visual hint for motor configuration
   */
  getHint: (task) => {
    const { direction } = task;

    if (direction === "forward") {
      return {
        selector: ".forwardBar",
        animation: "pulse",
        effect: "highlight"
      };
    } else if (direction === "backward") {
      return {
        selector: ".backwardBar",
        animation: "pulse",
        effect: "highlight"
      };
    }

    return {
      selector: ".motorDashContainer",
      animation: "pulse",
      effect: "highlight"
    };
  }
};

/**
 * Timer setting task handler
 * For tasks requiring the student to set a timer
 */
const timerSettingHandler = {
  /**
   * Validate if timer setting meets requirements
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
   */
  isCompleted: (task, state) => {
    return timerSettingHandler.validate(task, state);
  },

  /**
   * Visual hint for timer setting
   */
  getHint: () => ({
    selector: ".timeButton",
    animation: "pulse",
    effect: "highlight"
  })
};

/**
 * Button configuration task handler
 * For tasks requiring the student to configure a button
 */
const buttonConfigurationHandler = {
  /**
   * Validate if button configuration meets requirements
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
   */
  isCompleted: (task, state) => {
    return buttonConfigurationHandler.validate(task, state);
  },

  /**
   * Visual hint for button configuration
   */
  getHint: () => ({
    selector: ".buttonStateCircle",
    animation: "pulse",
    effect: "highlight"
  })
};

/**
 * Test execution task handler
 * For tasks requiring the student to test their code
 */
const testExecutionHandler = {
  /**
   * Validate if test execution is possible
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
   * Visual hint for test execution
   */
  getHint: () => ({
    selector: ".testButton",
    animation: "pulse",
    effect: "highlight"
  })
};

/**
 * Navigation task handler
 * For tasks requiring the student to navigate between slots
 */
const navigationHandler = {
  /**
   * Validate if navigation is possible
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
   * Visual hint for navigation
   */
  getHint: (task, state) => {
    const { targetSlot } = task;
    const { currentSlot } = state;

    if (targetSlot > currentSlot) {
      return {
        selector: ".nextButton",
        animation: "pulse",
        effect: "highlight"
      };
    } else {
      return {
        selector: ".prevButton",
        animation: "pulse",
        effect: "highlight"
      };
    }
  }
};

/**
 * Run program task handler
 * For tasks requiring the student to run the full program
 */
const runProgramHandler = {
  /**
   * Validate if running the program is possible
   */
  validate: (task, state) => {
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
   */
  isCompleted: (task, state) => {
    const { eventType } = state;

    return eventType === "RUN_PROGRAM";
  },

  /**
   * Visual hint for running the program
   */
  getHint: () => ({
    selector: ".playButton",
    animation: "pulse",
    effect: "highlight"
  })
};

/**
 * Register all default task handlers with the registry
 */
export function registerDefaultHandlers() {
  // Phase-specific handlers
  registerTaskHandler(TASK_TYPES.MISSION_INTRO, missionIntroHandler);
  registerTaskHandler(TASK_TYPES.HARDWARE_CHECK, hardwareCheckHandler);
  registerTaskHandler(TASK_TYPES.INITIAL_CONFIG, initialConfigHandler);
  
  // Regular task handlers
  registerTaskHandler(TASK_TYPES.HARDWARE_CONNECTION, hardwareConnectionHandler);
  registerTaskHandler(TASK_TYPES.SELECT_ACTION_TYPE, selectActionTypeHandler);
  registerTaskHandler(TASK_TYPES.SELECT_INPUT_TYPE, selectInputTypeHandler);
  registerTaskHandler(TASK_TYPES.SELECT_SUBTYPE, selectSubtypeHandler);
  registerTaskHandler(TASK_TYPES.MOTOR_CONFIGURATION, motorConfigurationHandler);
  registerTaskHandler(TASK_TYPES.TIMER_SETTING, timerSettingHandler);
  registerTaskHandler(TASK_TYPES.BUTTON_CONFIGURATION, buttonConfigurationHandler);
  registerTaskHandler(TASK_TYPES.TEST_EXECUTION, testExecutionHandler);
  registerTaskHandler(TASK_TYPES.NAVIGATION, navigationHandler);
  registerTaskHandler(TASK_TYPES.RUN_PROGRAM, runProgramHandler);
}