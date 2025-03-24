/**
 * @file MissionContext.js
 * @description Context provider for managing mission state in the WildCat application.
 * Handles mission selection, progression, validation, and task-level tracking
 * for guided learning experiences. Interacts with CustomizationContext for settings.
 */
// /* 
// import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// import { useCustomization } from './CustomizationContext';
// import { useBLE } from '../features/bluetooth/context/BLEContext';

// // Example mission structure (in real implementation, this would be loaded from files)
// const SAMPLE_MISSIONS = [
//   {
//     missionId: "mission1",
//     title: "First Steps with Motors",
//     description: "Learn to control a motor and add a wait step",
//     difficultyLevel: "beginner",
//     totalMissionSteps: 2,
//     steps: [
//       {
//         stepNumber: 1,
//         stepTitle: "Add a Motor",
//         stepDescription: "Make your motor spin forward",
//         requiredType: "action",
//         requiredSubtype: "motor",
//         testPrompt: {
//           showPrompt: true,
//           message: "Try testing your motor! Click the Test button.",
//           requiredForProgress: false
//         },
//         allowedConfigurations: {
//           allowMultipleMotors: false,
//           requiredMotorCount: 1,
//           speedRange: [300, 1000],
//           allowedDirections: ["forward"]
//         },
//         uiRestrictions: {
//           hideTypeSelection: true,
//           hideSubtypeSelection: true,
//           prefilledValues: {
//             speed: 500
//           }
//         },
//         instructions: {
//           instruction: "Connect your motor to port A and make it spin forward.",
//           hints: [
//             "Click on the motor in the dashboard",
//             "Drag the speed slider to the right"
//           ],
//           successMessage: "Great job! Your motor is spinning forward."
//         },
//         // Task-level definitions - new structure for granular guidance
//         tasks: [
//           {
//             taskType: "motor_speed",
//             instruction: "Connect your motor and make it spin forward",
//             stepTitle: "Set Motor Speed",
//             hints: ["Click on the motor speed bar to set a forward speed"]
//           },
//           {
//             taskType: "test_button",
//             instruction: "Test your motor by clicking the Test button",
//             stepTitle: "Test Motor",
//             hints: ["Click the Test button at the bottom of the screen"]
//           }
//         ]
//       },
//       {
//         stepNumber: 2,
//         stepTitle: "Add a Wait Step",
//         stepDescription: "Make your program wait for 3 seconds",
//         requiredType: "input",
//         requiredSubtype: "time",
//         allowedConfigurations: {
//           timeRange: [2, 5]
//         },
//         uiRestrictions: {
//           hideTypeSelection: false,
//           hideSubtypeSelection: false,
//           prefilledValues: {
//             seconds: 3
//           }
//         },
//         instructions: {
//           instruction: "Now add a wait step to make your program pause.",
//           hints: [
//             "Click on SENSE",
//             "Select the Wait option",
//             "Set the time to 3 seconds"
//           ]
//         },
//         // Task-level definitions - new structure for granular guidance
//         tasks: [
//           {
//             taskType: "navigation",
//             instruction: "Click the Next button to move to the second step",
//             stepTitle: "Go to Step 2",
//             hints: ["Click the downward arrow at the bottom of the screen"]
//           },
//           {
//             taskType: "select_input_type",
//             instruction: "Click on SENSE to select input options",
//             stepTitle: "Select SENSE",
//             hints: ["Click the SENSE button at the top of the panel"]
//           },
//           {
//             taskType: "select_timer",
//             instruction: "Select the Wait option",
//             stepTitle: "Select Wait",
//             hints: ["Click on the Wait button in the right panel"]
//           },
//           {
//             taskType: "timer_value",
//             instruction: "Set the timer to 3 seconds",
//             stepTitle: "Set Timer",
//             hints: ["Use the + button to increase the timer value to 3"]
//           }
//         ]
//       }
//     ],
//     runPrompt: {
//       showPrompt: true,
//       message: "Great job setting up your program! Now click Run to see what happens.",
//       showAfterStep: 2,
//       requiredForCompletion: true
//     }
//   }
// ];

// // Create context
// const MissionContext = createContext();

// /**
//  * Provider component for mission management
//  * 
//  * @component
//  * @param {Object} props - Component props
//  * @param {React.ReactNode} props.children - Child components
//  * @returns {JSX.Element} Context provider
//  */
// export const MissionProvider = ({ children }) => {
//   // State for mission mode
//   const [isMissionMode, setIsMissionMode] = useState(false);
  
//   // State for available and current missions
//   const [availableMissions, setAvailableMissions] = useState(SAMPLE_MISSIONS);
//   const [currentMission, setCurrentMission] = useState(null);
  
//   // State for mission progress
//   const [currentStepIndex, setCurrentStepIndex] = useState(0);
//   const [missionProgress, setMissionProgress] = useState({});
  
//   // State for overlays and prompts
//   const [showMissionOverlay, setShowMissionOverlay] = useState(false);
//   const [overlayContent, setOverlayContent] = useState(null);
//   const [showTestPrompt, setShowTestPrompt] = useState(false);
//   const [showRunPrompt, setShowRunPrompt] = useState(false);
  
//   // Task-level state tracking - new additions
//   const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
//   const [taskProgress, setTaskProgress] = useState({});
//   const [showHint, setShowHint] = useState(false);
  
//   // Access other contexts
//   const { setStepCount } = useCustomization();
//   const { isConnected, portStates } = useBLE();

//   // Load mission mode preference from localStorage on mount
//   useEffect(() => {
//     try {
//       const savedMissionMode = localStorage.getItem("missionMode");
//       if (savedMissionMode) {
//         setIsMissionMode(JSON.parse(savedMissionMode));
//       }
      
//       // Load active mission if in mission mode
//       const savedMissionProgress = localStorage.getItem("missionProgress");
//       if (savedMissionProgress) {
//         const progress = JSON.parse(savedMissionProgress);
//         setMissionProgress(progress);
        
//         if (progress.activeMissionId) {
//           const mission = SAMPLE_MISSIONS.find(m => m.missionId === progress.activeMissionId);
//           if (mission) {
//             setCurrentMission(mission);
//             setCurrentStepIndex(progress.currentStepIndex || 0);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error loading mission state from localStorage:", error);
//     }
//   }, []);

//   // Load task progress from localStorage
//   useEffect(() => {
//     try {
//       const savedTaskProgress = localStorage.getItem("missionTaskProgress");
//       if (savedTaskProgress && currentMission) {
//         const parsed = JSON.parse(savedTaskProgress);
        
