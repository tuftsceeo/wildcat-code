/**
 * @file MissionOverlay.jsx
 * @description Component for displaying mission instructions, transitions, 
 * success messages, and prompts with visual overlays. Supports different types 
 * of mission information with consistent styling.
 */

import React, { useEffect } from "react";
import Portal from "../../../common/components/Portal";
import { useMission } from "../../../context/MissionContext.js";
import { useCustomization } from "../../../context/CustomizationContext.js";
import { Rocket, Award, Play, ArrowRight, CheckCircle2, X } from "lucide-react";
import styles from "../styles/MissionOverlay.module.css";
/**
 * Component that displays mission overlays with different content types
 * 
 * @component
 * @returns {JSX.Element|null} Mission overlay component
 */
const MissionOverlay = () => {
  const { 
    showMissionOverlay, 
    setShowMissionOverlay,
    overlayContent,
    showTestPrompt,
    setShowTestPrompt,
    showRunPrompt,
    setShowRunPrompt,
    currentMission,
    currentStepIndex,
    exitMission,
    validateHardwareRequirements
  } = useMission();
  
  const { readingLevel } = useCustomization();

  /**
   * Auto-hide test prompt after delay
   */
  useEffect(() => {
    let timeoutId;
    
    if (showTestPrompt) {
      timeoutId = setTimeout(() => {
        setShowTestPrompt(false);
      }, 7000); // Hide after 7 seconds
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showTestPrompt, setShowTestPrompt]);

  /**
   * Close the overlay
   */
  const handleClose = () => {
    setShowMissionOverlay(false);
  };

  /**
   * Exit the mission
   */
  const handleExitMission = () => {
    handleClose();
    exitMission();
  };

  /**
   * Verify hardware requirements for missing components
   * 
   * @returns {JSX.Element|null} Warning message for missing hardware or null
   */
  const renderHardwareWarning = () => {
    const { isValid, missingHardware } = validateHardwareRequirements();
    
    if (isValid) return null;
    
    return (
      <div className={styles.hardwareWarning}>
        <p className={styles.warningText}>
          <strong>Missing hardware:</strong> This mission requires the following components 
          that are not connected: {missingHardware.join(", ")}
        </p>
      </div>
    );
  };

  /**
   * Get content based on overlay type
   * 
   * @returns {JSX.Element} Content for the current overlay type
   */
  const renderOverlayContent = () => {
    if (!overlayContent) return null;

    switch (overlayContent.type) {
      case 'intro':
        // Intro overlay (shown when mission starts)
        return (
          <div className={styles.introContent}>
            <div className={styles.missionIcon}>
              <Rocket size={80} />
            </div>
            
            <h2 className={styles.missionTitle}>{overlayContent.title}</h2>
            
            <p className={styles.missionDescription}>{overlayContent.description}</p>
            
            {overlayContent.image && (
              <div className={styles.missionImage}>
                <img src={overlayContent.image} alt="Mission preview" />
              </div>
            )}
            
            {renderHardwareWarning()}
            
            <button className={styles.startButton} onClick={handleClose}>
              <Play size={20} />
              Start Mission
            </button>
            
            <button className={styles.exitButton} onClick={handleExitMission}>
              Return to Sandbox Mode
            </button>
          </div>
        );
        
      case 'step':
        // Step transition overlay (shown between steps)
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepNumber}>
              Step {overlayContent.stepNumber}
            </div>
            
            <h2 className={styles.stepTitle}>{overlayContent.title}</h2>
            
            <p className={styles.stepDescription}>{overlayContent.description}</p>
            
            {overlayContent.instruction && (
              <div className={styles.instructionBox}>
                <p className={styles.instruction}>{overlayContent.instruction}</p>
              </div>
            )}
            
            {renderHardwareWarning()}
            
            <button className={styles.continueButton} onClick={handleClose}>
              Continue
              <ArrowRight size={20} />
            </button>
          </div>
        );
        
      case 'success':
        // Success overlay (shown when a step is completed correctly)
        return (
          <div className={styles.successContent}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={80} color="var(--color-secondary-main)" />
            </div>
            
            <h2 className={styles.successTitle}>{overlayContent.title || "Great Job!"}</h2>
            
            <p className={styles.successMessage}>{overlayContent.message}</p>
            
            <button className={styles.continueButton} onClick={handleClose}>
              Continue
              <ArrowRight size={20} />
            </button>
          </div>
        );
        
      case 'complete':
        // Mission complete overlay (shown when the entire mission is completed)
        return (
          <div className={styles.completeContent}>
            <div className={styles.awardIcon}>
              <Award size={100} color="var(--color-secondary-main)" />
            </div>
            
            <h2 className={styles.completeTitle}>Mission Complete!</h2>
            
            <p className={styles.completeDescription}>
              {overlayContent.message || "You've successfully completed the mission!"}
            </p>
            
            {overlayContent.image && (
              <div className={styles.completeImage}>
                <img src={overlayContent.image} alt="Mission complete" />
              </div>
            )}
            
            <div className={styles.completeButtons}>
              <button 
                className={styles.exitButton} 
                onClick={handleExitMission}
              >
                Return to Sandbox Mode
              </button>
              
              {overlayContent.nextMissionId && (
                <button 
                  className={styles.nextMissionButton} 
                  onClick={() => {
                    handleClose();
                    exitMission();
                    // Logic to start next mission would go here
                  }}
                >
                  Next Mission
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  /**
   * Render test prompt overlay
   * 
   * @returns {JSX.Element|null} Test prompt overlay or null
   */
  const renderTestPrompt = () => {
    if (!showTestPrompt || !currentMission) return null;
    
    const stepData = currentMission.steps[currentStepIndex];
    if (!stepData?.testPrompt?.showPrompt) return null;
    
    return (
      <Portal>
        <div className={styles.promptOverlay}>
          <div className={`${styles.prompt} ${styles.testPrompt}`}>
            <p className={styles.promptText}>{stepData.testPrompt.message}</p>
            
            <button 
              className={styles.closePromptButton} 
              onClick={() => setShowTestPrompt(false)}
              aria-label="Close prompt"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </Portal>
    );
  };

  /**
   * Render run prompt overlay
   * 
   * @returns {JSX.Element|null} Run prompt overlay or null
   */
  const renderRunPrompt = () => {
    if (!showRunPrompt || !currentMission?.runPrompt?.showPrompt) return null;
    
    return (
      <Portal>
        <div className={styles.promptOverlay}>
          <div className={`${styles.prompt} ${styles.runPrompt}`}>
            <p className={styles.promptText}>{currentMission.runPrompt.message}</p>
            
            <button 
              className={styles.closePromptButton} 
              onClick={() => setShowRunPrompt(false)}
              aria-label="Close prompt"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </Portal>
    );
  };

  // Don't render anything if no overlay should be shown
  if (!showMissionOverlay && !showTestPrompt && !showRunPrompt) {
    return null;
  }

  // Render mission overlay
  return (
    <>
      {showMissionOverlay && (
        <Portal>
          <div className={styles.overlay}>
            <div className={`${styles.overlayContainer} ${styles[`complexity-${readingLevel}`]}`}>
              {overlayContent && overlayContent.type !== 'intro' && (
                <button 
                  className={styles.closeButton} 
                  onClick={handleClose}
                  aria-label="Close overlay"
                >
                  ×
                </button>
              )}
              
              {renderOverlayContent()}
            </div>
          </div>
        </Portal>
      )}
      
      {/* Render prompts */}
      {renderTestPrompt()}
      {renderRunPrompt()}
    </>
  );
};

export default MissionOverlay;
