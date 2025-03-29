# Mission Feature Task Analysis

## Overview

The Missions feature provides a highly scaffolded, step-by-step learning experience for autistic students using the WildCat coding application. Missions guide students through specific programming challenges with explicit instructions, visual supports, and audio feedback. This feature aims to lower the barrier to entry and provide a structured approach to learning programming concepts.

## User Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. Bluetooth   │     │  2. Mission     │     │  3. Mission     │
│  Connection     │──►  │  Selection      │──►  │  Introduction   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  6. Mission     │     │  5. Task        │     │  4. Hardware    │
│  Completion     │◄──  │  Progression    │◄──  │  Setup          │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Detailed Requirements

### 1. Bluetooth Connection

- **Status**: Already implemented
- **Description**: Application prompts user to connect to the robot via Bluetooth
- **Requirements**:
  - Existing Bluetooth connection dialog appears on application launch
  - Connection status persists throughout the session
- **Existing Components**:
  - `BluetoothUI.jsx` (src/features/bluetooth/components/BluetoothUI.jsx) - Handles connection UI
  - `BLEContext.js` (src/features/bluetooth/context/BLEContext.js) - Manages connection state
  - `BluetoothConnectionOverlay` - Shows connection dialog
- **Changes Needed**: None, can be used as-is

### 2. Mission Selection

- **Status**: Partially implemented, needs enhancement
- **Description**: First-time users are presented with a choice between guided missions and open sandbox mode
- **Requirements**:
  - Display on first application launch or when manually triggered
  - Show mission options with visual indicators and descriptions
  - Provide sandbox mode as an alternative option
  - Allow toggling between mission and sandbox modes after initial selection
  - Remember previous state for returning users
- **Existing Components**:
  - `MissionSelector.jsx` (src/features/missions/components/MissionSelector.jsx) - UI for selecting missions
  - `MissionService.js` (src/features/missions/services/MissionService.js) - Handles mission data
  - `App.js` has first launch detection logic with `isFirstLaunch` state
  - `MissionContext.js` - Core mission state management
- **Changes Needed**:
  - Complete first-time launch experience integration
  - Enhance `MissionSelector` styling for better accessibility
  - Add audio support to mission selection options

### 3. First Mission: "Move a Motor"

#### 3.1 Mission Introduction

- **Description**: Starting prompt explaining the mission goals and steps
- **Requirements**:
  - Modal overlay with mission title and description
  - Clear visual representation of goal (motor movement)
  - Audio playback button for text-to-speech using speechUtils
  - Continue button to proceed
- **Existing Components**:
  - `MissionOverlay.jsx` (src/features/missions/components/MissionOverlay.jsx) - Handles different overlay types
  - `speechUtils.js` (src/common/utils/speechUtils.js) - Text-to-speech functionality
- **Changes Needed**:
  - Add audio button to overlay content
  - Define mission goal visualization in overlay
  - Enhance overlay animation for better engagement

#### 3.2 Hardware Setup

- **Description**: System checks for correct hardware configuration
- **Requirements**:
  - Detect when exactly one motor is connected
  - Disable progression until hardware requirements are met
  - Provide clear feedback about required hardware
  - Automatically progress when requirements are met
- **Existing Components**:
  - `BLEContext.js` - Already tracks connected devices by port
  - `MissionContext.js` - Has `validateHardwareRequirements` method
  - `MissionOverlay.jsx` - Has hardware warning rendering
- **Implementation Details**:
  - Use existing BLE context method to list attached components
  - If more or less than one motor is connected, display the existing error implementation
  - Warning should provide clear visual guidance on how to connect exactly one motor
- **Changes Needed**:
  - Update `validateHardwareRequirements` to check for exactly one motor
  - Add auto-progress logic when hardware requirement is met
  - Enhance warning UI with more specific guidance

#### 3.3 Initial Configuration

- **Description**: Preset the application with specific configuration
- **Requirements**:
  - Set number of programming slots to 3
  - Configure slots with preset values
  - Make first slot (index 0) active and visible
- **Existing Components**:
  - `CustomizationContext.js` (src/context/CustomizationContext.js) - Controls step count
  - `MissionContext.js` - Can manage slot configurations
  - `App.js` - Manages `slotData` state
- **Changes Needed**:
  - Add mission initialization function to set up initial slot data
  - Extend `MissionContext` to handle preset configurations
  - Integrate with `App.js` state management