//         // Only restore if for the current mission
//         if (parsed.missionId === currentMission.missionId) {
//           setTaskProgress(parsed.taskProgress || {});
//           setCurrentTaskIndex(parsed.currentTaskIndex || 0);
//         }
//       }
//     } catch (error) {
//       console.error("Error loading task progress from localStorage:", error);
//     }
//   }, [currentMission]);

//   // Save mission mode preference when it changes
//   useEffect(() => {
//     try {
//       localStorage.setItem("missionMode", JSON.stringify(isMissionMode));
//     } catch (error) {
//       console.error("Error saving mission mode to localStorage:", error);
//     }
//   }, [isMissionMode]);

//   // Update step count in CustomizationContext when mission changes
//   useEffect(() => {
//     if (isMissionMode && currentMission) {
//       // Add 1 for the stop step that's automatically added
//       const totalSteps = currentMission.totalMissionSteps + 1;
//       setStepCount(totalSteps);
//     }
//   }, [isMissionMode, currentMission, setStepCount]);

//   // Save mission progress when it changes
//   useEffect(() => {
//     if (currentMission && Object.keys(missionProgress).length > 0) {
//       try {
//         localStorage.setItem("missionProgress", JSON.stringify(missionProgress));
//       } catch (error) {
//         console.error("Error saving mission progress to localStorage:", error);
//       }
//     }
//   }, [currentMission, missionProgress]);

//   // Save task progress to localStorage
//   useEffect(() => {
//     if (isMissionMode && currentMission && Object.keys(taskProgress).length > 0) {
//       try {
//         localStorage.setItem("missionTaskProgress", JSON.stringify({
//           missionId: currentMission.missionId,
//           taskProgress,
//           currentTaskIndex
//         }));
//       } catch (error) {
//         console.error("Error saving task progress to localStorage:", error);
//       }
//     }
//   }, [isMissionMode, currentMission, taskProgress, currentTaskIndex]);

//   /**
//    * Start a mission by ID
//    * 
//    * @param {string} missionId - ID of the mission to start
//    */
//   const startMission = useCallback((missionId) => {
//     const mission = availableMissions.find(m => m.missionId === missionId);
    
//     if (mission) {
//       setCurrentMission(mission);
//       setCurrentStepIndex(0);
//       setCurrentTaskIndex(0);
//       setIsMissionMode(true);
      
//       // Initialize progress for this mission
//       setMissionProgress({
//         activeMissionId: missionId,
//         currentStepIndex: 0,
//         completedSteps: {},
//         testedSteps: {},
//         missionRun: false
//       });
      
//       // Reset task progress
//       setTaskProgress({});
      
//       // Show mission intro overlay
//       setOverlayContent({
//         type: 'intro',
//         title: mission.title,
//         description: mission.description,
//         image: mission.assets?.introImage
//       });
//       setShowMissionOverlay(true);
//     } else {
//       console.error(`Mission with ID ${missionId} not found.`);
//     }
//   }, [availableMissions]);

//   /**
//    * Exit the current mission and return to sandbox mode
//    */
//   const exitMission = useCallback(() => {
//     setIsMissionMode(false);
//     setCurrentMission(null);
//     setCurrentStepIndex(0);
//     setCurrentTaskIndex(0);
//     setMissionProgress({});
//     setTaskProgress({});
    
//     // Clear mission data from localStorage
//     try {
//       localStorage.removeItem("missionProgress");
//       localStorage.removeItem("missionTaskProgress");
//     } catch (error) {
//       console.error("Error clearing mission progress from localStorage:", error);
//     }
//   }, []);

//   /**
//    * Mark a step as completed
//    * 
//    * @param {number} stepIndex - Index of the step to mark as completed
//    * @param {Object} configuration - Configuration of the completed step
//    */
//   const completeStep = useCallback((stepIndex, configuration) => {
//     setMissionProgress(prev => ({
//       ...prev,
//       completedSteps: {
//         ...prev.completedSteps,
//         [stepIndex]: {
//           completedAt: Date.now(),
//           configuration
//         }
//       }
//     }));
    
//     // Check if next step should be shown
//     if (stepIndex === currentStepIndex && stepIndex < currentMission.steps.length - 1) {
//       setCurrentStepIndex(stepIndex + 1);
//       setCurrentTaskIndex(0);
      
//       // Update progress with new step index
//       setMissionProgress(prev => ({
//         ...prev,
//         currentStepIndex: stepIndex + 1
//       }));
      
//       // Show step transition overlay
//       const nextStep = currentMission.steps[stepIndex + 1];
//       if (nextStep) {
//         setOverlayContent({
//           type: 'step',
//           stepNumber: nextStep.stepNumber,
//           title: nextStep.stepTitle,
//           description: nextStep.stepDescription,
//           instruction: nextStep.instructions?.instruction
//         });
//         setShowMissionOverlay(true);
//       }
//     }
    
//     // Check if run prompt should be shown
//     if (currentMission?.runPrompt?.showAfterStep === stepIndex + 1) {
//       setShowRunPrompt(true);
//     }
//   }, [currentMission, currentStepIndex]);

//   /**
//    * Mark a step as tested
//    * 
//    * @param {number} stepIndex - Index of the step to mark as tested
//    */
//   const markStepTested = useCallback((stepIndex) => {
//     setMissionProgress(prev => ({
//       ...prev,
//       testedSteps: {
//         ...prev.testedSteps,
//         [stepIndex]: {
//           testedAt: Date.now()
//         }
//       }
//     }));
    
//     // Hide test prompt after testing
//     setShowTestPrompt(false);
//   }, []);

//   /**
//    * Mark the mission as run
//    */
//   const markMissionRun = useCallback(() => {
//     setMissionProgress(prev => ({
//       ...prev,
//       missionRun: true,
//       ranAt: Date.now()
//     }));
    
//     // Hide run prompt after running
//     setShowRunPrompt(false);
//   }, []);

//   /**
//    * Check if a component should be visible based on mission constraints
//    * 
//    * @param {string} componentId - ID of the component to check
//    * @param {Object} options - Additional context for the check
//    * @returns {boolean} Whether the component should be visible
//    */
//   const isComponentVisible = useCallback((componentId, options = {}) => {
//     // Default to visible in sandbox mode
//     if (!isMissionMode || !currentMission) return true;
    
//     const stepData = currentMission.steps[currentStepIndex];
//     if (!stepData) return true;
    
//     const { uiRestrictions } = stepData;
//     if (!uiRestrictions) return true;
    
//     // Check specific component visibility rules
//     if (componentId === 'type-selector' && uiRestrictions.hideTypeSelection) {
//       return false;
//     }
    
//     if (componentId === 'subtype-selector' && uiRestrictions.hideSubtypeSelection) {
//       return false;
//     }
    
