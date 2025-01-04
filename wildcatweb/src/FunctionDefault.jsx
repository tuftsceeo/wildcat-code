import React, { useState, useEffect } from 'react';
import styles from './FunctionDefault.module.css';
import { MotorDash } from './MotorDash.jsx';
import { TimeDash } from './TimeDash.jsx';
import highPop from './assets/bubble-sound.mp3';

const CONTROL_TYPES = {
  action: {
    motor: {
      name: 'Motor Control',
      component: MotorDash
    }
  },
  input: {
    time: {
      name: 'Time Control',
      component: TimeDash
    }
  }
};

export const FunctionDefault = ({ currSlotNumber, onSlotUpdate, slotData }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSubtype, setSelectedSubtype] = useState(null);
  const [dashboardConfig, setDashboardConfig] = useState(null);

  useEffect(() => {
    const currentSlotData = slotData?.[currSlotNumber];
    if (currentSlotData) {
      setSelectedType(currentSlotData.type);
      setSelectedSubtype(currentSlotData.subtype);
      setDashboardConfig(currentSlotData.configuration);
    } else {
      setDashboardConfig(null);
    }
  }, [currSlotNumber, slotData]);

  const handleTypeSelect = (type) => {
    // Only switch if clicking the unselected type
    if (type !== selectedType) {
      setSelectedType(type);
      setSelectedSubtype(null);
      setDashboardConfig(null);
    }
    // Clicking already selected type does nothing
  };

  const handleSubtypeSelect = (subtype) => {
    // Simply set the subtype, no toggling
    setSelectedSubtype(subtype);
    setDashboardConfig(null);
  };

  const handleDashboardUpdate = (config) => {
    setDashboardConfig(config);
  };

  const handleCommitToSlot = () => {
    if (selectedType && selectedSubtype && dashboardConfig) {
      // Play sound only after confirming we have valid data to save
      const audio = new Audio(highPop);
      audio.play();
      
      onSlotUpdate({
        type: selectedType,
        subtype: selectedSubtype,
        configuration: dashboardConfig
      });
    }
  };

  return (
    <div className={styles.hubTopBackground}>
      <img
        className={styles.outline}
        src={require('./assets/outline-function-hub.png')}
        alt="Function Hub outline"
      />
      <div className={styles.functionHubText}>function hub</div>
      
      {/* Keep original button group structure */}
      <div className={styles.actionSenseButtonGroup}>
        <div className={styles.actionButton}>
          <button
            className={`${styles.actionButtonChild} ${selectedType === 'action' ? styles.active : ''}`}
            onClick={() => handleTypeSelect('action')}
          >
            ACTION
          </button>
        </div>
        <div className={styles.orText}>or</div>
        <div className={styles.senseButton}>
          <button
            className={`${styles.actionButtonChild} ${selectedType === 'input' ? styles.active : ''}`}
            onClick={() => handleTypeSelect('input')}
          >
            INPUT
          </button>
        </div>
      </div>

      {/* Subtype selection below action/input */}
      {selectedType && (
        <div className={styles.subtypeSelection}>
          {Object.entries(CONTROL_TYPES[selectedType]).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleSubtypeSelect(key)}
              className={`${styles.subtypeButton} ${selectedSubtype === key ? styles.active : ''}`}
            >
              {value.name}
            </button>
          ))}
        </div>
      )}

      {/* Dashboard display */}
      {selectedType && selectedSubtype && (
        <div className={styles.dashboardContainer}>
          {React.createElement(CONTROL_TYPES[selectedType][selectedSubtype].component, {
            onUpdate: handleDashboardUpdate,
            configuration: dashboardConfig
          })}
          {dashboardConfig && (  // Only show save button if we have a configuration
            <button 
              className={styles.commitButton}
              onClick={handleCommitToSlot}
            >
              Save to Step {currSlotNumber + 1}
            </button>
          )}
        </div>
      )}
    </div>
  );
};