#### 3.4 Guided Tasks Sequence

- **Description**: Series of step-by-step tasks with guidance
- **Requirements**:
  - Display task instructions above main instruction panel
  - Provide hints, audio, feedback for each task
- **Existing Components**:
  - `InstructionDescriptionPanel.jsx` - Displays code descriptions
  - `CodeTrack.jsx` (src/features/codeTrack/components/CodeTrack.jsx) - Has test functionality
  - `MissionService.js` - Contains mission step definitions
  - `speechUtils.js` - Text-to-speech functionality
- **Implementation Details**:
  - Use `wildcatweb/src/assets/sounds/marimba-bloop.mp3` for task completion audio
  - Store mission specifics in JSON format similar to DEFAULT_MISSIONS in MissionService.js
  - The TaskInstructionPanel should match styling of instruction panel (same width, text size)
  - Use advanced reading level consistently for all mission instructions
  - Students should not be able to skip steps (enforce this with disabled controls)
  - For hardware disconnection, show warning similar to Bluetooth disconnection overlay
- **Changes Needed**:
  - Create new **TaskInstructionPanel** component for mission tasks
  - Add hint system with animations (no text hints)
  - Add task completion detection and feedback
  - Implement "Next" button logic for task progression

##### Task 1: Set Motor Speed
- **Existing Components**:
  - `CommandPanel.jsx` (src/features/commandPanel/components/CommandPanel.jsx) - Has UI control methods
  - `MotorDash.jsx` (src/features/commandPanel/dashboards/motor/components/MotorDash.jsx) - Motor controls
  - `MissionContext.js` - Has methods to hide UI elements
- **Implementation Details**:
  - Completion criteria: Any non-zero speed will count as task completion
  - Hide TypeSelector and SubtypeSelector components using existing mission context methods
  - Animate the motor control bar to guide student interaction
- **Changes Needed**:
  - Use `isComponentVisible` to hide TypeSelector/SubtypeSelector
  - Add animation for motor bar hint
  - Add task completion detection when motor speed changes from zero

##### Task 2: Test Motor Command
- **Existing Components**:
  - `CodeTrack.jsx` - Has test button
  - `MissionContext.js` - Has `markStepTested` method
- **Changes Needed**:
  - Add hint animation for test button
  - Enhance feedback when test is complete

##### Task 3: Navigate to Wait Step
- **Existing Components**:
  - `NavigationControls.jsx` (src/features/codeTrack/components/NavigationControls.jsx)
  - `CodeTrack.jsx` - Has navigation logic
- **Changes Needed**:
  - Add hint animation for navigation button
  - Add task completion detection when slot changes

##### Task 4: Set Timer Duration
- **Existing Components**:
  - `TimeDash.jsx` (src/features/commandPanel/dashboards/timer/components/TimeDash.jsx) - Timer controls
- **Changes Needed**:
  - Add hint animation for timer controls
  - Add task completion detection when timer value changes

##### Task 5: Test Timer Command
- **Existing Components**: Same as Task 2
- **Changes Needed**: Same as Task 2 but for timer context

##### Task 6: Run Complete Program
- **Existing Components**:
  - `RunMenu.jsx` (src/features/runMenu/components/RunMenu.jsx) - Has run button
  - `MissionContext.js` - Has `markMissionRun` method
- **Changes Needed**:
  - Add hint animation for run button
  - Add special feedback for successful program run

#### 3.5 Mission Completion

- **Description**: Celebrate completion and transition
- **Requirements**:
  - Display celebration and completion message
  - Offer return to mission selection or continue to sandbox
- **Existing Components**:
  - `MissionOverlay.jsx` - Has 'complete' overlay type
  - `MissionContext.js` - Has mission completion detection
- **Changes Needed**:
  - Enhance completion animation and feedback
  - Add option to continue with current configuration
  - Implement proper TypeSelector/SubtypeSelector unhiding

### 4. State Persistence

- **Description**: Maintain mission progress through Bluetooth disconnections
- **Requirements**:
  - Save state to local storage, resume after reconnection
- **Existing Components**:
  - `MissionContext.js` - Has localStorage integration
  - `BLEContext.js` - Has disconnection detection
- **Changes Needed**:
  - Ensure task-level state persistence
  - Add reconnection handling to resume mission state
  - Add user feedback for connection state changes

## UI/UX Considerations

### Accessibility Features
- **Existing Components**:
  - `speechUtils.js` - Text-to-speech functionality
  - Token-based CSS variables for consistent UI
