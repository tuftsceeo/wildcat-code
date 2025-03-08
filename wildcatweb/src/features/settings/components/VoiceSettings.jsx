/**
 * @file VoiceSettings.jsx
 * @description Component for selecting robot voice options with playable previews
 * to help students with reading challenges or who prefer auditory learning.
 * Supports multiple languages.
 */

import React, { useState, useEffect } from "react";
import { useCustomization } from "../CustomizationContext";
import { Volume2, VolumeX, Bot, Zap, Bird } from "lucide-react";
import styles from "../styles/VoiceSettings.module.css";
import { VOICE_PRESETS, speakWithRobotVoice } from "../utils/speechUtils";

/**
 * Voice settings component with selectable robot voice presets
 *
 * @component
 * @returns {JSX.Element} Voice settings interface
 */
const VoiceSettings = () => {
    // Get voice settings and language from context
    const { voice, setVoice, volume, setVolume, language } = useCustomization();

    // Set up language-specific content
    const isSpanish = language === "es";

    // Language-specific default preview text
    const defaultPreviewText = isSpanish
        ? "¡Así es como hablará tu robot! Haz clic en una voz para escuchar la diferencia."
        : "This is how your robot will talk. Click a voice to hear the difference.";

    // Preview text state and current voice preset state
    const [previewText, setPreviewText] = useState(defaultPreviewText);
    const [currentPreset, setCurrentPreset] = useState(
        VOICE_PRESETS.find((preset) => preset.id === voice) || VOICE_PRESETS[0],
    );

    // Function to render the appropriate Lucide icon based on iconName
    const renderIcon = (iconName) => {
        switch (iconName) {
            case "Bot":
                return (
                    <Bot
                        size={24}
                        strokeWidth={2.75}
                    />
                );
            case "Zap":
                return (
                    <Zap
                        size={24}
                        strokeWidth={2.75}
                    />
                );
            case "Bird":
                return (
                    <Bird
                        size={24}
                        strokeWidth={2.75}
                    />
                );
            default:
                return (
                    <Bot
                        size={24}
                        strokeWidth={2.75}
                    />
                );
        }
    };

    // Update current preset when voice changes
    useEffect(() => {
        const matchingPreset = VOICE_PRESETS.find(
            (preset) => preset.id === voice,
        );
        if (matchingPreset) {
            setCurrentPreset(matchingPreset);
        }
    }, [voice]);

    // Update preview text when language changes
    useEffect(() => {
        setPreviewText(defaultPreviewText);
    }, [language, defaultPreviewText]);

    /**
     * Play speech sample with the selected voice preset
     *
     * @param {Object} preset - The voice preset to use
     */
    const handlePlaySample = (preset) => {
        // Set language code based on current language setting
        const languageCode = isSpanish ? "es-ES" : "en-US";

        // Use the speakWithRobotVoice utility with the current language
        speakWithRobotVoice(previewText, preset.id, volume, languageCode);
    };

    /**
     * Select a voice preset
     *
     * @param {Object} preset - The voice preset to select
     */
    const handleSelectVoice = (preset) => {
        setVoice(preset.id);
        handlePlaySample(preset);
    };

    /**
     * Handle volume change from slider
     *
     * @param {Event} e - Slider change event
     */
    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value, 10);
        setVolume(newVolume);
    };

    /**
     * Play a sample of the current voice
     */
    const handlePlayCurrentVoice = () => {
        handlePlaySample(currentPreset);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                {isSpanish ? "Voces de Robot" : "Robot Voices"}
            </h2>

            <div className={styles.previewContainer}>
                <div className={styles.previewTitle}>
                    <span>{isSpanish ? "Vista Previa" : "Preview Voice"}</span>
                    <button
                        className={styles.playButton}
                        onClick={handlePlayCurrentVoice}
                        aria-label={
                            isSpanish
                                ? "Reproducir muestra"
                                : "Play sample with current voice"
                        }
                    >
                        <Volume2 size={20} />
                        <span>{isSpanish ? "REPRODUCIR" : "PLAY"}</span>
                    </button>
                </div>

                <div className={styles.previewBox}>
                    <p className={styles.previewText}>{previewText}</p>
                </div>
            </div>

            <div className={styles.voiceOptions}>
                <h3 className={styles.sectionTitle}>
                    {isSpanish
                        ? "Elige Tu Voz de Robot"
                        : "Choose Your Robot Voice"}
                </h3>

                <div className={styles.voiceCards}>
                    {VOICE_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            className={`${styles.voiceCard} ${
                                voice === preset.id ? styles.selectedVoice : ""
                            }`}
                            onClick={() => handleSelectVoice(preset)}
                            style={{ borderColor: preset.color }}
                        >
                            <div
                                className={styles.voiceIcon}
                                style={{ backgroundColor: preset.color }}
                            >
                                {renderIcon(preset.iconName)}
                            </div>
                            <div className={styles.voiceInfo}>
                                <div className={styles.voiceName}>
                                    {preset.name}
                                </div>
                                <div className={styles.voiceDescription}>
                                    {isSpanish
                                        ? getSpanishDescription(preset.id)
                                        : preset.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.volumeControl}>
                <h3 className={styles.sectionTitle}>
                    {isSpanish ? "Volumen" : "Volume"}
                </h3>

                <div className={styles.volumeSlider}>
                    <VolumeX size={20} />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                        className={styles.slider}
                        aria-label={
                            isSpanish ? "Volumen de voz" : "Voice volume"
                        }
                    />
                    <Volume2 size={20} />
                    <span className={styles.volumeValue}>{volume}%</span>
                </div>
            </div>
        </div>
    );
};

/**
 * Get Spanish descriptions for voice presets
 *
 * @param {string} voiceId - Voice preset ID
 * @returns {string} Spanish description
 */
function getSpanishDescription(voiceId) {
    switch (voiceId) {
        case "robot1":
            return "Robot amigable con voz clara";
        case "robot2":
            return "Robot enérgico con voz rápida";
        case "robot3":
            return "Robot agudo con pausas";
        default:
            return "Voz de robot";
    }
}

export default VoiceSettings;
