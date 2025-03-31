/**
 * @file index.js
 * @description Barrel file for exporting all mission services and utilities
 */

// Mission context providers
export { default as MissionContext, MissionProvider, useMission } from './MissionContext';

// Mission state management
export {
  missionReducer,
  createInitialMissionState,
  MISSION_ACTIONS,
  startMission,
  exitMission,
  completeIntro,
  setDetectedPort,
  applyConfigurations,
  setCurrentSlot,
  setShowTestPrompt,
  setShowRunPrompt
} from './MissionState';

// Mission services
export { default as MissionService } from './MissionService';
export { default as TaskService } from './TaskService';
export { default as MissionUI } from './MissionUI';

// Task models
export * from '../models';

// Hint system
export { default as HintSystem, HintManager, applyVisualHint, HintDebugger } from './HintSystem';
