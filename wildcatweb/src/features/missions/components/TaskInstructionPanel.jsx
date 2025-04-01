/**
 * @file TaskInstructionPanel.jsx
 * @description Component to display task instructions during guided task sequences
 * Only shown after the introduction phase is complete
 */

import React, { useState, useCallback } from 'react';
import { Volume2, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useMission } from '../../../context/MissionContext';
import { useCustomization } from '../../../context/CustomizationContext';
import { speakWithRobotVoice } from '../../../common/utils/speechUtils';
import styles from '../styles/TaskInstructionPanel.module.css';

/**
 * Component to display task instructions with audio support
 * 
 * @component
 * @param {Object} props - Component props
 * @returns {JSX.Element|null} Task instruction panel or null if no task
 */
const TaskInstructionPanel = () => {
  const {
    currentTaskIndex,
    getCurrentTask,
    isTaskCompleted,
    completeTask,
    introCompleted,
    detectedDevices
  } = useMission();
  
  const { voice, volume, language } = useCustomization();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // Get current task data
  const task = getCurrentTask();
  
  // Check if this task is completed
  const isCompleted = task ? isTaskCompleted(currentTaskIndex) : false;
  
  /**
   * Handle playing audio instruction
   */
  const handlePlayAudio = useCallback(() => {
    if (isAudioPlaying || !task || !task.processedInstruction) return;
    
    setIsAudioPlaying(true);
    
    // Use robot voice from speechUtils
    const languageCode = language === 'es' ? 'es-ES' : 'en-US';
    speakWithRobotVoice(task.processedInstruction, voice, volume, languageCode);
    
    // Reset flag after estimated speech duration
    const duration = Math.max(2000, task.processedInstruction.length * 100);
    setTimeout(() => {
      setIsAudioPlaying(false);
    }, duration);
  }, [isAudioPlaying, task, language, voice, volume]);

  /**
   * Handle click on next button to advance to next task
   */
  const handleNextTask = useCallback(() => {
    // Move to next task
    completeTask(currentTaskIndex, { advancedManually: true });
    
    // Play completion sound
    const audio = new Audio('/assets/sounds/marimba-bloop.mp3');
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
  }, [completeTask, currentTaskIndex]);
  
  /**
   * Request visual hint for current task
   */
  const handleRequestHint = useCallback(() => {
    if (!task) return;
    // This would trigger visual hint display
    console.log('Hint requested for task:', task.taskId);
  }, [task]);

  // Show nothing if intro sequence is not completed or no task is available
  if (!introCompleted || !task) return null;

  return (
    <div className={styles.taskInstructionContainer}>
      {/* Task header with number, title, and completion status */}
      <div className={styles.taskHeader}>
        <div className={styles.taskIdentifier}>
          <span className={styles.taskNumber}>{task.stepTitle}</span>
        </div>
        
        {/* Completion indicator */}
        {isCompleted && (
          <div className={styles.completionIndicator}>
            <CheckCircle size={20} className={styles.completionIcon} />
            <span className={styles.completionText}>Completed</span>
          </div>
        )}
      </div>
      
      {/* Task instruction with support buttons */}
      <div className={styles.instructionContent}>
        <p className={styles.instruction}>{task.processedInstruction || task.instruction}</p>
        
        <div className={styles.supportButtons}>
          {/* Audio button */}
          <button
            className={`${styles.supportButton} ${isAudioPlaying ? styles.active : ''}`}
            onClick={handlePlayAudio}
            disabled={isAudioPlaying}
            aria-label="Play audio instruction"
            title="Play audio instruction"
          >
            <Volume2 size={18} />
          </button>
          
          {/* Hint button */}
          <button
            className={styles.supportButton}
            onClick={handleRequestHint}
            aria-label="Show hint"
            title="Show hint"
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </div>
      
      {/* Next button - only shown when task is completed */}
      {isCompleted && (
        <div className={styles.nextButtonContainer}>
          <button
            className={styles.nextButton}
            onClick={handleNextTask}
            aria-label="Next task"
          >
            <span>Next</span>
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskInstructionPanel;