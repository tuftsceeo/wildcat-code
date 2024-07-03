import React from 'react';
import { useDrop } from 'react-dnd';
import './Trash.css';

export default function Trash({ onDrop }) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['type1', 'type2'],
    drop: (item, monitor) => {
      onDrop(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className="trash"
      style={{
        backgroundColor: canDrop ? (isOver ? 'red' : 'pink') : 'white',
      }}
    >
      Drag blocks here to discard
    </div>
  );
}
