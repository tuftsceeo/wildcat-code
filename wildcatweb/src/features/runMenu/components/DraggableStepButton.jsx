/**
 * @file DraggableStepButton.jsx
 * @description Component that wraps a step button with drag-and-drop functionality.
 * Only enabled in sandbox mode. Updated to work with the new structure where
 * progress segments are separated from step buttons.
 * FIXED: Now works with static progress segments - only the step button is draggable.
 */

import React from "react";
import { useDrag, useDrop } from "react-dnd";
import styles from "../styles/RunMenu.module.css";

const ITEM_TYPE = "STEP";

/**
 * DraggableStepButton component that wraps a step button with drag-and-drop functionality
 * FIXED: Works with new structure where progress segments are static and separate
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.index - Index of the step
 * @param {Function} props.moveStep - Function to move a step
 * @param {boolean} props.isMissionMode - Whether we're in mission mode
 * @param {React.ReactNode} props.children - The step button to wrap
 * @returns {JSX.Element} Draggable step button
 */
const DraggableStepButton = ({ index, moveStep, isMissionMode, children }) => {
    // Only enable drag-and-drop in sandbox mode
    const [{ isDragging }, dragRef] = useDrag({
        type: ITEM_TYPE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => !isMissionMode,
        // Add custom drag preview options
        previewOptions: {
            captureDraggingState: true,
            dropEffect: "move",
        },
        // Custom drag preview to show we're moving the step
        end: (item, monitor) => {
            // Optional: Add feedback when drag completes
            if (monitor.didDrop()) {
                console.log(`Step ${item.index} was successfully moved`);
            }
        },
    });

    const [{ isOver, canDrop }, dropRef] = useDrop({
        accept: ITEM_TYPE,
        hover: (item, monitor) => {
            // Don't replace items with themselves
            if (item.index === index) {
                return;
            }

            // Only proceed if we can drop here
            if (!monitor.canDrop()) {
                return;
            }

            // Move the step to the new position
            moveStep(item.index, index);

            // Update the item's index to reflect the new position
            // This prevents the drag from constantly trying to reorder
            item.index = index;
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
        canDrop: () => !isMissionMode,
    });

    // Combine drag and drop refs
    const ref = (node) => {
        dragRef(node);
        dropRef(node);
    };

    // Clone the children and add drag-related classes
    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                className: `${child.props.className || ""} ${
                    isDragging ? styles.dragging : ""
                }`,
                // Add data attributes for styling
                "data-dragging": isDragging,
                "data-can-drop": canDrop,
                "data-is-over": isOver,
            });
        }
        return child;
    });

    return (
        <div
            ref={ref}
            className={`${styles.draggableContainer} ${
                isDragging ? styles.dragging : ""
            } ${isOver && canDrop ? styles.dropTarget : ""}`}
            style={{
                // Disable transitions during drag for smooth experience
                transition: isDragging ? "none" : undefined,
                // Slightly scale up during drag to indicate movement
                transform: isDragging ? "scale(1.02)" : undefined,
                // Add subtle visual feedback
                opacity: isDragging ? 0.8 : 1,
                // Ensure proper z-index during drag
                zIndex: isDragging ? 1000 : "auto",
            }}
            // Add accessibility attributes
            role="button"
            tabIndex={isMissionMode ? -1 : 0}
            aria-label={`Draggable step ${index + 1}`}
            aria-grabbed={isDragging}
            aria-dropeffect={canDrop ? "move" : "none"}
        >
            {childrenWithProps}
        </div>
    );
};

export default DraggableStepButton;
