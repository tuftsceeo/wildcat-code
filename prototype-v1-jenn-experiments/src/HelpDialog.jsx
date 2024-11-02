// HelpDialog.jsx
import React from 'react';
import styles from './HelpDialog.module.css';
import Portal from './Portal';

const HelpDialog = ({ currSlotNumber, close }) => {

        // Function to return help text based on the current slot
        const getHelpText = () => {
            switch (currSlotNumber) {
                case 0:
                    return "This is help text for Slot 1. Here’s what you can do in this slot...";
                case 1:
                    return "This is help text for Slot 2. Here's how to use the features in this slot...";
                case 2:
                    return "This is help text for Slot 3. You can do the following here...";
                default:
                    return "This is the default help text.";
            }
        };


    return (
        <Portal>
            {/* Dialog container */}
            <div className={styles.dialogBackground}>
                {/* Close button */}
                <button className={styles.closeButton} onClick={close}>
                    X
                </button>
                {/* Help text */}
                <div className={styles.dialogContent}>
                    <h2 className={styles.dialogTitle}>Need Help?</h2>
                    <p className={styles.dialogText}>{getHelpText()}</p>
                </div>
            </div>
        </Portal>
    );
};

export default HelpDialog;
