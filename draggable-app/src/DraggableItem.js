import React from 'react';
import { useDrag } from 'react-dnd';
import { ITEM_TYPES, itemStyles } from './itemTypes';
import './DraggableItem.css';

export default function DraggableItem({ id, type, blockName, isSource = false }) {
  const [{ isDragging }, drag] = useDrag({
    type,
    item: { id, type, blockName, isSource },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="draggable-item"
      style={{
        ...itemStyles[type],
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {/* print ID for debugging */}
      {/* {id} */}
      
      {blockName}
      {/* hehehe my block slayyyyyyyy */}

    </div>
  );
}


