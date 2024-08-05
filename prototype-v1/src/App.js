import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FunctionDefault } from './FunctionDefault.jsx';
import { RunMenu } from './RunMenu.jsx';
import { BluetoothUI } from './BluetoothUI.jsx';
import { KnobProvider } from './KnobContext.js';
import CodingTrack from './CodingTrack.jsx';
import { CustomizationPage } from './CustomizationPage.jsx';



function App() {
  const [pyCode, setPyCode] = useState('');
  const [canRun, setCanRun] = useState(false);

  return (
    <KnobProvider>
      <DndProvider backend={HTML5Backend}>
        <>
          <RunMenu pyCode={pyCode} canRun={canRun} />
          <CodingTrack setPyCode={setPyCode} setCanRun={setCanRun} />
          <FunctionDefault />
          <BluetoothUI />
        </>
      </DndProvider>
    </KnobProvider>
  
  );
}

export default App;
