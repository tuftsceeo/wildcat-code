import React, { useState, useEffect, useCallback } from 'react';
import styles from './FunctionDefault.module.css';
import { MotorDash } from './MotorDash.jsx';
import { TimeDash } from './TimeDash.jsx';
import { Check, Plus } from 'lucide-react';

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
  const [lastSavedConfig, setLastSavedConfig] = useState(null);

  // Reset state when slot number changes
  useEffect(() => {
    const currentSlotData = slotData?.[currSlotNumber];
    if (currentSlotData) {
      setSelectedType(currentSlotData.type);
      setSelectedSubtype(currentSlotData.subtype);
      setDashboardConfig(currentSlotData.configuration);
      setLastSavedConfig(currentSlotData.configuration);
    } else {
      setDashboardConfig(null);
      setLastSavedConfig(null);
    }
  }, [currSlotNumber, slotData]);

  // Auto-save when configuration changes
  useEffect(() => {
    if (!dashboardConfig) return;
    
    // Check if the configuration has actually changed
    if (JSON.stringify(dashboardConfig) !== JSON.stringify(lastSavedConfig)) {
      console.log('Configuration changed, auto-saving...');
      
      if (selectedType && selectedSubtype) {
        onSlotUpdate({
          type: selectedType,
          subtype: selectedSubtype,
          configuration: dashboardConfig
        });
        setLastSavedConfig(dashboardConfig);
      }
    }
  }, [dashboardConfig, lastSavedConfig, selectedType, selectedSubtype, onSlotUpdate]);

  const handleDashboardUpdate = useCallback((config) => {
    setDashboardConfig(config);
  }, []);

  const handleTypeSelect = (type) => {
    if (type !== selectedType) {
      setSelectedType(type);
      setSelectedSubtype(null);
      setDashboardConfig(null);
      setLastSavedConfig(null);
    }
  };

  const handleSubtypeSelect = (subtype) => {
    setSelectedSubtype(subtype);
    setDashboardConfig(null);
    setLastSavedConfig(null);
  };

  return (
    <div className={styles.hubTopBackground}>
      <img
        className={styles.outline}
        src={require('./assets/outline-function-hub.png')}
        alt="Function Hub outline"
      />
      <div className={styles.functionHubText}>function hub</div>
      
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

      {selectedType && selectedSubtype && (
        <div className={styles.dashboardContainer}>
          {React.createElement(CONTROL_TYPES[selectedType][selectedSubtype].component, {
            onUpdate: handleDashboardUpdate,
            configuration: dashboardConfig,
            slotData: slotData
          })}
          <div className={styles.saveIndicator}>
            {dashboardConfig && (
              JSON.stringify(dashboardConfig) === JSON.stringify(lastSavedConfig) ? (
                <div className={styles.savedState}>
                  <Check className={styles.checkIcon} size={24} color="#4CAF50"/>
                  <span>Saved to Step {currSlotNumber + 1}</span>
                </div>
              ) : (
                <div className={styles.unsavedState}>
                  <Plus className={styles.plusIcon} size={24} color="#9E9E9E"/>
                  <span>Unsaved changes</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};