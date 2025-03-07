/**
 * @file speechUtils.js
 * @description Utility functions for text-to-speech synthesis with robot voice effects
 * to provide accessible audio feedback across the application.
 */

// Voice preset definitions with robot-themed properties
export const VOICE_PRESETS = [
  {
    id: "robot1",
    name: "ROBBY",
    iconName: "Bot",
    color: "var(--color-red)",
    description: "Friendly robot with clear speech",
    settings: {
      rate: 0.9,
      pitch: 0.5,
      useWordPauses: true,
      wordPauseChar: "."
    }
  },
  {
    id: "robot2",
    name: "Z-BOT",
    iconName: "Zap",
    color: "var(--color-yellow)",
    description: "Energetic robot with quick speech",
    settings: {
      rate: 1.1,
      pitch: 0.3,
      useWordPauses: false,
      distortion: "high"
    }
  },
  {
    id: "robot3",
    name: "TINCAN",
    iconName: "Bird",
    color: "var(--color-blue)",
    description: "High-pitched robot with pauses",
    settings: {
      rate: 0.8,
      pitch: 1.5,
      useWordPauses: true,
      wordPauseChar: " - "
    }
  }
];

/**
 * Get a voice preset by ID
 * 
 * @param {string} presetId - The ID of the preset to retrieve
 * @returns {Object|null} The voice preset object or null if not found
 */
export const getVoicePreset = (presetId) => {
  return VOICE_PRESETS.find(preset => preset.id === presetId) || VOICE_PRESETS[0];
};

/**
 * Speak text using the browser's speech synthesis with robot voice effects
 * 
 * @param {string} text - The text to speak
 * @param {string} presetId - ID of the voice preset to use
 * @param {number} volume - Volume level (0-100)
 * @param {string} language - Language code for the speech ('en-US', 'es-ES', etc.)
 * @returns {boolean} Whether speech synthesis was successful
 */
export const speakWithRobotVoice = (text, presetId = "robot1", volume = 80, language = "en-US") => {
  // Check if speech synthesis is available
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported in this browser");
    return false;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Get the voice preset
  const preset = getVoicePreset(presetId);
  if (!preset) {
    console.warn(`Voice preset ${presetId} not found`);
    return false;
  }
  
  // Create a new speech utterance
  const utterance = new SpeechSynthesisUtterance();
  
  // Get available voices
  const voices = window.speechSynthesis.getVoices();
  
  // Try to find a suitable voice based on language
  if (voices.length > 0) {
    console.log(`Finding voice for language: ${language}`);
    
    // First try to match language exactly
    let voice = voices.find(v => v.lang === language);
    
    // If no exact match, try to find a voice with the same language code
    if (!voice) {
      const langCode = language.split('-')[0];
      voice = voices.find(v => v.lang.startsWith(langCode));
      
      // Log available voices that match language code for debugging
      console.log("Available voice options:", 
        voices
          .filter(v => v.lang.startsWith(langCode))
          .map(v => `${v.name} (${v.lang})`)
      );
    }
    
    // If still no match, use any available voice
    if (!voice) {
      voice = voices[0];
      console.log(`No matching voice found for ${language}, using default: ${voice.name}`);
    } else {
      console.log(`Using voice: ${voice.name} (${voice.lang})`);
    }
    
    utterance.voice = voice;
  }
  
  // Set language
  utterance.lang = language;
  
  // Apply robot voice effects from the selected preset
  utterance.rate = preset.settings.rate;
  utterance.pitch = preset.settings.pitch;
  utterance.volume = volume / 100; // Convert to 0-1 range
  
  // Add pauses between words for robotic effect if needed
  if (preset.settings.useWordPauses && text) {
    const robotText = text.split(" ").join(preset.settings.wordPauseChar);
    utterance.text = robotText;
  } else {
    utterance.text = text;
  }
  
  // Add distortion effect if specified (through pitch oscillation with event)
  if (preset.settings.distortion === "high") {
    let wordIndex = 0;
    utterance.onboundary = function(event) {
      if (event.name === 'word') {
        // Alternate pitch slightly for each word
        utterance.pitch = preset.settings.pitch + (wordIndex % 2 ? 0.2 : -0.2);
        wordIndex++;
      }
    };
  }
  
  // Speak the text
  window.speechSynthesis.speak(utterance);
  return true;
};

/**
 * Stop any ongoing speech
 */
export const stopSpeech = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Preload voices to ensure they're available when needed
 * Call this early in the application initialization
 * 
 * @returns {Promise} Promise that resolves when voices are loaded
 */
export const preloadVoices = () => {
  return new Promise((resolve) => {
    // If voices are already available, resolve immediately
    if ("speechSynthesis" in window && window.speechSynthesis.getVoices().length > 0) {
      resolve(window.speechSynthesis.getVoices());
      return;
    }
    
    // Otherwise wait for the voiceschanged event
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
      
      // Trigger voice loading
      window.speechSynthesis.getVoices();
    } else {
      // Speech synthesis not supported
      resolve([]);
    }
  });
};