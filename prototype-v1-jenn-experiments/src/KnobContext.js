import React, { createContext, useContext, useState } from 'react';

const KnobContext = createContext();

export const useKnobContext = () => useContext(KnobContext);

export const KnobProvider = ({ children }) => {
  const [knobAngles, setKnobAngles] = useState({});

  const setKnobAngle = (port, angle) => {
    setKnobAngles((prev) => ({ ...prev, [port]: angle }));
  };

  return (
    <KnobContext.Provider value={{ knobAngles, setKnobAngle }}>
      {children}
    </KnobContext.Provider>
  );
};