//     // Check visibility from explicitly defined lists
//     if (uiRestrictions.visibleComponents?.length > 0) {
//       return uiRestrictions.visibleComponents.includes(componentId);
//     }
    
//     if (uiRestrictions.hiddenComponents?.length > 0) {
//       return !uiRestrictions.hiddenComponents.includes(componentId);
//     }
    
//     // Default to visible
//     return true;
//   }, [isMissionMode, currentMission, currentStepIndex]);

//   /**
//    * Check if a component is enabled based on mission constraints
//    * 
//    * @param {string} componentId - ID of the component to check
//    * @param {Object} options - Additional context for the check
//    * @returns {boolean} Whether the component is enabled
//    */
//   const isComponentEnabled = useCallback((componentId, options = {}) => {
//     // Default to enabled in sandbox mode
//     if (!isMissionMode || !currentMission) return true;
    
//     const stepData = currentMission.steps[currentStepIndex];
//     if (!stepData) return true;
    
//     const { uiRestrictions } = stepData;
//     if (!uiRestrictions) return true;
    
//     // Check if component is in disabled list
//     if (uiRestrictions.disabledComponents?.length > 0) {
//       return !uiRestrictions.disabledComponents.includes(componentId);
//     }
    
//     // For subtype options
//     if (componentId.startsWith('subtype-') && options.type) {
//       const subtypeName = componentId.replace('subtype-', '');
//       if (uiRestrictions.disableSubtypeOptions?.includes(subtypeName)) {
//         return false;
//       }
//     }
    
//     // Default to enabled
//     return true;
//   }, [isMissionMode, currentMission, currentStepIndex]);

//   /**
//    * Get prefilled value for a configuration field if specified in the mission
//    * 
//    * @param {string} fieldName - Name of the configuration field
//    * @returns {any} Prefilled value or undefined
//    */
//   const getPrefilledValue = useCallback((fieldName) => {
//     if (!isMissionMode || !currentMission) return undefined;
    
//     const stepData = currentMission.steps[currentStepIndex];
//     if (!stepData?.uiRestrictions?.prefilledValues) return undefined;
    
//     return stepData.uiRestrictions.prefilledValues[fieldName];
//   }, [isMissionMode, currentMission, currentStepIndex]);

//   /**
//    * Check if a configuration value is locked (cannot be changed)
//    * 
//    * @param {string} fieldName - Name of the configuration field
//    * @returns {boolean} Whether the field is locked
//    */
//   const isValueLocked = useCallback((fieldName) => {
//     if (!isMissionMode || !currentMission) return false;
    
//     const stepData = currentMission.steps[currentStepIndex];
//     if (!stepData?.uiRestrictions?.lockedValues) return false;
    
//     return fieldName in stepData.uiRestrictions.lockedValues;
//   }, [isMissionMode, currentMission, currentStepIndex]);

//   /**
//    * Validate if the current configuration meets the mission requirements
//    * 
//    * @param {Object} configuration - Configuration to validate
//    * @returns {Object} Validation result with status and message
//    */
//   const validateStepConfiguration = useCallback((configuration) => {
//     if (!isMissionMode || !currentMission) {
//         return { isValid: true };
//     }
    
//     const stepData = currentMission.steps[currentStepIndex];
//     if (!stepData) {
//         return { isValid: true };
//     }
    
//     // Check required type
//     if (stepData.requiredType && configuration.type !== stepData.requiredType) {
//         return {
//             isValid: false,
//             message: `This step requires ${stepData.requiredType} type.`
//         };
//     }
    
//     // Check required subtype
//     if (stepData.requiredSubtype && configuration.subtype !== stepData.requiredSubtype) {
//         return {
//             isValid: false,
//             message: `This step requires ${stepData.requiredSubtype} subtype.`
//         };
//     }
    
//     // Motor specific validations
//     if (configuration.type === 'action' && configuration.subtype === 'motor') {
//         const motorConfig = Array.isArray(configuration.configuration) 
//             ? configuration.configuration 
//             : [configuration.configuration];
        
//         // Check required motor count
//         if (stepData.allowedConfigurations?.requiredMotorCount !== undefined) {
//             const requiredCount = stepData.allowedConfigurations.requiredMotorCount;
//             if (motorConfig.length !== requiredCount) {
//                 return {
//                     isValid: false,
//                     message: `This step requires exactly ${requiredCount} motor(s).`
//                 };
//             }
//         }
        
//         // Check speed range
//         if (stepData.allowedConfigurations?.speedRange) {
//             const [minSpeed, maxSpeed] = stepData.allowedConfigurations.speedRange;
            
//             const hasInvalidSpeed = motorConfig.some(motor => {
//                 const absSpeed = Math.abs(motor.speed || 0);
//                 return absSpeed < minSpeed || absSpeed > maxSpeed;
//             });
            
//             if (hasInvalidSpeed) {
//                 return {
//                     isValid: false,
//                     message: `Speed must be between ${minSpeed} and ${maxSpeed}.`
//                 };
//             }
//         }
        
//         // Check direction constraints
//         if (stepData.allowedConfigurations?.allowedDirections?.length > 0) {
//             const allowedDirections = stepData.allowedConfigurations.allowedDirections;
            
//             const hasInvalidDirection = motorConfig.some(motor => {
//                 const direction = (motor.speed || 0) >= 0 ? "forward" : "backward";
//                 return !allowedDirections.includes(direction);
//             });
            
//             if (hasInvalidDirection) {
//                 return {
//                     isValid: false,
//                     message: `Only ${allowedDirections.join(', ')} direction is allowed.`
//                 };
//             }
//         }
//     }
    
//     // Timer specific validations
//     if (configuration.type === 'input' && configuration.subtype === 'time') {
//         const { seconds } = configuration.configuration || {};
        
//         // Check time range
//         if (stepData.allowedConfigurations?.timeRange) {
//             const [minTime, maxTime] = stepData.allowedConfigurations.timeRange;
            
//             if (seconds < minTime || seconds > maxTime) {
//                 return {
//                     isValid: false,
//                     message: `Wait time must be between ${minTime} and ${maxTime} seconds.`
//                 };
//             }
//         }
        
//         // Check fixed time
//         if (stepData.allowedConfigurations?.fixedTime !== null && 
//             stepData.allowedConfigurations?.fixedTime !== undefined) {
//             const fixedTime = stepData.allowedConfigurations.fixedTime;
            
//             if (seconds !== fixedTime) {
//                 return {
//                     isValid: false,
//                     message: `This step requires exactly ${fixedTime} seconds.`
//                 };
//             }
//         }
//     }
    
