import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FunctionDefault } from './FunctionDefault.jsx';
import { RunMenu } from './RunMenu.jsx';
import { BluetoothUI } from './BluetoothUI.jsx';
import { CodingTrack } from './CodingTrack.jsx';
import { CustomizationPage } from './CustomizationPage.jsx';



function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <>
        <RunMenu />
        <CodingTrack />
        <FunctionDefault />
        <BluetoothUI />
        {/* <CustomizationPage /> */}
      </>
      </DndProvider>
  
  );
}

export default App;
