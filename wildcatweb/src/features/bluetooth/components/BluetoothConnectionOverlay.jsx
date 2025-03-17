/**
 * @file BluetoothConnectionOverlay.jsx
 * @description A persistent overlay prompt for Bluetooth connection with minimal text
 * and a help option for additional instructions. Optimized for children with autism
 * using icons for better comprehension. Can only be dismissed by connecting to a robot
 * or using a hidden developer shortcut (holding ESC for 5 seconds).
 */

import React, { useState, useEffect } from 'react';
import { 
  BluetoothSearching, 
  Bluetooth, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import { ReactComponent as QuestionMark } from '../../../assets/images/question-mark.svg';
import Portal from '../../../common/components/Portal';
import styles from '../styles/BluetoothConnectionOverlay.module.css';

/**
 * Overlay component for prompting Bluetooth connection with minimal text
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onConnect - Callback function when connect button is clicked
 * @param {Function} props.onClose - Callback function when close button is clicked (developer escape)
 * @returns {JSX.Element} Overlay component
 */
const BluetoothConnectionOverlay = ({ onConnect, onClose }) => {
    // State to track if help instructions are showing
    const [showHelp, setShowHelp] = useState(false);
    // State to track ESC key press time for hidden developer exit
    const [escKeyPressed, setEscKeyPressed] = useState(false);
    const [escHoldTimer, setEscHoldTimer] = useState(null);
    
    // Set up event listeners for hidden developer escape method
    useEffect(() => {
        // Function to handle key down event
        const handleKeyDown = (e) => {
            // Check if Escape key is pressed
            if (e.key === 'Escape' && !escKeyPressed) {
                setEscKeyPressed(true);
                
                // Start a timer - if ESC is held for 5 seconds, close the overlay
                const timer = setTimeout(() => {
                    console.log('Developer escape activated');
                    onClose();
                }, 5000);
                
                setEscHoldTimer(timer);
            }
        };
        
        // Function to handle key up event
        const handleKeyUp = (e) => {
            if (e.key === 'Escape') {
                setEscKeyPressed(false);
                
                // Clear the timer if ESC is released before 5 seconds
                if (escHoldTimer) {
                    clearTimeout(escHoldTimer);
                    setEscHoldTimer(null);
                }
            }
        };
        
        // Add event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        // Clean up event listeners
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            
            // Clear timer if component unmounts
            if (escHoldTimer) {
                clearTimeout(escHoldTimer);
            }
        };
    }, [escKeyPressed, escHoldTimer, onClose]);

    /**
     * Toggle help instructions visibility
     */
    const toggleHelp = () => {
        setShowHelp(!showHelp);
    };
    
    /**
     * Prevent clicks from propagating outside the overlay
     * @param {Event} e - Click event
     */
    const preventPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <Portal>
            <div className={styles.overlayContainer} onClick={preventPropagation}>
                <div 
                    className={styles.overlay} 
                    role="dialog" 
                    aria-labelledby="bluetooth-overlay-title"
                >
                    {/* Removed header with close button */}
                    
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
                                        <QuestionMark width={20} height={20} />
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