//     // If all checks pass, the configuration is valid
//     return { 
//         isValid: true,
//         message: "Configuration is valid." 
//     };
//   }, [isMissionMode, currentMission, currentStepIndex]);

//   /**
//    * Check if the required hardware is connected for the mission
//    * 
//    * @returns {Object} Validation result with status and missing hardware
//    */
//   const validateHardwareRequirements = useCallback(() => {
//     if (!isMissionMode || !currentMission || !isConnected) {
//       return { isValid: true };
//     }
    
//     const missingHardware = [];
    
//     // Count connected motors
//     const connectedMotors = Object.values(portStates)
//       .filter(state => state && state.deviceType === 0x30)
//       .length;
    
//     // Check if at least one motor is needed for the mission
//     const needsMotor = currentMission.steps.some(step => 
//       step.requiredType === 'action' && step.requiredSubtype === 'motor'
//     );
    
//     if (needsMotor && connectedMotors === 0) {
//       missingHardware.push("motor");
//     }
    
//     // Count connected buttons/force sensors
//     const connectedButtons = Object.values(portStates)
//       .filter(state => state && state.deviceType === 0x3c)
//       .length;
    
//     // Check if at least one button is needed for the mission
//     const needsButton = currentMission.steps.some(step => 
//       step.requiredType === 'input' && step.requiredSubtype === 'button'
//     );
    
//     if (needsButton && connectedButtons === 0) {
//       missingHardware.push("button");
//     }
    
//     return {
//       isValid: missingHardware.length === 0,
//       missingHardware
//     };
//   }, [isMissionMode, currentMission, isConnected, portStates]);

//   /**
//    * Check if a mission is completed
//    * 
//    * @returns {boolean} Whether the mission is completed
//    */
//   const isMissionComplete = useCallback(() => {
//     if (!isMissionMode || !currentMission) return false;
    
//     // Check if all steps are completed
//     const allStepsCompleted = currentMission.steps.every((_, index) => 
//       missionProgress.completedSteps && missionProgress.completedSteps[index]
//     );
    
//     // Check if run is required and done
//     const runComplete = !currentMission.runPrompt?.requiredForCompletion || 
//       missionProgress.missionRun;
    
//     return allStepsCompleted && runComplete;
//   }, [isMissionMode, currentMission, missionProgress]);

//   /**
//    * Get the current state of the mission
//    * 
//    * @returns {Object} Current mission state
//    */
//   const getMissionState = useCallback(() => {
//     if (!isMissionMode || !currentMission) {
//       return { active: false };
//     }
    
//     return {
//       active: true,
//       missionId: currentMission.missionId,
//       title: currentMission.title,
//       currentStep: currentStepIndex + 1,
//       totalSteps: currentMission.steps.length,
//       complete: isMissionComplete()
//     };
//   }, [isMissionMode, currentMission, currentStepIndex, isMissionComplete]);

//   /**
//    * Get current task data
//    * 
//    * @returns {Object|null} Current task object or null
//    */
//   const getCurrentTask = useCallback(() => {
//     if (!isMissionMode || !currentMission || !currentMission.steps) return null;
    
//     // Get the mission step for the current task
//     const missionStep = currentMission.steps[currentStepIndex];
//     if (!missionStep || !missionStep.tasks) return null;
    
//     // Get the specific task from the step
//     return missionStep.tasks[currentTaskIndex] || null;
//   }, [isMissionMode, currentMission, currentStepIndex, currentTaskIndex]);

//   /**
//    * Check if a task is completed
//    * 
//    * @param {number} taskIndex - Index of the task to check
//    * @returns {boolean} Whether the task is completed
//    */
//   const isTaskCompleted = useCallback((taskIndex) => {
//     if (!currentMission) return false;
    
//     const missionId = currentMission.missionId;
//     const stepId = `${missionId}-step-${currentStepIndex}`;
    
//     return !!(taskProgress[stepId] && taskProgress[stepId][taskIndex]);
//   }, [currentMission, currentStepIndex, taskProgress]);

//   /**
//    * Mark a task as completed
//    * 
//    * @param {number} taskIndex - Index of the task to mark as completed
//    * @param {Object} data - Optional data to store with completion
//    */
//   const completeTask = useCallback((taskIndex, data = {}) => {
//     if (!currentMission) return;
    
//     const missionId = currentMission.missionId;
//     const stepId = `${missionId}-step-${currentStepIndex}`;
    
//     setTaskProgress(prev => {
//       // Create step entry if it doesn't exist
//       const stepProgress = prev[stepId] || {};
      
//       // Update task completion data
//       return {
//         ...prev,
//         [stepId]: {
//           ...stepProgress,
//           [taskIndex]: {
//             completedAt: Date.now(),
//             ...data
//           }
//         }
//       };
//     });
    
//     // Play completion sound
//     const audio = new Audio('/assets/sounds/marimba-bloop.mp3');
//     audio.play().catch(error => {
//       console.error('Error playing completion sound:', error);
//     });
//   }, [currentMission, currentStepIndex]);

//   /**
//    * Move to the next task
//    * 
//    * @returns {boolean} Whether the operation was successful
//    */
//   const moveToNextTask = useCallback(() => {
//     if (!currentMission) return false;
    
//     const missionStep = currentMission.steps[currentStepIndex];
//     if (!missionStep || !missionStep.tasks) return false;
    
//     // Check if we're at the last task
//     if (currentTaskIndex >= missionStep.tasks.length - 1) {
//       // Move to next step if available
//       if (currentStepIndex < currentMission.steps.length - 1) {
//         setCurrentStepIndex(currentStepIndex + 1);
//         setCurrentTaskIndex(0);
//         return true;
//       }
//       return false;
//     }
    
//     // Move to next task
//     setCurrentTaskIndex(currentTaskIndex + 1);
//     return true;
//   }, [currentMission, currentStepIndex, currentTaskIndex]);

//   /**
//    * Request a hint for the current task
//    */
//   const requestHint = useCallback(() => {
//     setShowHint(true);
    
//     // Auto-hide hint after 5 seconds
//     setTimeout(() => {
//       setShowHint(false);
//     }, 5000);
//   }, []);

//   /**
//    * Validate if a task is completable based on current state
//    * 
//    * @param {string} taskType - Type of task to validate
//    * @param {Object} data - Current state data
//    * @returns {boolean} Whether the task can be completed
//    */
//   const validateTaskCompletion = useCallback((taskType, data) => {
//     switch (taskType) {
//       case 'motor_speed':
//         // Motor task is complete when speed is non-zero
//         return data && data.speed !== 0 && data.speed !== undefined;
        
//       case 'test_button':
//         // Test button task is always completable
//         return true;
        
