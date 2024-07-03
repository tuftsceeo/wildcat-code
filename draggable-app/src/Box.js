import React from 'react';
import { useDrag } from 'react-dnd';


const style = {
  position: 'absolute',
  border: '1px dashed gray',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  cursor: 'move',
};

export default function Box ({ id }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'ITEM',
      item: { id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id],
  );

    return (
        <div 
        className="box"
        ref={drag}
        style={{ ...style}}
        data-testid="box">
        </div> 
    )

 
}