import React from "react";
import styles from "./SensorDash.module.css";

export const ColorSensorButtons = ({ color, children, onClick }) => {
    return (
        <button
            className={styles.colorButton}
            style={{
                backgroundColor: color,
                borderColor:
                    color === "#FFFFFF" ? "var(--color-gray-600)" : color,
                boxShadow: color === "#FFFFFF" ? "none" : `0 0 5px ${color}`,
            }}
            onClick={onClick}
        >
            {children}
        </button>
    );
};
