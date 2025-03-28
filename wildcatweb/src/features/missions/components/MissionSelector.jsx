/**
 * @file MissionSelector.jsx
 * @description Component for selecting missions or switching to sandbox mode.
 * Redesigned with side-by-side options and minimal text for users with reading challenges.
 * Includes reset functionality to clear saved progress and slot configurations.
 */

import React, { useState, useEffect } from "react";
import { useMission } from "../../../context/MissionContext.js";
import Portal from "../../../common/components/Portal.js";
import { 
  Rocket, 
  Play, 
  Gamepad2, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  RefreshCw 
} from "lucide-react";
import styles from "../styles/MissionSelector.module.css";

/**
 * Mission selector component showing available missions
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the selector is open
 * @param {Function} props.onClose - Function to call when closing the selector
 * @param {boolean} props.initialSetup - Whether this is the initial app setup
 * @returns {JSX.Element} Mission selector component
 */
const MissionSelector = ({ isOpen, onClose, initialSetup = false }) => {
  const { 
    availableMissions, 
    startMission, 
    setIsMissionMode,
    validateHardwareRequirements,
    exitMission, // Added for reset functionality
    clearAllProgress // Added for reset functionality 
  } = useMission();
  
  const [selectedMissionIndex, setSelectedMissionIndex] = useState(0);
  const [showHardwareWarning, setShowHardwareWarning] = useState(false);
  const [missingHardware, setMissingHardware] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetType, setResetType] = useState(null); // 'sandbox' or 'mission'
  
  // Check if there's saved data to clear
  const [hasSandboxData, setHasSandboxData] = useState(false);
  const [hasMissionData, setHasMissionData] = useState(false);
  
  // Check for saved data on component mount
  useEffect(() => {
    try {
      // Check for slot configurations
      const slotData = localStorage.getItem("slotData");
      setHasSandboxData(!!slotData);
      
      // Check for mission progress
      const missionProgress = localStorage.getItem("missionProgress");
      setHasMissionData(!!missionProgress);
    } catch (error) {
      console.error("Error checking for saved data:", error);
    }
  }, []);

  // Get the currently selected mission
  const selectedMission = availableMissions[selectedMissionIndex];

  /**
   * Handle starting a mission
   * Validates hardware requirements before starting
   */
  const handleStartMission = () => {
    // Validate hardware requirements
    const { isValid, missingHardware: missing } = validateHardwareRequirements();
    
    if (!isValid) {
      setMissingHardware(missing);
      setShowHardwareWarning(true);
      return;
    }
    
    // Start the mission
    startMission(selectedMission.missionId);
    onClose();
  };

  /**
   * Handle switching to sandbox mode
   */
  const handleSandboxMode = () => {
    setIsMissionMode(false);
    onClose();
  };

  /**
   * Navigate to the previous mission
   */
  const handlePrevMission = () => {
    setSelectedMissionIndex(prev => 
      prev === 0 ? availableMissions.length - 1 : prev - 1
    );
  };

  /**
   * Navigate to the next mission
   */
  const handleNextMission = () => {
    setSelectedMissionIndex(prev => 
      prev === availableMissions.length - 1 ? 0 : prev + 1
    );
  };

  /**
   * Dismiss hardware warning and continue with mission
   */
  const handleContinueAnyway = () => {
    setShowHardwareWarning(false);
    startMission(selectedMission.missionId);
    onClose();
  };
  
  /**
   * Handle reset of mission progress or sandbox
   * 
   * @param {string} type - 'mission' or 'sandbox'
   */
  const handleResetProgress = (type) => {
    setResetType(type);
    setShowResetConfirm(true);
  };
  
  /**
   * Confirm reset and clear all progress
   */
  const confirmReset = () => {
    if (resetType === 'mission') {
      // Clear only mission progress
      try {
        localStorage.removeItem("missionMode");
        localStorage.removeItem("missionProgress");
        localStorage.removeItem("missionTaskProgress");
        localStorage.removeItem("missionSlotConfigurations");
        
        // Update state
        setHasMissionData(false);
        
        // Play feedback sound
        const audio = new Audio('/assets/sounds/reset-sound.mp3');
        audio.play().catch(error => {
          console.error('Error playing reset sound:', error);
        });
      } catch (error) {
        console.error("Error clearing mission progress:", error);
      }
    } else if (resetType === 'sandbox') {
      // Clear only sandbox data
      try {
        localStorage.removeItem("slotData");
        
        // Update state
        setHasSandboxData(false);
        
        // Play feedback sound
        const audio = new Audio('/assets/sounds/reset-sound.mp3');
        audio.play().catch(error => {
          console.error('Error playing reset sound:', error);
        });
      } catch (error) {
        console.error("Error clearing sandbox data:", error);
      }
    }
    
    // Close confirmation dialog
    setShowResetConfirm(false);
  };
  
  /**
   * Cancel reset operation
   */
  const cancelReset = () => {
    setShowResetConfirm(false);
    setResetType(null);
  };

  // If the selector is not open, don't render anything
  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <div className={styles.overlay}>
        <div className={styles.missionSelector}>
          {/* Simple header with title */}
          <div className={styles.header}>
            <h2 className={styles.title}>
              {initialSetup ? "CHOOSE YOUR MODE" : "SELECT MISSION"}
            </h2>
            {!initialSetup && (
              <button 
                className={styles.closeButton} 
                onClick={onClose}
                aria-label="Close mission selector"
              >
                ×
              </button>
            )}
          </div>

          {/* Main content - options side by side */}
          <div className={styles.content}>
            {initialSetup && (
              <div className={styles.sideByOptions}>
                {/* Sandbox option */}
                <div className={styles.modeCard}>
                  <div className={styles.modeIconLarge}>
                    <Gamepad2 size={64} />
                  </div>
                  <h3 className={styles.modeTitle}>Sandbox Mode</h3>
                  <button 
                    className={styles.modeButton} 
                    onClick={handleSandboxMode}
                  >
                    <Play size={20} />
                    Start
                  </button>
                  
                  {/* Show reset button only if there's sandbox data */}
                  {hasSandboxData && (
                    <button 
                      className={styles.resetOptionButton} 
                      onClick={() => handleResetProgress('sandbox')}
                    >
                      <RefreshCw size={16} className={styles.resetIcon} />
                      <span>Reset Sandbox</span>
                    </button>
                  )}
                </div>

                {/* Mission option */}
                <div className={styles.modeCard}>
                  <div className={styles.modeIconLarge}>
                    <Rocket size={64} />
                  </div>
                  <h3 className={styles.modeTitle}>Missions</h3>
                  {/* Render mission with thumbnail */}
                  <div className={styles.missionPreview}>
                    {selectedMission.assets?.thumbnail ? (
                      <img 
                        src={selectedMission.assets.thumbnail} 
                        alt="" 
                        className={styles.missionImage}
                      />
                    ) : (
                      <div className={styles.missionImage}>
                        <Rocket size={32} />
                      </div>
                    )}
                  </div>
                  <button 
                    className={styles.modeButton} 
                    onClick={handleStartMission}
                  >
                    <Play size={20} />
                    Start
                  </button>
                  
                  {/* Show reset button only if there's mission data */}
                  {hasMissionData && (
                    <button 
                      className={styles.resetOptionButton} 
                      onClick={() => handleResetProgress('mission')}
                    >
                      <RefreshCw size={16} className={styles.resetIcon} />
                      <span>Reset Progress</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Mission selector for non-setup mode */}
            {!initialSetup && (
              <div className={styles.missionContainer}>
                {/* Navigation buttons */}
                <button 
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={handlePrevMission}
                  aria-label="Previous mission"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Mission card with visual emphasis */}
                <div className={styles.missionCard}>
                  <div className={styles.missionHeader}>
                    <Rocket size={24} className={styles.missionIcon} />
                    <h3 className={styles.missionTitle}>{selectedMission.title}</h3>
                  </div>

                  <div className={styles.missionThumbnail}>
                    {selectedMission.assets?.thumbnail ? (
                      <img 
                        src={selectedMission.assets.thumbnail} 
                        alt={selectedMission.title}
                      />
                    ) : (
                      <div className={styles.placeholderThumbnail}>
                        <Rocket size={48} />
                      </div>
                    )}
                  </div>

                  <div className={styles.missionInfo}>
                    {/* Minimal text - just key information with visual indicators */}
                    <div className={styles.missionMetadata}>
                      <div className={styles.missionDifficulty}>
                        <span className={styles.difficultyValue}>
                          {selectedMission.difficultyLevel}
                        </span>
                      </div>
                      <div className={styles.missionSteps}>
                        <span className={styles.stepsValue}>
                          {selectedMission.totalMissionSteps} Steps
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className={styles.startButton} 
                    onClick={handleStartMission}
                  >
                    <Play size={20} />
                    Start Mission
                  </button>
                  
                  {/* Show reset button only if there's mission data */}
                  {hasMissionData && (
                    <button 
                      className={styles.resetMissionButton} 
                      onClick={() => handleResetProgress('mission')}
                    >
                      <RefreshCw size={16} className={styles.resetIcon} />
                      Reset Progress
                    </button>
                  )}
                </div>

                <button 
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={handleNextMission}
                  aria-label="Next mission"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>

          {/* Mission count indicator */}
          <div className={styles.missionIndicator}>
            <div className={styles.dotContainer}>
              {availableMissions.map((_, index) => (
                <div 
                  key={index} 
                  className={`${styles.indicatorDot} ${
                    index === selectedMissionIndex ? styles.activeDot : ""
                  }`}
                  onClick={() => setSelectedMissionIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Sandbox option for non-setup mode */}
          {!initialSetup && (
            <div className={styles.sandboxOption}>
              <button 
                className={styles.sandboxButton} 
                onClick={handleSandboxMode}
              >
                <Gamepad2 size={16} />
                Switch to Sandbox Mode
              </button>
              
              {/* Show reset button only if there's sandbox data */}
              {hasSandboxData && (
                <button 
                  className={styles.resetSandboxButton} 
                  onClick={() => handleResetProgress('sandbox')}
                >
                  <RefreshCw size={16} className={styles.resetIcon} />
                  Reset Sandbox
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hardware warning modal */}
        {showHardwareWarning && (
          <div className={styles.warningModal}>
            <div className={styles.warningContent}>
              <AlertTriangle size={48} className={styles.warningIcon} />
              
              <h3 className={styles.warningTitle}>Missing Hardware</h3>
              
              <ul className={styles.hardwareList}>
                {missingHardware.map((item, index) => (
                  <li key={index} className={styles.hardwareItem}>
                    {item === "motor" ? "Motor" : ""}
                    {item === "button" ? "Button" : ""}
                  </li>
                ))}
              </ul>
              
              <div className={styles.warningButtons}>
                <button 
                  className={styles.cancelButton} 
                  onClick={() => setShowHardwareWarning(false)}
                >
                  Cancel
                </button>
                
                <button 
                  className={styles.continueButton} 
                  onClick={handleContinueAnyway}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Reset confirmation modal */}
        {showResetConfirm && (
          <div className={styles.warningModal}>
            <div className={styles.resetContent}>
              <RefreshCw size={48} className={styles.resetDialogIcon} />
              
              <h3 className={styles.resetTitle}>
                {resetType === 'mission' ? 'Reset Mission Progress?' : 'Reset Sandbox Data?'}
              </h3>
              
              <p className={styles.resetMessage}>
                {resetType === 'mission' 
                  ? 'This will delete all saved mission progress.'
                  : 'This will delete all saved sandbox code.'}
              </p>
              
              <div className={styles.resetButtons}>
                <button 
                  className={styles.cancelButton} 
                  onClick={cancelReset}
                >
                  Cancel
                </button>
                
                <button 
                  className={styles.resetConfirmButton} 
                  onClick={confirmReset}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Portal>
  );
};

export default MissionSelector;