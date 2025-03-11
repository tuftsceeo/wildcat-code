/**
 * @file speechUtils.js
 * @description Utilities for handling speech synthesis for robot voices
 */

// Define different robot voice presets
export const VOICE_PRESETS = [
  {
    id: 'robot1',
    name: 'ROBBY',
    iconName: 'Bot',
    color: '#00AAFF',
    description: 'Friendly robot with clear voice',
    settings: {
      rate: 0.9,
      pitch: 0.5,
      useWordPauses: true,
      wordPauseChar: '.',
    }
  },
  {
    id: 'robot2',
    name: 'Z-BOT',
    iconName: 'Zap',
    color: '#FFAA00',
    description: 'Energetic robot with fast voice',
    settings: {
      rate: 1.1,
      pitch: 0.3,
      useWordPauses: false,
      distortion: 'high',
    }
  },
  {
    id: 'robot3',
    name: 'TINCAN',
    iconName: 'Bird',
    color: '#FF5500',
    description: 'High-pitched robot with pauses',
    settings: {
      rate: 0.8,
      pitch: 1.5,
      useWordPauses: true,
      wordPauseChar: ' - ',
    }
  }
];

/**
 * Speak text using robot voice effects
 * 
 * @param {string} text - Text to speak
 * @param {string} voiceId - Voice preset ID (from VOICE_PRESETS)
 * @param {number} volume - Volume level (0-100)
 * @param {string} languageCode - Language code (e.g., 'en-US', 'es-ES')
 */
export function speakWithRobotVoice(text, voiceId = 'robot1', volume = 80, languageCode = 'en-US') {
  // Make sure speech synthesis is available
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Find the selected voice preset
  const voicePreset = VOICE_PRESETS.find(v => v.id === voiceId) || VOICE_PRESETS[0];
  
  // Pre-process the text for breaks and pauses
  const processedText = processTextForSpeech(text, voicePreset);
  
  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(processedText);
  
  // Get available voices and try to find a suitable one for the language
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = findVoiceForLanguage(voices, languageCode);
  
  if (matchingVoice) {
    utterance.voice = matchingVoice;
    utterance.lang = languageCode;
  }
  
  // Apply robot voice effects from the selected preset
  utterance.rate = voicePreset.settings.rate;
  utterance.pitch = voicePreset.settings.pitch;
  utterance.volume = volume / 100; // Convert to 0-1 range
  
  // Speak the text
  window.speechSynthesis.speak(utterance);
}

/**
 * Process text for speech synthesis, adding pauses and breaks
 * 
 * @param {string} text - Original text
 * @param {Object} voicePreset - Voice preset configuration
 * @returns {string} - Processed text
 */
function processTextForSpeech(text, voicePreset) {
  // First handle any SSML-style break tags for pauses between sentences
  let processedText = text.replace(/<break\s+time="(\d+)s"\s*\/>/gi, (match, seconds) => {
    // Replace with appropriate pauses based on voice preset
    const pauseCount = parseInt(seconds) * 2; // Double for emphasis
    return ".".repeat(pauseCount);
  });
  
  // Add word pauses if the preset uses them
  if (voicePreset.settings.useWordPauses) {
    const pauseChar = voicePreset.settings.wordPauseChar || '.';
    processedText = processedText.split(' ').join(pauseChar + ' ');
  }
  
  // Special handling for the word "while" - add emphasis with pauses
  if (processedText.includes(' while ')) {
    processedText = processedText.replace(' while ', ' ... while ... ');
  }
  
  return processedText;
}

/**
 * Find an appropriate voice for the given language
 * 
 * @param {Array} voices - Available speech synthesis voices
 * @param {string} languageCode - Language code to match
 * @returns {SpeechSynthesisVoice|null} - Matching voice or null
 */
function findVoiceForLanguage(voices, languageCode) {
  if (!voices || voices.length === 0) return null;
  
  // Try exact match first
  let voice = voices.find(v => v.lang === languageCode);
  
  // If no exact match, try partial match (e.g., 'en' in 'en-US')
  if (!voice) {
    const langPrefix = languageCode.split('-')[0];
    voice = voices.find(v => v.lang.startsWith(langPrefix));
  }
  
  // Fall back to any voice as a last resort
  if (!voice && voices.length > 0) {
    voice = voices[0];
  }
  
  return voice;
}

/**
 * Preload voices to ensure they're available when needed
 * Call this early in application initialization
 */
export function preloadVoices() {
  if (!window.speechSynthesis) return;
  
  // This forces the browser to load the available voices
  window.speechSynthesis.getVoices();
  
  // Some browsers need an event listener
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}