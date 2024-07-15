import PropTypes from "prop-types";
import React from "react";
import "./action-sense.css";

export const ActionSense = ({ selection, className }) => {
  return (
    <div className={`action-sense ${className}`}>
      <div className={`action-button ${selection}`}>
        <div className="overlap-group">
          <div className="text-wrapper">ACTION</div>
        </div>
      </div>
      <div className={`sense-button selection-1-${selection}`}>
        <div className="overlap">
          <div className="div">SENSE</div>
        </div>
      </div>
    </div>
  );
};

ActionSense.propTypes = {
  selection: PropTypes.oneOf(["sense", "action", "default"]),
};