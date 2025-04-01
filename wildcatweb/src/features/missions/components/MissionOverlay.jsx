/**
 * @file MissionOverlay.jsx
 * @description Component for displaying mission overlays with proper introduction flow
 * and dynamic port detection
 */

import React, { useState, useEffect } from "react";
import Portal from "../../../common/components/Portal";
import { useMission } from "../../../context/MissionContext";
import { useBLE } from "../../../features/bluetooth/context/BLEContext";
import { Rocket, Play, CheckCircle, AlertTriangle, X, Disc, BluetoothSearching, RefreshCwOff, ArrowLeft } from "lucide-react";
import MissionSelector from "./MissionSelector";
import styles from "../styles/MissionOverlay.module.css";
import { deviceMatchesRequirement } from "../utils/DeviceTypes";

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
    setDetectedMotorPort,
    exitMission
  } = useMission();
  
  const { isConnected, portStates } = useBLE();
  
  // Local state for hardware check
  const [hardwareReady, setHardwareReady] = useState(false);
  const [hardwareError, setHardwareError] = useState(null);
  const [configurationApplied, setConfigurationApplied] = useState(false);
  const [detectedPort, setDetectedPort] = useState(null);
  
  // State for mission selector
  const [showMissionSelector, setShowMissionSelector] = useState(false);
  
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
    // Check all ports for a motor
    for (const [port, state] of Object.entries(portStates)) {
      if (state && deviceMatchesRequirement(state.deviceType, "motor")) {
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

  /**
   * Handle going back to mission selector
   */
  const handleBack = () => {
    // exitMission();
    setShowMissionSelector(true);
  };
  
  if (!showMissionOverlay || !currentMission) {
    return null;
  }
  
  return (
    <>
      <Portal>
        <div className={styles.overlay}>
          <div className={styles.missionContainer}>
            {/* Mission intro content */}
            <div className={styles.introContent}>
              <div className={styles.missionIcon}>
                <Rocket size={48} />
              </div>
              
              <h2 className={styles.missionTitle}>{currentMission.title}</h2>
              
              {/* Hardware requirements section */}
              <div className={styles.hardwareSection}>
                {!isConnected ? (
                  <div className={styles.noConnection}>
                    <BluetoothSearching size={24} />
                    <span>Connect robot</span>
                  </div>
                ) : hardwareError ? (
                  <div className={styles.noMotors}>
                    <RefreshCwOff size={24} />
                    <span>Connect motor</span>
                  </div>
                ) : (
                  <div className={styles.hardwareSuccess}>
                    <CheckCircle size={24} />
                    <span>Motor connected to Port {detectedPort}</span>
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className={styles.buttonContainer}>
                <button 
                  className={styles.startButton} 
                  onClick={handleStartMission}
                  disabled={!hardwareReady}
                >
                  <Play size={20} />
                  Start Mission
                </button>

                <button className={styles.backButton} onClick={handleBack}>
                  <ArrowLeft size={20} />
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </Portal>

      <MissionSelector 
        isOpen={showMissionSelector} 
        onClose={() => setShowMissionSelector(false)} 
      />
    </>
  );
};

export default MissionOverlay;