- **Changes Needed**:
  - Extend speech utils to all mission instructions
  - Ensure all animations are subtle and non-distracting
  - Add task-specific audio cues

### Visual Design
- **Existing Components**:
  - `tokens.css` (src/themes/tokens.css) - Design token system
  - Various `.module.css` files for component styling
- **Changes Needed**:
  - Create new mission-specific CSS modules
  - Implement hint animations using tokens
  - Design celebratory feedback that's engaging but not overwhelming

## Technical Implementation

### Integration Points
1. **BLE Context**: Already implemented in `BLEContext.js`
2. **Customization Context**: Already implemented in `CustomizationContext.js`
3. **Mission Context**: Already implemented in `MissionContext.js`
4. **Speech Utils**: Already implemented in `speechUtils.js`

### Component Structure
- **MissionProvider**: Implemented in `MissionContext.js`
- **MissionSelector**: Implemented in `MissionSelector.jsx`
- **MissionOverlay**: Implemented in `MissionOverlay.jsx`
- **Task Components**: Need to be created

### State Management
- Already handled by `MissionContext.js` with localStorage integration
- **Changes Needed**:
  - Add task-specific state tracking
  - Enhance persistence for detailed mission progress

## New Components To Create

1. **TaskInstructionPanel** - Display current task instructions
   - Style consistently with InstructionDescriptionPanel
   - Include audio playback button
   - Support task-specific instructions

2. **HintSystem** - Provide animated hints for UI elements
   - Trigger hints after 30 seconds of inactivity
   - Trigger when hint button is pressed
   - Continue animation every 10 seconds until action completed
   - Show hint if "Next" button not clicked within 30 seconds
   - Visual animations only, no text-based hints

3. **TaskProgressTracker** - Track and persist task completion
   - Define task completion criteria for each task type
   - For motor speed: any non-zero speed counts as completion
   - Store in mission context and persist to localStorage

4. **CelebrationFeedback** - Visual and audio celebration effects
   - Use `wildcatweb/src/assets/sounds/marimba-bloop.mp3` for completion
   - Create appropriate visual animation for completion
   - Ensure feedback is engaging but not overwhelming

## Existing Component Modifications

1. **MissionContext.js** - Add task tracking methods
2. **MissionOverlay.jsx** - Add audio buttons, enhance animations
3. **App.js** - Improve first-launch experience
4. **CommandPanel.jsx** - Support task-specific constraints

## Testing Considerations

- Test with different hardware configurations
- Verify state persistence across sessions
- Ensure accessibility features work as expected
- Test with various screen sizes and devices

## Future Extensions

- Support for additional missions with different learning objectives
- Progress tracking across multiple missions
- Difficulty levels based on student needs
- Teacher dashboard for monitoring progress

# Corrected Implementation Guide for Task Registry Mission System

## Overview

This guide provides corrected instructions for implementing the Task Registry pattern in the WildCat application, with special attention to maintaining separation between introduction phases (intro, hardware setup, initial configuration) and guided task sequences.

## 1. Mission Flow Structure

The proper mission flow should maintain these distinct phases:

```
┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│                        │     │                        │     │                        │
│  1. Mission Introduction ────►  2. Hardware Setup     ────►  3. Initial Configuration│
│     (Overlay)          │     │     (Overlay)          │     │     (Automated)        │
│                        │     │                        │     │                        │
└────────────────────────┘     └────────────────────────┘     └────────────────────────┘
                                                                         │
                                                                         ▼
┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│                        │     │                        │     │                        │
│  6. Mission Completion ◄─────  5. Guided Task N       ◄─────  4. Guided Task 1...N   │
│     (Overlay)          │     │     (Instruction UI)   │     │     (Instruction UI)   │
│                        │     │                        │     │                        │
└────────────────────────┘     └────────────────────────┘     └────────────────────────┘
```

## 2. Phase-based Task Types

Define distinct task types for introduction phases and guided tasks:

```javascript
// Mission phases 
export const MISSION_PHASES = {
  INTRODUCTION: "introduction",
  HARDWARE_SETUP: "hardware_setup", 
  INITIAL_CONFIG: "initial_config",
  GUIDED_TASKS: "guided_tasks",
  COMPLETION: "completion"
};

// Task types
export const TASK_TYPES = {
  // Phase-specific task types
  MISSION_INTRO: "mission_intro",
  HARDWARE_CHECK: "hardware_check",
  INITIAL_CONFIG: "initial_config",
  
  // Regular guided task types
  // ... other task types
};
```

