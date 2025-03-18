/**
 * @file MissionButton.jsx
 * @description Button component for accessing missions from the BluetoothUI.
 * Displays a rocket icon and opens the mission selector when clicked.
 */

import React, { useState } from "react";
import { Rocket } from "lucide-react";
import { useMission } from "../../context/MissionContext";
import MissionSelector from "./MissionSelector";
import styles from "./styles/MissionButton.module.css";

/**
 * Button component for accessing missions
 * 
 * @component
 * @returns {JSX.Element} Mission button component
 */
const MissionButton = () => {
  const { isMissionMode } = useMission();
  const [showMissionSelector, setShowMissionSelector] = useState(false);

  /**
   * Handle button click to toggle mission selector
   */
  const handleClick = () => {
    setShowMissionSelector(prev => !prev);
  };

  return (
    <>
      <button
        className={`${styles.missionButton} ${isMissionMode ? styles.active : ""}`}
        onClick={handleClick}
        aria-label="Missions"
        title="Missions"
      >
        <Rocket size={24} />
        {isMissionMode && <div className={styles.activeDot} />}
      </button>
      
      <MissionSelector 
        isOpen={showMissionSelector} 
        onClose={() => setShowMissionSelector(false)} 
      />
    </>
  );
};

export default MissionButton;
