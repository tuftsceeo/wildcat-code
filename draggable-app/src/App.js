import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Square from './Square';
import DraggableItem from './DraggableItem';
import Trash from './Trash'
import './App.css';
import KnobComponent from './Knob';
import RunCodeButton from './RunCodeButton.js';
import CheckButton from './CheckButton.js';
import { ITEM_TYPES } from './itemTypes'
import { v4 as uuidv4 } from 'uuid';
import './Knob.css';
// import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [items, setItems] = useState([]);

  const handleDropUUID = (item, squareId) => {
    const newItem = { ...item, id: uuidv4(), squareId, blockName: item.blockName || item.type} // Generate a unique ID for each new item
    newItem.blockName = item.blockName;
    setItems((prevItems) => {
      const filteredItems = prevItems.filter(i => i.id !== item.id);
      const updatedItems = filteredItems.filter(i => i.squareId !== squareId);
      updatedItems.push(newItem);
      return updatedItems;
    });
  };


// handles discarding blocks
    const handleRemove = (item, squareId, targetItemId = null) => {
      setItems((prevItems) => {
        // Remove the item from its previous square
        const newItems = prevItems.filter(i => i.id !== item.id);
        if (targetItemId) {
          // Replace the target item if targetItemId is provided
          const targetIndex = newItems.findIndex(i => i.id === targetItemId);
          newItems[targetIndex] = { ...item, squareId };
        } else {
          // Add the item to the new square
          newItems.push({ ...item, squareId });
        }
        return newItems;
      });
  };


  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <div className="flex-container">
          <Square id="square1" items={items.filter(item => item.squareId === 'square1')} onDrop={handleDropUUID} maxItems={2}>
            {items.filter((item) => item.squareId === 'square1').map((item) => (
              <DraggableItem key={item.id} id={item.id} type={item.type} blockName={item.blockName}/>
            ))}
          </Square>
          <Square id="square2" items={items.filter(item => item.squareId === 'square2')} onDrop={handleDropUUID} maxItems={2}>
            {items.filter((item) => item.squareId === 'square2').map((item) => (
              <DraggableItem key={item.id} id={item.id} type={item.type} blockName={item.blockName}/>
            ))}
          </Square>
          <Square id="square3" items={items.filter(item => item.squareId === 'square3')} onDrop={handleDropUUID} maxItems={2}>
            {items.filter((item) => item.squareId === 'square3').map((item) => (
              <DraggableItem key={item.id} id={item.id} type={item.type} blockName={item.blockName}/>
            ))}
          </Square>
          <RunCodeButton />
        </div>
        <div className="draggable-items">
          <DraggableItem id="item1" type={ITEM_TYPES.TYPE1} isSource={true} blockName='Motor left'> 
            <code> import motor, time
              from hub import port 
              motor.run_for_time(port.A, 5000, 500) </code>
            </DraggableItem>
          <DraggableItem id="item2" type={ITEM_TYPES.TYPE2} isSource={true} blockName='Wait until color sensor sees red'>  
            <code>
            import color_sensor
            import color
            from hub import port
            import runloop

            def is_color_red():
              return color_sensor.color(port.A) is color.RED

            async def main():
              # Wait until Color Sensor sees red 
              await runloop.until(is_color_red)

            runloop.run(main())
            </code>
            </DraggableItem >
          <KnobComponent /> 
        </div>
        <div> <Trash onDrop={(item) => handleRemove(item, null)} /> </div>
      </div>
    </DndProvider>
  );
}

export default App;







