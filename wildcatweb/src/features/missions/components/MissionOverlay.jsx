/**
 * @file MissionOverlay.jsx
 * @description Component for displaying mission overlays with proper introduction flow
 * and dynamic port detection
 */

import React, { useState, useEffect } from "react";
import Portal from "../../../common/components/Portal";
import { useMission } from "../../../context/MissionContext";
import { useBLE } from "../../../features/bluetooth/context/BLEContext";
import { Rocket, Play, CheckCircle, AlertTriangle, X, Disc } from "lucide-react";
import styles from "../styles/MissionOverlay.module.css";

/**
 * Mission overlay component with proper initialization flow
 * 
 * @component
 * @returns {JSX.Element|null} Mission overlay or null if not shown
 */
const MissionOverlay = () => {
  const { 
    showMissionOverlay, 
    currentMission,
    applyInitialConfiguration,
    beginGuidedTasks,
    validateHardwareRequirements,
    setDetectedMotorPort
  } = useMission();
  
  const { isConnected, portStates } = useBLE();
  
  // Local state for hardware check
  const [hardwareReady, setHardwareReady] = useState(false);
  const [hardwareError, setHardwareError] = useState(null);
  const [configurationApplied, setConfigurationApplied] = useState(false);
  const [detectedPort, setDetectedPort] = useState(null);
  
  // Detect connected motor port and check hardware requirements
  useEffect(() => {
    if (showMissionOverlay && currentMission && isConnected) {
      const { isValid, missingHardware } = validateHardwareRequirements();
      
      // Find connected motor port
      const motorPort = findConnectedMotorPort();
      if (motorPort) {
        setDetectedPort(motorPort);
        setDetectedMotorPort(motorPort);
      }
      
      setHardwareReady(isValid && !!motorPort);
      
      if (!isValid) {
        setHardwareError({
          message: "Missing hardware requirements",
          details: missingHardware
        });
      } else if (!motorPort) {
        setHardwareError({
          message: "Missing hardware requirements",
          details: ["motor"]
        });
      } else {
        setHardwareError(null);
      }
    }
  }, [showMissionOverlay, currentMission, isConnected, validateHardwareRequirements, portStates, setDetectedMotorPort]);
  
  /**
   * Find the first connected motor port
   * 
   * @returns {string|null} Port letter or null if no motor found
   */
  const findConnectedMotorPort = () => {
    // Check all ports for a motor (device type 0x30)
    for (const [port, state] of Object.entries(portStates)) {
      if (state && state.deviceType === 0x30) {
        return port; // Return port letter (A, B, C, etc.)
      }
    }
    return null;
  };
  
  /**
   * Handle click on Start Mission button
   */
  const handleStartMission = () => {
    // Apply initial configuration with detected port
    if (currentMission?.initialConfiguration) {
      const config = {
        ...currentMission.initialConfiguration,
        detectedPort
      };
      
      applyInitialConfiguration(config);
      setConfigurationApplied(true);
      
      // Begin guided tasks after configuration is applied
      beginGuidedTasks();
    } else {
      // No configuration needed, just begin tasks
      beginGuidedTasks();
    }
  };
  
  if (!showMissionOverlay || !currentMission) {
    return null;
  }
  
  return (
    <Portal>
      <div className={styles.overlay}>
        <div className={styles.missionContainer}>
          {/* Mission intro content */}
          <div className={styles.introContent}>
            <div className={styles.missionIcon}>
              <Rocket size={80} />
            </div>
            
            <h2 className={styles.missionTitle}>{currentMission.title}</h2>
            
            <p className={styles.missionDescription}>{currentMission.description}</p>
            
            {currentMission.assets?.introImage && (
              <div className={styles.missionImage}>
                <img src={currentMission.assets.introImage} alt="Mission preview" />
              </div>
            )}
            
            {/* Hardware requirements section */}
            <div className={styles.hardwareSection}>
              <h3 className={styles.sectionTitle}>Hardware Check</h3>
              
              {!isConnected ? (
                <div className={styles.connectionWarning}>
                  <AlertTriangle size={24} />
                  <p>Please connect your robot to continue</p>
                </div>
              ) : hardwareError ? (
                <div className={styles.hardwareError}>
                  <AlertTriangle size={24} />
                  <p>{hardwareError.message}</p>
                  <ul className={styles.missingHardwareList}>
                    {hardwareError.details.map((item, index) => (
                      <li key={index}>
                        {item === "motor" ? "Motor" : ""}
                        {item === "button" ? "Force Sensor/Button" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className={styles.hardwareSuccess}>
                  <CheckCircle size={24} />
                  <p>Motor connected to Port {detectedPort}!</p>
                  <div className={styles.detectedDevice}>
                    <Disc size={20} />
                    <span>Motor detected on Port {detectedPort}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Start button - enabled only when hardware is ready */}
            <button 
              className={styles.startButton} 
              onClick={handleStartMission}
              disabled={!hardwareReady && !hardwareError?.allowSkip}
            >
              <Play size={20} />
              Start Mission
            </button>
            
            {hardwareError && (
              <button className={styles.skipHardwareButton} onClick={handleStartMission}>
                Continue Anyway
              </button>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default MissionOverlay;