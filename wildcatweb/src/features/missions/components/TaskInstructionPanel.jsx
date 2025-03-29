/**
 * @file TaskInstructionPanel.jsx
 * @description Component that displays mission task instructions with audio support.
 * Updated to provide visual hints without text for accessibility.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Volume2, HelpCircle, CheckCircle, ArrowRight } from "lucide-react";
import { useMission } from "../../../context/MissionContext";
import { useCustomization } from "../../../context/CustomizationContext";
import { speakWithRobotVoice } from "../../../common/utils/speechUtils";
import styles from "../styles/TaskInstructionPanel.module.css";

/**
 * Component that displays mission task instructions with audio support
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.task - Task data object
 * @param {number} props.taskIndex - Current task index
 * @param {boolean} props.isCompleted - Whether the task is completed
 * @param {Function} props.onRequestHint - Callback function to request a hint
 * @returns {JSX.Element} Task instruction panel with audio support
 */
const TaskInstructionPanel = ({
  task,
  taskIndex,
  isCompleted = false,
  onRequestHint,
}) => {
  const { voice, volume, language } = useCustomization();
  const { moveToNextTask, activeHint } = useMission();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState(null);

  /**
   * Reset the inactivity timer that triggers hints
   */
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    // Only set timer if task is not completed
    if (!isCompleted && task && onRequestHint) {
      const timer = setTimeout(() => {
        if (onRequestHint) onRequestHint();
      }, 30000); // Show hint after 30 seconds of inactivity

      setInactivityTimer(timer);
    }
  }, [inactivityTimer, isCompleted, task, onRequestHint]);

  /**
   * Reset inactivity timer when task changes or is completed
   */
  useEffect(() => {
    resetInactivityTimer();

    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [task, isCompleted, taskIndex, resetInactivityTimer, inactivityTimer]);

  /**
   * Handle text-to-speech for task instruction
   */
  const handlePlayAudio = () => {
    resetInactivityTimer();

    // If already playing, don't start again
    if (isAudioPlaying) return;

    // Extract text to speak
    const textToSpeak = task?.instruction || "";
    if (!textToSpeak) return;

    // Set playing flag
    setIsAudioPlaying(true);

    // Use robot voice from speechUtils
    const languageCode = language === "es" ? "es-ES" : "en-US";
    speakWithRobotVoice(textToSpeak, voice, volume, languageCode);

    // Reset flag after estimated speech duration
    // Simple estimate: 100ms per character
    const duration = Math.max(2000, textToSpeak.length * 100);
    setTimeout(() => {
      setIsAudioPlaying(false);
    }, duration);
  };

  /**
   * Handle Next button click to progress to next task
   */
  const handleNextTask = () => {
    // Play a completion sound
    const audio = new Audio("/assets/sounds/marimba-bloop.mp3");
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });

    // Move to next task
    if (moveToNextTask) {
      moveToNextTask();
    }
  };

  // If no task data is provided, don't render the panel
  if (!task) return null;

  return (
    <div className={styles.taskInstructionContainer}>
      {/* Task header with number, title, and completion status */}
      <div className={styles.taskHeader}>
        <div className={styles.taskIdentifier}>
          <span className={styles.taskNumber}>
            {taskIndex !== undefined ? `Task ${taskIndex + 1}` : "Current Task"}
          </span>
          {task.stepTitle && <span className={styles.taskTitle}>{task.stepTitle}</span>}
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
        <p className={styles.instruction}>{task.instruction}</p>

        <div className={styles.supportButtons}>
          {/* Audio button */}
          <button
            className={`${styles.supportButton} ${isAudioPlaying ? styles.active : ""}`}
            onClick={handlePlayAudio}
            disabled={isAudioPlaying}
            aria-label="Play audio instruction"
            title="Play audio instruction"
          >
            <Volume2 size={20} />
          </button>

          {/* Hint button - only show if callback provided */}
          {onRequestHint && (
            <button
              className={styles.supportButton}
              onClick={() => {
                if (onRequestHint) {
                  onRequestHint();
                  resetInactivityTimer();
                }
              }}
              aria-label="Show hint"
              title="Show hint"
            >
              <HelpCircle size={20} />
            </button>
          )}
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