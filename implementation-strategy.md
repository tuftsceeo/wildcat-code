# Step Manipulation Implementation Strategy

## Overview
This document outlines the strategy for implementing step reordering via drag-and-drop and an "Add Step" button to the Run Menu component. These features will enhance the WildcatWeb application by allowing users to manipulate their code sequence with minimal visual clutter.

## Design Principles
- Maintain minimal visual clutter
- Ensure accessibility for autistic users
- Keep interface predictable and consistent
- Support multiple reading levels
- Provide keyboard alternatives for all operations
- Create interface elements that follow existing visual language

## UI and Visual Considerations

### Triple Dot Drag Handle
- **Size and Spacing**: Use small dots (3px radius) arranged vertically with 10px spacing
- **Opacity**: Set at 0.6 opacity when inactive, increasing to 0.8 when hovered and 0.9 when dragging
- **Color**: Use `var(--panel-text)` with reduced opacity to maintain theme consistency
- **Position**: Positioned 15px from left edge of step button, vertically centered
- **Hover State**: Subtle increase in opacity (0.6 → 0.8) on step hover
- **High Contrast Mode**: In high contrast mode, increase opacity to 0.8 (inactive) and 1.0 (active)
- **Active State**: Becomes more prominent during dragging operation

### Add Step Button 
- **Size**: Height of 40px with padding of `var(--spacing-4)` on both sides
- **Position**: Centered below the step list, above the Play button
- **Color**: Use `var(--button-default-bg)` as background and `var(--button-default-text)` for text
- **Border**: `var(--border-width-standard)` with `var(--button-default-border)` color
- **Border Radius**: `var(--radius-md)` to match other interface elements
- **Typography**: `var(--font-size-base)` with `var(--font-family-active)` 
- **Hover State**: Use standard button hover effect (transform scale with `var(--button-scale-hover)`)
- **Focus Indicator**: Use standard focus ring with `var(--focus-ring-color)`

### Drag Feedback
- **Visual Indicators**: 
  - Subtle elevation effect (2px shadow with 30% opacity)
  - Increased brightness (105%) of the dragging element
  - Blue insertion line (2px dashed) showing the drop target position
- **Animation**: 
  - Smooth 150ms transition for hover states
  - No transition during actual drag to prevent lag
- **Stack Order**: 
  - Dragged item uses `z-index: var(--z-index-above)` to appear above other elements
- **Dimensions**: 
  - Dragged item maintains exact same size as original (no scaling)

## Files to Modify

### 1. `wildcatweb/src/features/runMenu/components/RunMenu.jsx`
**Changes needed:**
- Add "Add Step" button below the step list
- Implement drag-and-drop functionality using React DnD (already in the project)
- Add subtle drag handles to step buttons
- Add keyboard shortcut alternatives for reordering (Ctrl+↑/↓)
- Update mission event dispatching for step manipulation

**Modification strategy:**
- Create a new wrapper component for step buttons instead of modifying the `renderStepButtons` function directly
- Encapsulate drag-and-drop logic in this wrapper component
- Implement the "Add Step" button in the existing JSX structure

**Key code modifications:**
```jsx
// Add this to the imports
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Add this as a constant
const ITEM_TYPE = 'STEP';

// Add this function to handle adding a step
const handleAddStep = () => {
    if (isMissionMode) return;
    
    // Create new slot data with an empty step inserted before the stop step
    const newSlotData = [...slotData];
    newSlotData.splice(missionSteps - 1, 0, createEmptySlot());
    
    // Update step count if needed
    if (missionSteps < MAX_STEPS) {
        setStepCount(missionSteps + 1);
    }
    
    // Dispatch event to update slot data
    window.dispatchEvent(new CustomEvent('updateSlotData', { 
        detail: { slotData: newSlotData } 
    }));
};

// Modify the renderStepButtons function to use DraggableStepButton
// and add the Add Step button to the JSX
```

### 2. `wildcatweb/src/features/runMenu/styles/RunMenu.module.css`
**Changes needed:**
- Add styles for drag handles (triple dots)
- Add styles for the "Add Step" button
- Add styles for visual feedback during dragging
- Add styles for keyboard focus indication

**Modification strategy:**
- Add new CSS classes without modifying existing ones
- Use CSS variables for colors and sizing to maintain consistency
- Keep new styles grouped together with clear comments

### 3. `wildcatweb/src/common/constants/dragTypes.js`
**Changes needed:**
- Add a new drag type constant for step reordering

**Modification strategy:**
- Simple addition of a new constant `STEP_ITEM` to the existing constants file

## Files to Create

### 1. `wildcatweb/src/features/runMenu/components/DraggableStepButton.jsx`
**Purpose:**
- Encapsulate the drag-and-drop functionality for step buttons
- Keep the main RunMenu component cleaner and more maintainable

**Content:**
- React component that wraps around step buttons
- Uses React DnD hooks (useDrag and useDrop)
- Handles drag visualization and drop logic
- Provides keyboard alternatives

### 2. `wildcatweb/src/features/runMenu/components/AddStepButton.jsx` (optional)
**Purpose:**
- Encapsulate the "Add Step" button functionality
- Make testing and maintaining this feature easier

**Content:**
- Simple button component with consistent styling
- Includes appropriate aria attributes for accessibility
- Includes functionality to add steps at specific positions

## Potentially Impacted Files

### 1. `wildcatweb/src/App.js`
**Potential impact:**
- The App component manages `slotData` and passes it to RunMenu
- Need to ensure the step data structure can be correctly reordered
- May need to add handlers for the new step manipulation operations

**Prevention strategy:**
- Carefully review the `slotData` structure and how it's processed
- Ensure step indices are updated correctly after reordering
- Test with the full application to verify operations work correctly

### 2. `wildcatweb/src/context/CustomizationContext.js`
**Potential impact:**
- This context manages step count and preferences
- Step count will change when adding steps
- May need to ensure changes work with the MIN_STEPS and MAX_STEPS constraints

**Prevention strategy:**
- Review `setStepCount` implementation to ensure it properly handles dynamic changes
- Test edge cases (adding when at MAX_STEPS, etc.)

### 3. `wildcatweb/src/features/codeTrack/components/CodeTrack.jsx`
**Potential impact:**
- Displays the currently selected step
- May need to handle cases where steps are reordered while one is selected
- Should update correctly when steps are added or reordered

**Prevention strategy:**
- Ensure current step index is properly adjusted after reordering
- Test with the CodeTrack component visible to ensure UI remains synchronized

### 4. `wildcatweb/src/features/missions/context/MissionContext.js`
**Potential impact:**
- Step reordering might affect mission tasks and step validation
- Mission system might expect steps in a specific order for guidance

**Prevention strategy:**
- Dispatch appropriate mission events when steps are reordered
- Test with mission mode enabled to ensure guidance still works correctly
- Consider disabling reordering during active missions if needed

## Testing Strategy

### 1. Component Testing
- Create Jest tests for the new DraggableStepButton component
- Test drag-and-drop functionality with React Testing Library
- Ensure keyboard alternatives work correctly
- Verify the "Add Step" button functions as expected

### 2. Integration Testing
- Test step reordering with different step types (motor, wait, etc.)
- Verify step count is updated correctly when adding steps
- Ensure the RunMenu, CodeTrack, and CommandPanel stay synchronized

### 3. Mission System Testing
- Test with mission mode enabled to ensure compatibility
- Verify mission tasks continue to work when steps are reordered
- Test edge cases like reordering a step that's part of a mission task

### 4. Accessibility Testing
- Verify all new components have appropriate ARIA attributes
- Test with keyboard navigation only
- Ensure high contrast mode works correctly with the new UI elements
- Verify screen reader compatibility

### 5. Visual Regression Testing
- Compare screenshots before and after implementation to ensure minimal visual change
- Verify the UI remains clean and uncluttered
- Test with different reading levels and themes

## Implementation Plan (Immediate)

This feature needs to be implemented immediately as a single work item. The following steps should be completed in order:

1. Create the DraggableStepButton component with full drag-and-drop functionality
2. Add the "Add Step" button to the RunMenu
3. Update CSS with all required style classes
4. Implement keyboard alternatives for accessibility
5. Update mission event dispatching system for the new operations
6. Perform thorough testing across all identified areas

