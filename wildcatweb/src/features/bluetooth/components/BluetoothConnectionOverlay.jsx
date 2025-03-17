/**
 * @file BluetoothConnectionOverlay.jsx
 * @description A simplified overlay prompt for Bluetooth connection with minimal text
 * and a help option for additional instructions. Optimized for children with autism
 * using icons for better comprehension.
 */

import React, { useState } from 'react';
import { 
  X, 
  BluetoothSearching, 
  HelpCircle, 
  Bluetooth, 
  Laptop, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import Portal from '../../../common/components/Portal';
import styles from '../styles/BluetoothConnectionOverlay.module.css';

/**
 * Overlay component for prompting Bluetooth connection with minimal text
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onConnect - Callback function when connect button is clicked
 * @param {Function} props.onClose - Callback function when close button is clicked
 * @returns {JSX.Element} Overlay component
 */
const BluetoothConnectionOverlay = ({ onConnect, onClose }) => {
    // State to track if help instructions are showing
    const [showHelp, setShowHelp] = useState(false);

    /**
     * Toggle help instructions visibility
     */
    const toggleHelp = () => {
        setShowHelp(!showHelp);
    };

    return (
        <Portal>
            <div className={styles.overlayContainer}>
                <div 
                    className={styles.overlay} 
                    role="dialog" 
                    aria-labelledby="bluetooth-overlay-title"
                >
                    <div className={styles.overlayHeader}>
                        <button 
                            className={styles.closeButton} 
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className={styles.overlayContent}>
                        <div className={styles.bluetoothIcon}>
                            <BluetoothSearching size={80} />
                        </div>
                        
                        {!showHelp ? (
                            // Main simple view
                            <>
                                <h2 className={styles.overlayTitle} id="bluetooth-overlay-title">
                                    Connect Robot
                                </h2>
                                
                                <div className={styles.buttonsContainer}>
                                    <button 
                                        className={styles.connectButton} 
                                        onClick={onConnect}
                                    >
                                        <Bluetooth size={20} />
                                        <span>Connect</span>
                                    </button>
                                    
                                    <button 
                                        className={styles.helpButton} 
                                        onClick={toggleHelp}
                                        aria-label="Show connection help"
                                    >
                                        <HelpCircle size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            // Help instructions view
                            <div className={styles.helpInstructions}>
                                <h3 className={styles.helpTitle}>How to Connect</h3>
                                
                                <ol className={styles.stepsList}>
                                    <li className={styles.step}>
                                        <div className={styles.stepIcon}><span>1</span></div>
                                        <div className={styles.stepContent}>
                                            <span className={styles.stepIconWrapper}>
                                                <Bluetooth size={20} />
                                            </span>
                                            <span>Press the Bluetooth button on your robot</span>
                                        </div>
                                    </li>
                                    
                                    <li className={styles.step}>
                                        <div className={styles.stepIcon}><span>2</span></div>
                                        <div className={styles.stepContent}>
                                            <span>Click</span>
                                            <button 
                                                className={styles.inlineConnectButton} 
                                                onClick={onConnect}
                                            >
                                                <Bluetooth size={16} />
                                                <span>Connect</span>
                                            </button>
                                            <span>then select your robot from the list</span>
                                        </div>
                                    </li>
                                    
                                    <li className={styles.step}>
                                        <div className={styles.stepIcon}><span>3</span></div>
                                        <div className={styles.stepContent}>
                                            <span className={styles.stepIconWrapper}>
                                                <Check size={20} />
                                            </span>
                                            <span>Click "Pair" on your browser</span>
                                        </div>
                                    </li>
                                </ol>
                                
                                <button 
                                    className={styles.backButton} 
                                    onClick={toggleHelp}
                                >
                                    <ArrowRight size={16} className={styles.backIcon} />
                                    <span>Back</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default BluetoothConnectionOverlay;