## 3. Mission Data Structure

Each mission should clearly separate introduction phases from guided tasks:

```javascript
{
  missionId: "mission1",
  title: "First Steps with Motors",
  description: "Learn to control a motor and add a wait step",
  introTaskCount: 3, // Count of intro phase tasks
  tasks: [
    // Introduction phases 
    {
      taskId: "mission_intro",
      type: TASK_TYPES.MISSION_INTRO,
      phase: MISSION_PHASES.INTRODUCTION,
      instruction: "Welcome to your first mission!"
      // No text hints - visual only
    },
    {
      taskId: "hardware_setup",
      type: TASK_TYPES.HARDWARE_CHECK,
      phase: MISSION_PHASES.HARDWARE_SETUP,
      // Hardware requirements
    },
    {
      taskId: "initial_config",
      type: TASK_TYPES.INITIAL_CONFIG,
      phase: MISSION_PHASES.INITIAL_CONFIG,
      // Initial configuration data
    },
    
    // Guided tasks
    {
      taskId: "set_motor_speed",
      type: TASK_TYPES.MOTOR_CONFIGURATION,
      phase: MISSION_PHASES.GUIDED_TASKS,
      // Task data
      targetElement: ".forwardBar", // Visual hint target
      hintAnimation: "pulse" // Animation type
    },
    // More guided tasks...
  ]
}
```

## 4. Mission Context Updates

The MissionContext needs to explicitly track and process phases:

```javascript
// Add phase tracking
const [currentPhase, setCurrentPhase] = useState(MISSION_PHASES.INTRODUCTION);
const [isIntroSequenceComplete, setIsIntroSequenceComplete] = useState(false);

// Process intro sequence
const processIntroductionSequence = useCallback(() => {
  // Logic to handle intro phases in sequence
});

// Check if intro sequence is complete
const checkIntroSequenceCompletion = useCallback(() => {
  // Logic to detect completion and move to guided tasks
});
```

## 5. Task Handlers for Visual Hints

Task handlers should provide visual-only hints:

```javascript
const motorConfigurationHandler = {
  // Other methods...
  
  getHint: (task) => ({
    selector: ".forwardBar", // CSS selector for target element
    animation: "pulse", // Animation type
    effect: "highlight" // Visual effect
  })
};
```

## 6. TaskInstructionPanel Updates

Remove text hints from the TaskInstructionPanel:

```jsx
// Remove text hint content
{/* NO HINT TEXT DISPLAY - visual hints only */}
```

## 7. MissionOverlay Updates

MissionOverlay must handle different phases correctly:

```jsx
// Handle overlay dismiss based on phase
const handleOverlayDismiss = useCallback(() => {
  if (currentPhase === MISSION_PHASES.INTRODUCTION) {
    // Introduction phase logic
  } else if (currentPhase === MISSION_PHASES.HARDWARE_SETUP) {
    // Hardware setup phase logic
  }
  // etc.
});
```

## 8. Event Dispatching System

The event dispatching system should only be active during guided tasks:

```javascript
const dispatchTaskEvent = useCallback((eventType, eventData) => {
  // Skip event processing during intro sequence
  if (!isIntroSequenceComplete) return;
  
  // Normal event processing...
}, [/* dependencies */]);
```

## Implementation Order

1. Define MISSION_PHASES and proper task types in TaskRegistry.js
2. Update task handlers to provide visual-only hints
3. Modify mission data to include distinct phases
4. Update MissionContext with phase tracking and sequence processing
5. Update MissionOverlay to handle phase-specific displays
6. Remove text hints from TaskInstructionPanel
7. Test the complete flow from intro → guided tasks

## Common Pitfalls to Avoid

1. **Task Flattening**: Don't flatten all tasks into a single list without phase distinction
2. **Text Hints**: Never store or display text hints - use visual hints only
3. **Missing Phase Transitions**: Ensure proper transitions between introduction phases
4. **Event Handling During Intro**: Disable most event handling during introduction sequence
5. **UI Element Visibility**: Control component visibility based on current phase

## Testing Strategy

1. Test each phase in isolation
2. Verify proper phase transitions
3. Validate visual hint system works without text
4. Ensure introduction sequence precedes guided tasks
5. Check persistence of phase state across app reloads