/**
 * @file DraggableStepButton.jsx
 * @description Component that wraps a step button with drag-and-drop functionality.
 * Only enabled in sandbox mode.
 * FIXED: Updated to work with internal drag handles (no external drag handle rendering).
 */

import React from "react";
import { useDrag, useDrop } from "react-dnd";
import styles from "../styles/RunMenu.module.css";

const ITEM_TYPE = "STEP";

/**
 * DraggableStepButton component that wraps a step button with drag-and-drop functionality
 * FIXED: Simplified to work with internal drag handles
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
        // Add custom drag preview
        previewOptions: {
            captureDraggingState: true,
            dropEffect: "move",
        },
    });

    const [{ isOver }, dropRef] = useDrop({
        accept: ITEM_TYPE,
        hover: (item) => {
            if (item.index === index) {
                return;
            }
            moveStep(item.index, index);
            item.index = index;
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
        canDrop: () => !isMissionMode,
    });

    // Combine drag and drop refs
    const ref = (node) => {
        dragRef(node);
        dropRef(node);
    };

    // Clone the children and add the dragging class when being dragged
    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                className: `${child.props.className || ""} ${
                    isDragging ? styles.dragging : ""
                }`,
            });
        }
        return child;
    });

    return (
        <div
            ref={ref}
            className={`${styles.draggableContainer} ${
                isDragging ? styles.dragging : ""
            } ${isOver ? styles.dropTarget : ""}`}
            style={{
                // Disable transitions during drag
                transition: isDragging ? "none" : undefined,
                transform: isDragging ? "scale(1.02)" : undefined,
            }}
        >
            {/* REMOVED: External drag handle - now handled internally by the button */}
            {childrenWithProps}
        </div>
    );
};

export default DraggableStepButton;