All of these modifications should be treated as a cohesive unit of work and completed together.

## Risks and Mitigations

### Risk: Visual Clutter
**Mitigation:**
- Keep drag handles subtle (semi-transparent at 0.6 opacity)
- Only show enhanced visual feedback during active dragging
- Strictly follow existing visual language and color scheme
- Use the minimum visual indicators needed for functionality
- Use empty space effectively rather than adding new visual elements

### Risk: Breaking Mission Sequences
**Mitigation:**
- Disable reordering and "Add Step" functionality entirely in mission mode
- Add specific checks before all manipulation operations:
  ```jsx
  if (isMissionMode) return;  // Prevent operation in mission mode
  ```
- Add visual indication that these functions are disabled during missions

### Risk: Confusing Interactions
**Mitigation:**
- Keep the "Add Step" button separate and clearly labeled
- Use consistent drag handle design (triple dot) found in other applications
- Implement animation for drop targets with 150ms transitions
- Match the interaction pattern to existing UI conventions
- Ensure the insertion indicator (blue line) is highly visible

### Risk: Compatibility with Assistive Technology
**Mitigation:**
- Implement keyboard alternatives: 
  - Ctrl+↑/↓ for moving steps
  - Alt+A for adding a new step
- Add descriptive ARIA labels:
  ```jsx
  aria-label={`Drag to reorder ${stepName}`}
  aria-roledescription="Draggable step"
  ```
- Ensure focus indicators are visible in all color schemes
- Test with VoiceOver and NVDA screen readers

### Risk: Performance Issues During Dragging
**Mitigation:**
- Use React's memoization to prevent unnecessary rerenders
- Optimize the drag preview rendering
- Use CSS transforms instead of layout properties for smooth animation
- Debounce event handlers to prevent lag

## Code Structure Considerations

### DraggableStepButton Component
This component should follow these principles:
- Pure functional component with React hooks
- Memoized to prevent unnecessary rerenders
- Self-contained drag-and-drop logic
- Clear separation of concerns:
  - Dragging logic
  - Visual presentation
  - Accessibility features

Example structure:
```jsx
const DraggableStepButton = React.memo(function DraggableStepButton({
    index,
    step,
    moveStep,
    children,
    isDisabled,
    isCurrentStep,
    isMissionMode
}) {
    // Drag hook
    const [{ isDragging }, dragRef, dragPreviewRef] = useDrag({...});
    
    // Drop hook
    const [{ isOver }, dropRef] = useDrop({...});
    
    // Keyboard handler
    const handleKeyDown = (e) => {...};
    
    // Combined refs
    const ref = (node) => {
        dragRef(node);
        dropRef(node);
    };
    
    return (
        <div 
            ref={ref}
            className={styles.draggableContainer}
            onKeyDown={handleKeyDown}
            tabIndex={isDisabled ? -1 : 0}
            aria-disabled={isDisabled}
        >
            {!isDisabled && !isMissionMode && (
                <div className={styles.dragHandle} aria-hidden="true">
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                </div>
            )}
            {children}
        </div>
    );
});
```

## Accessibility Testing Checklist

- [ ] Verify keyboard navigation works for all step operations
- [ ] Confirm that screen readers announce drag operations appropriately
- [ ] Test with high contrast mode to ensure handles are visible
- [ ] Ensure focus states are clearly visible on all interactive elements
- [ ] Test with zoomed display (200%) to verify usability
- [ ] Verify ARIA labels are descriptive and helpful
- [ ] Test with reduced motion settings enabled
- [ ] Ensure color is not the only indicator for interaction states

## Conclusion
This implementation strategy allows us to add step reordering and addition functionality to the WildcatWeb application while maintaining its clean, accessible interface. The design emphasizes minimal visual disruption while providing clear interaction affordances for users. 

By implementing the drag handles as subtle triple dots and providing a single, clearly labeled "Add Step" button, we maintain the application's focus on simplicity while adding powerful functionality. The immediate implementation approach ensures all aspects of the feature are built cohesively with careful attention to accessibility and visual consistency.
