/**
 * @file MissionState.js
 * @description Reducer and state management for the mission system
 */

// Define action types for the mission reducer
export const MISSION_ACTIONS = {
  START_MISSION: 'mission/startMission',
  EXIT_MISSION: 'mission/exitMission',
  COMPLETE_INTRO: 'mission/completeIntro',
  SET_DETECTED_PORT: 'mission/setDetectedPort',
  APPLY_CONFIGURATION: 'mission/applyConfiguration',
  SET_CURRENT_SLOT: 'mission/setCurrentSlot',
  DISPATCH_TASK_EVENT: 'mission/dispatchTaskEvent',
  COMPLETE_TASK: 'mission/completeTask',
  SET_SHOW_TEST_PROMPT: 'mission/setShowTestPrompt',
  SET_SHOW_RUN_PROMPT: 'mission/setShowRunPrompt',
  SET_SHOW_CELEBRATION: 'mission/setShowCelebration',
  SET_DETECTED_DEVICES: 'mission/setDetectedDevices'
};

/**
 * Create the initial mission state
 * @returns {Object} Initial mission state
 */
export function createInitialMissionState() {
  return {
    // Mission mode state
    isMissionMode: false,
    currentMission: null,
    
    // Phase tracking
    showMissionOverlay: false,
    introCompleted: false,
    
    // Hardware detection
    detectedMotorPort: null,
    detectedDevicesByType: {},
    
    // Slot state
    currSlotNumber: 0,
    slotConfigurations: {},
    
    // UI state
    showTestPrompt: false,
    showRunPrompt: false,
    activeHint: null,
    showCelebration: false
  };
}

/**
 * Reducer for mission state
 * @param {Object} state - Current state
 * @param {Object} action - Action object
 * @returns {Object} New state
 */
export function missionReducer(state, action) {
  switch (action.type) {
    case MISSION_ACTIONS.START_MISSION:
      return {
        ...state,
        isMissionMode: true,
        currentMission: action.payload.mission,
        showMissionOverlay: true,
        introCompleted: false,
        detectedMotorPort: null,
        detectedDevicesByType: {},
        slotConfigurations: {},
        currSlotNumber: 0,
        showTestPrompt: false,
        showRunPrompt: false,
        activeHint: null,
        showCelebration: false
      };
      
    case MISSION_ACTIONS.EXIT_MISSION:
      return {
        ...state,
        isMissionMode: false,
        currentMission: null,
        showMissionOverlay: false,
        introCompleted: false,
        detectedMotorPort: null,
        detectedDevicesByType: {},
        slotConfigurations: {},
        showTestPrompt: false,
        showRunPrompt: false,
        activeHint: null,
        showCelebration: false
      };
      
    case MISSION_ACTIONS.COMPLETE_INTRO:
      return {
        ...state,
        showMissionOverlay: false,
        introCompleted: true
      };
      
    case MISSION_ACTIONS.SET_DETECTED_PORT:
      return {
        ...state,
        detectedMotorPort: action.payload.port
      };
      
    case MISSION_ACTIONS.APPLY_CONFIGURATION:
      return {
        ...state,
        slotConfigurations: {
          ...state.slotConfigurations,
          ...action.payload.configurations
        }
      };
      
    case MISSION_ACTIONS.SET_CURRENT_SLOT:
      return {
        ...state,
        currSlotNumber: action.payload.slotNumber
      };
      
    case MISSION_ACTIONS.SET_SHOW_TEST_PROMPT:
      return {
        ...state,
        showTestPrompt: action.payload.show
      };
      
    case MISSION_ACTIONS.SET_SHOW_RUN_PROMPT:
      return {
        ...state,
        showRunPrompt: action.payload.show
      };
      
    case MISSION_ACTIONS.SET_SHOW_CELEBRATION:
      return {
        ...state,
        showCelebration: action.payload.show
      };
      
    case MISSION_ACTIONS.SET_DETECTED_DEVICES:
      return {
        ...state,
        detectedDevicesByType: action.payload.devices
      };
      
    default:
      return state;
  }
}

/**
 * Action creator to start a mission
 * @param {Object} mission - Mission to start
 * @returns {Object} Action object
 */
export function startMission(mission) {
  return {
    type: MISSION_ACTIONS.START_MISSION,
    payload: { mission }
  };
}

/**
 * Action creator to exit a mission
 * @returns {Object} Action object
 */
export function exitMission() {
  return {
    type: MISSION_ACTIONS.EXIT_MISSION
  };
}

/**
 * Action creator to mark the introduction as completed
 * @returns {Object} Action object
 */
export function completeIntro() {
  return {
    type: MISSION_ACTIONS.COMPLETE_INTRO
  };
}

/**
 * Action creator to set the detected motor port
 * @param {string} port - Port letter (A-F)
 * @returns {Object} Action object
 */
export function setDetectedPort(port) {
  return {
    type: MISSION_ACTIONS.SET_DETECTED_PORT,
    payload: { port }
  };
}

/**
 * Action creator to apply slot configurations
 * @param {Object} configurations - Map of slot configurations
 * @returns {Object} Action object
 */
export function applyConfigurations(configurations) {
  return {
    type: MISSION_ACTIONS.APPLY_CONFIGURATION,
    payload: { configurations }
  };
}

/**
 * Action creator to set the current slot number
 * @param {number} slotNumber - Slot number
 * @returns {Object} Action object
 */
export function setCurrentSlot(slotNumber) {
  return {
    type: MISSION_ACTIONS.SET_CURRENT_SLOT,
    payload: { slotNumber }
  };
}

/**
 * Action creator to set the show test prompt flag
 * @param {boolean} show - Whether to show the prompt
 * @returns {Object} Action object
 */
export function setShowTestPrompt(show) {
  return {
    type: MISSION_ACTIONS.SET_SHOW_TEST_PROMPT,
    payload: { show }
  };
}

/**
 * Action creator to set the show run prompt flag
 * @param {boolean} show - Whether to show the prompt
 * @returns {Object} Action object
 */
export function setShowRunPrompt(show) {
  return {
    type: MISSION_ACTIONS.SET_SHOW_RUN_PROMPT,
    payload: { show }
  };
}

/**
 * Action creator to set the show celebration flag
 * @param {boolean} show - Whether to show the celebration
 * @returns {Object} Action object
 */
export function setShowCelebration(show) {
  return {
    type: MISSION_ACTIONS.SET_SHOW_CELEBRATION,
    payload: { show }
  };
}

/**
 * Action creator to set detected devices by type
 * @param {Object} devices - Map of device types to port arrays
 * @returns {Object} Action object
 */
export function setDetectedDevices(devices) {
  return {
    type: MISSION_ACTIONS.SET_DETECTED_DEVICES,
    payload: { devices }
  };
}