//       case 'timer_value':
//         // Timer task is complete when seconds is non-zero
//         return data && data.seconds && data.seconds > 0;
        
//       case 'navigation':
//         // Navigation task is complete when slot changes
//         return data && data.targetSlot !== undefined;
        
//       default:
//         return false;
//     }
//   }, []);

//   // Provide context values
//   const contextValue = {
//     // Mission mode state
//     isMissionMode,
//     setIsMissionMode,
    
//     // Mission data
//     availableMissions,
//     currentMission,
//     currentStepIndex,
//     missionProgress,
    
//     // Mission actions
//     startMission,
//     exitMission,
//     completeStep,
//     markStepTested,
//     markMissionRun,
    
//     // Mission UI helpers
//     isComponentVisible,
//     isComponentEnabled,
//     getPrefilledValue,
//     isValueLocked,
    
//     // Mission validation
//     validateStepConfiguration,
//     validateHardwareRequirements,
//     isMissionComplete,
//     getMissionState,
    
//     // Overlay state
//     showMissionOverlay,
//     setShowMissionOverlay,
//     overlayContent,
//     setOverlayContent,
//     showTestPrompt,
//     setShowTestPrompt,
//     showRunPrompt,
//     setShowRunPrompt,
    
//     // Task level state and functions
//     currentTaskIndex,
//     taskProgress,
//     showHint,
//     getCurrentTask,
//     isTaskCompleted,
//     completeTask,
//     moveToNextTask,
//     requestHint,
//     validateTaskCompletion
//   };
  
//   return (
//     <MissionContext.Provider value={contextValue}>
//       {children}
//     </MissionContext.Provider>
//   );
// };

// /**
//  * Hook for accessing mission functionality from any component
//  * 
//  * @returns {Object} Mission context functions and state
//  */
// export const useMission = () => useContext(MissionContext);

// export default MissionContext; */


