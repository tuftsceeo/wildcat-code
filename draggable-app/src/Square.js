import React from 'react';
import { useDrop } from 'react-dnd';
import { ITEM_TYPES } from './itemTypes'
import './Square.css';

export default function Square({ id, items, onDrop, children, maxItems }) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: Object.values(ITEM_TYPES),
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      onDrop(item, id);
    },
    canDrop: () => items.length < maxItems,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className="square"
      style={{
        backgroundColor: canDrop ? (isOver ? 'lightgreen' : 'lightyellow') : 'white',
      }}
    >
      {children}
    </div>
  );
}












