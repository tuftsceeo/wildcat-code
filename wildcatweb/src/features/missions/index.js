/**
 * @file index.js
 * @description Main entry point for the missions module
 * Provides a unified API for accessing all mission-related functionality
 */

// Re-export mission context and hooks
export { 
  default as MissionContext, 
  MissionProvider, 
  useMission 
} from './services/MissionContext';

// Core services
export { default as MissionService } from './services/MissionService';
export { default as TaskService } from './services/TaskService';

// Task models and factory
export { 
  Task,
  TaskFactory, 
  TASK_TYPES,
  logTaskEvent
} from './models';

// Components
export { default as HintSystem } from './components/HintSystem';
export { default as MissionOverlay } from './components/MissionOverlay';
export { default as MissionSelector } from './components/MissionSelector';
export { default as TaskInstructionPanel } from './components/TaskInstructionPanel';

// State management utilities - for advanced usage
export {
  missionReducer,
  createInitialMissionState,
  MISSION_ACTIONS
} from './services/MissionState';

// UI utilities - for advanced usage
export { default as MissionUI } from './services/MissionUI';