/**
 * @file MissionContext.js
 * @description Context provider for managing mission state with slot configuration persistence
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useCustomization } from './CustomizationContext';
import { useBLE } from '../features/bluetooth/context/BLEContext';

// Sample missions definition remains the same
const SAMPLE_MISSIONS = [
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
        },
        // Task-level definitions - new structure for granular guidance
        tasks: [
          {
            taskType: "motor_speed",
            instruction: "Connect your motor and make it spin forward",
            stepTitle: "Set Motor Speed",
            hints: ["Click on the motor speed bar to set a forward speed"]
          },
          {
            taskType: "test_button",
            instruction: "Test your motor by clicking the Test button",
            stepTitle: "Test Motor",
            hints: ["Click the Test button at the bottom of the screen"]
          }
        ]
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
        },
        // Task-level definitions - new structure for granular guidance
        tasks: [
          {
            taskType: "navigation",
            instruction: "Click the Next button to move to the second step",
            stepTitle: "Go to Step 2",
            hints: ["Click the downward arrow at the bottom of the screen"]
          },
          {
            taskType: "select_input_type",
            instruction: "Click on SENSE to select input options",
            stepTitle: "Select SENSE",
            hints: ["Click the SENSE button at the top of the panel"]
          },
          {
            taskType: "select_timer",
            instruction: "Select the Wait option",
            stepTitle: "Select Wait",
            hints: ["Click on the Wait button in the right panel"]
          },
          {
            taskType: "timer_value",
            instruction: "Set the timer to 3 seconds",
            stepTitle: "Set Timer",
            hints: ["Use the + button to increase the timer value to 3"]
          }
        ]
      }
    ],
    runPrompt: {
      showPrompt: true,
      message: "Great job setting up your program! Now click Run to see what happens.",
      showAfterStep: 2,
      requiredForCompletion: true
    }
  }
];


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
  // Existing mission state
  const [isMissionMode, setIsMissionMode] = useState(false);
  const [availableMissions, setAvailableMissions] = useState(SAMPLE_MISSIONS);
  const [currentMission, setCurrentMission] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [missionProgress, setMissionProgress] = useState({});
  const [showMissionOverlay, setShowMissionOverlay] = useState(false);
  const [overlayContent, setOverlayContent] = useState(null);
  const [showTestPrompt, setShowTestPrompt] = useState(false);
  const [showRunPrompt, setShowRunPrompt] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskProgress, setTaskProgress] = useState({});
  const [showHint, setShowHint] = useState(false);
  
  // New state for slot configuration persistence
  const [slotConfigurations, setSlotConfigurations] = useState({});
  
  // Access other contexts
  const { setStepCount } = useCustomization();
  const { isConnected, portStates } = useBLE();

  // Load mission mode preference from localStorage
  useEffect(() => {
    try {
      const savedMissionMode = localStorage.getItem("missionMode");
      if (savedMissionMode) {
        setIsMissionMode(JSON.parse(savedMissionMode));
      }
      
      // Load active mission if in mission mode
      const savedMissionProgress = localStorage.getItem("missionProgress");
      if (savedMissionProgress) {
        const progress = JSON.parse(savedMissionProgress);
        setMissionProgress(progress);
        
        if (progress.activeMissionId) {
          const mission = SAMPLE_MISSIONS.find(m => m.missionId === progress.activeMissionId);
          if (mission) {
            setCurrentMission(mission);
            setCurrentStepIndex(progress.currentStepIndex || 0);
          }
        }
      }
    } catch (error) {
      console.error("Error loading mission state from localStorage:", error);
    }
  }, []);

  // Load task progress from localStorage
  useEffect(() => {
    try {
      const savedTaskProgress = localStorage.getItem("missionTaskProgress");
      if (savedTaskProgress && currentMission) {
        const parsed = JSON.parse(savedTaskProgress);
        
        // Only restore if for the current mission
        if (parsed.missionId === currentMission.missionId) {
          setTaskProgress(parsed.taskProgress || {});
          setCurrentTaskIndex(parsed.currentTaskIndex || 0);
        }
      }
    } catch (error) {
      console.error("Error loading task progress from localStorage:", error);
    }
  }, [currentMission]);

  // NEW: Load slot configurations from localStorage
  useEffect(() => {
    try {
      const savedConfigurations = localStorage.getItem("missionSlotConfigurations");
      if (savedConfigurations && currentMission) {
        const parsed = JSON.parse(savedConfigurations);
        
        // Only restore if for the current mission
        if (parsed.missionId === currentMission.missionId) {
          setSlotConfigurations(parsed.configurations || {});
          
          // Log successful restoration
          console.log("Restored slot configurations for mission:", currentMission.missionId);
        }
      }
    } catch (error) {
      console.error("Error loading slot configurations from localStorage:", error);
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
      const totalSteps = currentMission.totalMissionSteps + 1;
      setStepCount(totalSteps);
    }
  }, [isMissionMode, currentMission, setStepCount]);

  // Save mission progress when it changes
  useEffect(() => {
    if (currentMission && Object.keys(missionProgress).length > 0) {
      try {
        localStorage.setItem("missionProgress", JSON.stringify(missionProgress));
      } catch (error) {
        console.error("Error saving mission progress to localStorage:", error);
      }
    }
  }, [currentMission, missionProgress]);

  // Save task progress to localStorage
  useEffect(() => {
    if (isMissionMode && currentMission && Object.keys(taskProgress).length > 0) {
      try {
        localStorage.setItem("missionTaskProgress", JSON.stringify({
          missionId: currentMission.missionId,
          taskProgress,
          currentTaskIndex
        }));
      } catch (error) {
        console.error("Error saving task progress to localStorage:", error);
      }
    }
  }, [isMissionMode, currentMission, taskProgress, currentTaskIndex]);

  // NEW: Save slot configurations to localStorage
  useEffect(() => {
    if (isMissionMode && currentMission && Object.keys(slotConfigurations).length > 0) {
      try {
        localStorage.setItem("missionSlotConfigurations", JSON.stringify({
          missionId: currentMission.missionId,
          configurations: slotConfigurations
        }));
        console.log("Saved slot configurations for mission:", currentMission.missionId);
      } catch (error) {
        console.error("Error saving slot configurations to localStorage:", error);
      }
    }
  }, [isMissionMode, currentMission, slotConfigurations]);

  /**
   * Start a mission by ID
   * 
   * @param {string} missionId - ID of the mission to start
   */
  const startMission = useCallback((missionId) => {
    const mission = availableMissions.find(m => m.missionId === missionId);
    
    if (mission) {
      setCurrentMission(mission);
      setCurrentStepIndex(0);
      setCurrentTaskIndex(0);
      setIsMissionMode(true);
      
      // Initialize progress for this mission
      setMissionProgress({
        activeMissionId: missionId,
        currentStepIndex: 0,
        completedSteps: {},
        testedSteps: {},
        missionRun: false
      });
      
      // Reset task progress
      setTaskProgress({});
      
      // Reset slot configurations
      setSlotConfigurations({});
      
      // Show mission intro overlay
      setOverlayContent({
        type: 'intro',
        title: mission.title,
        description: mission.description,
        image: mission.assets?.introImage
      });
      setShowMissionOverlay(true);
    } else {
      console.error(`Mission with ID ${missionId} not found.`);
    }
  }, [availableMissions]);

  /**
   * Exit the current mission and return to sandbox mode
   */
  const exitMission = useCallback(() => {
    setIsMissionMode(false);
    setCurrentMission(null);
    setCurrentStepIndex(0);
    setCurrentTaskIndex(0);
    setMissionProgress({});
    setTaskProgress({});
    setSlotConfigurations({});
    
    // Clear mission data from localStorage
    try {
      localStorage.removeItem("missionProgress");
      localStorage.removeItem("missionTaskProgress");
      localStorage.removeItem("missionSlotConfigurations");
    } catch (error) {
      console.error("Error clearing mission progress from localStorage:", error);
    }
  }, []);

  /**
   * NEW: Update slot configuration
   * 
   * @param {number} slotIndex - Index of the slot to update
   * @param {Object} configuration - Configuration to save
   */
  const updateSlotConfiguration = useCallback((slotIndex, configuration) => {
    setSlotConfigurations(prev => ({
      ...prev,
      [slotIndex]: configuration
    }));
  }, []);

  /**
   * NEW: Get slot configurations
   * 
   * @returns {Object} Current slot configurations
   */
  const getSlotConfigurations = useCallback(() => {
    return slotConfigurations;
  }, [slotConfigurations]);

  /**
   * Mark a step as completed
   * 
   * @param {number} stepIndex - Index of the step to mark as completed
   * @param {Object} configuration - Configuration of the completed step
   */
  const completeStep = useCallback((stepIndex, configuration) => {
    setMissionProgress(prev => ({
      ...prev,
      completedSteps: {
        ...prev.completedSteps,
        [stepIndex]: {
          completedAt: Date.now(),
          configuration
        }
      }
    }));
    
    // Check if next step should be shown
    if (stepIndex === currentStepIndex && stepIndex < currentMission.steps.length - 1) {
      setCurrentStepIndex(stepIndex + 1);
      setCurrentTaskIndex(0);
      
      // Update progress with new step index
      setMissionProgress(prev => ({
        ...prev,
        currentStepIndex: stepIndex + 1
      }));
      
      // Show step transition overlay
      const nextStep = currentMission.steps[stepIndex + 1];
      if (nextStep) {
        setOverlayContent({
          type: 'step',
          stepNumber: nextStep.stepNumber,
          title: nextStep.stepTitle,
          description: nextStep.stepDescription,
          instruction: nextStep.instructions?.instruction
        });
        setShowMissionOverlay(true);
      }
    }
    
    // Check if run prompt should be shown
    if (currentMission?.runPrompt?.showAfterStep === stepIndex + 1) {
      setShowRunPrompt(true);
    }
  }, [currentMission, currentStepIndex]);

  /**
   * Mark a step as tested
   * 
   * @param {number} stepIndex - Index of the step to mark as tested
   */
  const markStepTested = useCallback((stepIndex) => {
    setMissionProgress(prev => ({
      ...prev,
      testedSteps: {
        ...prev.testedSteps,
        [stepIndex]: {
          testedAt: Date.now()
        }
      }
    }));
    
    // Hide test prompt after testing
    setShowTestPrompt(false);
  }, []);

  /**
   * Mark the mission as run
   */
  const markMissionRun = useCallback(() => {
    setMissionProgress(prev => ({
      ...prev,
      missionRun: true,
      ranAt: Date.now()
    }));
    
    // Hide run prompt after running
    setShowRunPrompt(false);
  }, []);

  /**
   * Check if a component should be visible based on mission constraints
   * 
   * @param {string} componentId - ID of the component to check
   * @param {Object} options - Additional context for the check
   * @returns {boolean} Whether the component should be visible
   */
  const isComponentVisible = useCallback((componentId, options = {}) => {
    // Default to visible in sandbox mode
    if (!isMissionMode || !currentMission) return true;
    
    const stepData = currentMission.steps[currentStepIndex];
    if (!stepData) return true;
    
    const { uiRestrictions } = stepData;
    if (!uiRestrictions) return true;
    
    // Check specific component visibility rules
    if (componentId === 'type-selector' && uiRestrictions.hideTypeSelection) {
      return false;
    }
    
    if (componentId === 'subtype-selector' && uiRestrictions.hideSubtypeSelection) {
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
  }, [isMissionMode, currentMission, currentStepIndex]);

  /**
   * Check if a component is enabled based on mission constraints
   * 
   * @param {string} componentId - ID of the component to check
   * @param {Object} options - Additional context for the check
   * @returns {boolean} Whether the component is enabled
   */
  const isComponentEnabled = useCallback((componentId, options = {}) => {
    // Default to enabled in sandbox mode
    if (!isMissionMode || !currentMission) return true;
    
    const stepData = currentMission.steps[currentStepIndex];
    if (!stepData) return true;
    
    const { uiRestrictions } = stepData;
    if (!uiRestrictions) return true;
    
    // Check if component is in disabled list
    if (uiRestrictions.disabledComponents?.length > 0) {
      return !uiRestrictions.disabledComponents.includes(componentId);
    }
    
    // For subtype options
    if (componentId.startsWith('subtype-') && options.type) {
      const subtypeName = componentId.replace('subtype-', '');
      if (uiRestrictions.disableSubtypeOptions?.includes(subtypeName)) {
        return false;
      }
    }
    
    // Default to enabled
    return true;
  }, [isMissionMode, currentMission, currentStepIndex]);

  /**
   * Get prefilled value for a configuration field if specified in the mission
   * 
   * @param {string} fieldName - Name of the configuration field
   * @returns {any} Prefilled value or undefined
   */
  const getPrefilledValue = useCallback((fieldName) => {
    if (!isMissionMode || !currentMission) return undefined;
    
    const stepData = currentMission.steps[currentStepIndex];
    if (!stepData?.uiRestrictions?.prefilledValues) return undefined;
    
    return stepData.uiRestrictions.prefilledValues[fieldName];
  }, [isMissionMode, currentMission, currentStepIndex]);

  /**
   * Check if a configuration value is locked (cannot be changed)
   * 
   * @param {string} fieldName - Name of the configuration field
   * @returns {boolean} Whether the field is locked
   */
  const isValueLocked = useCallback((fieldName) => {
    if (!isMissionMode || !currentMission) return false;
    
    const stepData = currentMission.steps[currentStepIndex];
    if (!stepData?.uiRestrictions?.lockedValues) return false;
    
    return fieldName in stepData.uiRestrictions.lockedValues;
  }, [isMissionMode, currentMission, currentStepIndex]);

  /**
   * Validate if the current configuration meets the mission requirements
   * 
   * @param {Object} configuration - Configuration to validate
   * @returns {Object} Validation result with status and message
   */
  const validateStepConfiguration = useCallback((configuration) => {
    if (!isMissionMode || !currentMission) {
        return { isValid: true };
    }
    
    const stepData = currentMission.steps[currentStepIndex];
    if (!stepData) {
        return { isValid: true };
    }
    
    // Check required type
    if (stepData.requiredType && configuration.type !== stepData.requiredType) {
        return {
            isValid: false,
            message: `This step requires ${stepData.requiredType} type.`
        };
    }
    
    // Check required subtype
    if (stepData.requiredSubtype && configuration.subtype !== stepData.requiredSubtype) {
        return {
            isValid: false,
            message: `This step requires ${stepData.requiredSubtype} subtype.`
        };
    }
    
    // Motor specific validations
    if (configuration.type === 'action' && configuration.subtype === 'motor') {
        const motorConfig = Array.isArray(configuration.configuration) 
            ? configuration.configuration 
            : [configuration.configuration];
        
        // Check required motor count
        if (stepData.allowedConfigurations?.requiredMotorCount !== undefined) {
            const requiredCount = stepData.allowedConfigurations.requiredMotorCount;
            if (motorConfig.length !== requiredCount) {
                return {
                    isValid: false,
                    message: `This step requires exactly ${requiredCount} motor(s).`
                };
            }
        }
        
        // Check speed range
        if (stepData.allowedConfigurations?.speedRange) {
            const [minSpeed, maxSpeed] = stepData.allowedConfigurations.speedRange;
            
            const hasInvalidSpeed = motorConfig.some(motor => {
                const absSpeed = Math.abs(motor.speed || 0);
                return absSpeed < minSpeed || absSpeed > maxSpeed;
            });
            
            if (hasInvalidSpeed) {
                return {
                    isValid: false,
                    message: `Speed must be between ${minSpeed} and ${maxSpeed}.`
                };
            }
        }
        
        // Check direction constraints
        if (stepData.allowedConfigurations?.allowedDirections?.length > 0) {
            const allowedDirections = stepData.allowedConfigurations.allowedDirections;
            
            const hasInvalidDirection = motorConfig.some(motor => {
                const direction = (motor.speed || 0) >= 0 ? "forward" : "backward";
                return !allowedDirections.includes(direction);
            });
            
            if (hasInvalidDirection) {
                return {
                    isValid: false,
                    message: `Only ${allowedDirections.join(', ')} direction is allowed.`
                };
            }
        }
    }
    
    // Timer specific validations
    if (configuration.type === 'input' && configuration.subtype === 'time') {
        const { seconds } = configuration.configuration || {};
        
        // Check time range
        if (stepData.allowedConfigurations?.timeRange) {
            const [minTime, maxTime] = stepData.allowedConfigurations.timeRange;
            
            if (seconds < minTime || seconds > maxTime) {
                return {
                    isValid: false,
                    message: `Wait time must be between ${minTime} and ${maxTime} seconds.`
                };
            }
        }
        
        // Check fixed time
        if (stepData.allowedConfigurations?.fixedTime !== null && 
            stepData.allowedConfigurations?.fixedTime !== undefined) {
            const fixedTime = stepData.allowedConfigurations.fixedTime;
            
            if (seconds !== fixedTime) {
                return {
                    isValid: false,
                    message: `This step requires exactly ${fixedTime} seconds.`
                };
            }
        }
    }
    
    // If all checks pass, the configuration is valid
    return { 
        isValid: true,
        message: "Configuration is valid." 
    };
  }, [isMissionMode, currentMission, currentStepIndex]);

  /**
   * Check if the required hardware is connected for the mission
   * 
   * @returns {Object} Validation result with status and missing hardware
   */
  const validateHardwareRequirements = useCallback(() => {
    if (!isMissionMode || !currentMission || !isConnected) {
      return { isValid: true };
    }
    
    const missingHardware = [];
    
    // Count connected motors
    const connectedMotors = Object.values(portStates)
      .filter(state => state && state.deviceType === 0x30)
      .length;
    
    // Check if at least one motor is needed for the mission
    const needsMotor = currentMission.steps.some(step => 
      step.requiredType === 'action' && step.requiredSubtype === 'motor'
    );
    
    if (needsMotor && connectedMotors === 0) {
      missingHardware.push("motor");
    }
    
    // Count connected buttons/force sensors
    const connectedButtons = Object.values(portStates)
      .filter(state => state && state.deviceType === 0x3c)
      .length;
    
    // Check if at least one button is needed for the mission
    const needsButton = currentMission.steps.some(step => 
      step.requiredType === 'input' && step.requiredSubtype === 'button'
    );
    
    if (needsButton && connectedButtons === 0) {
      missingHardware.push("button");
    }
    
    return {
      isValid: missingHardware.length === 0,
      missingHardware
    };
  }, [isMissionMode, currentMission, isConnected, portStates]);

  /**
   * Check if a mission is completed
   * 
   * @returns {boolean} Whether the mission is completed
   */
  const isMissionComplete = useCallback(() => {
    if (!isMissionMode || !currentMission) return false;
    
    // Check if all steps are completed
    const allStepsCompleted = currentMission.steps.every((_, index) => 
      missionProgress.completedSteps && missionProgress.completedSteps[index]
    );
    
    // Check if run is required and done
    const runComplete = !currentMission.runPrompt?.requiredForCompletion || 
      missionProgress.missionRun;
    
    return allStepsCompleted && runComplete;
  }, [isMissionMode, currentMission, missionProgress]);

  /**
   * Get the current state of the mission
   * 
   * @returns {Object} Current mission state
   */
  const getMissionState = useCallback(() => {
    if (!isMissionMode || !currentMission) {
      return { active: false };
    }
    
    return {
      active: true,
      missionId: currentMission.missionId,
      title: currentMission.title,
      currentStep: currentStepIndex + 1,
      totalSteps: currentMission.steps.length,
      complete: isMissionComplete()
    };
  }, [isMissionMode, currentMission, currentStepIndex, isMissionComplete]);

  /**
   * Get current task data
   * 
   * @returns {Object|null} Current task object or null
   */
  const getCurrentTask = useCallback(() => {
    if (!isMissionMode || !currentMission || !currentMission.steps) return null;
    
    // Get the mission step for the current task
    const missionStep = currentMission.steps[currentStepIndex];
    if (!missionStep || !missionStep.tasks) return null;
    
    // Get the specific task from the step
    return missionStep.tasks[currentTaskIndex] || null;
  }, [isMissionMode, currentMission, currentStepIndex, currentTaskIndex]);

  /**
   * Check if a task is completed
   * 
   * @param {number} taskIndex - Index of the task to check
   * @returns {boolean} Whether the task is completed
   */
  const isTaskCompleted = useCallback((taskIndex) => {
    if (!currentMission) return false;
    
    const missionId = currentMission.missionId;
    const stepId = `${missionId}-step-${currentStepIndex}`;
    
    return !!(taskProgress[stepId] && taskProgress[stepId][taskIndex]);
  }, [currentMission, currentStepIndex, taskProgress]);

  /**
   * Mark a task as completed
   * 
   * @param {number} taskIndex - Index of the task to mark as completed
   * @param {Object} data - Optional data to store with completion
   */
  const completeTask = useCallback((taskIndex, data = {}) => {
    if (!currentMission) return;
    
    const missionId = currentMission.missionId;
    const stepId = `${missionId}-step-${currentStepIndex}`;
    
    setTaskProgress(prev => {
      // Create step entry if it doesn't exist
      const stepProgress = prev[stepId] || {};
      
      // Update task completion data
      return {
        ...prev,
        [stepId]: {
          ...stepProgress,
          [taskIndex]: {
            completedAt: Date.now(),
            ...data
          }
        }
      };
    });
    
    // Play completion sound
    const audio = new Audio('/assets/sounds/marimba-bloop.mp3');
    audio.play().catch(error => {
      console.error('Error playing completion sound:', error);
    });
  }, [currentMission, currentStepIndex]);

  /**
   * Move to the next task
   * 
   * @returns {boolean} Whether the operation was successful
   */
  const moveToNextTask = useCallback(() => {
    if (!currentMission) return false;
    
    const missionStep = currentMission.steps[currentStepIndex];
    if (!missionStep || !missionStep.tasks) return false;
    
    // Check if we're at the last task
    if (currentTaskIndex >= missionStep.tasks.length - 1) {
      // Move to next step if available
      if (currentStepIndex < currentMission.steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        setCurrentTaskIndex(0);
        return true;
      }
      return false;
    }
    
    // Move to next task
    setCurrentTaskIndex(currentTaskIndex + 1);
    return true;
  }, [currentMission, currentStepIndex, currentTaskIndex]);

  /**
   * Request a hint for the current task
   */
  const requestHint = useCallback(() => {
    setShowHint(true);
    
    // Auto-hide hint after 5 seconds
    setTimeout(() => {
      setShowHint(false);
    }, 5000);
  }, []);

  /**
   * Validate if a task is completable based on current state
   * 
   * @param {string} taskType - Type of task to validate
   * @param {Object} data - Current state data
   * @returns {boolean} Whether the task can be completed
   */
  const validateTaskCompletion = useCallback((taskType, data) => {
    switch (taskType) {
      case 'motor_speed':
        // Motor task is complete when speed is non-zero
        return data && data.speed !== 0 && data.speed !== undefined;
        
      case 'test_button':
        // Test button task is always completable
        return true;
        
      case 'timer_value':
        // Timer task is complete when seconds is non-zero
        return data && data.seconds && data.seconds > 0;
        
      case 'navigation':
        // Navigation task is complete when slot changes
        return data && data.targetSlot !== undefined;
        
      default:
        return false;
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
    currentStepIndex,
    missionProgress,
    
    // Mission actions
    startMission,
    exitMission,
    completeStep,
    markStepTested,
    markMissionRun,
    
    // Mission UI helpers
    isComponentVisible,
    isComponentEnabled,
    getPrefilledValue,
    isValueLocked,
    
    // Mission validation
    validateStepConfiguration,
    validateHardwareRequirements,
    isMissionComplete,
    getMissionState,
    
    // Overlay state
    showMissionOverlay,
    setShowMissionOverlay,
    overlayContent,
    setOverlayContent,
    showTestPrompt,
    setShowTestPrompt,
    showRunPrompt,
    setShowRunPrompt,
    
    // Task level state and functions
    currentTaskIndex,
    taskProgress,
    showHint,
    getCurrentTask,
    isTaskCompleted,
    completeTask,
    moveToNextTask,
    requestHint,
    validateTaskCompletion,

    // Slot configuration values
    slotConfigurations,
    updateSlotConfiguration,
    getSlotConfigurations
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