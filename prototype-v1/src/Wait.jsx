import PropTypes from "prop-types";
import React from "react";
import "./wait.css";

export const Wait = ({ activity, className }) => {
  return (
    <div className={`wait ${className}`}>
      <div className="overlap-4">
        <div className="group-3">
          <div className="overlap-group-4">
            <div className="text-wrapper-4">#</div>
          </div>
        </div>
        <div className="wait-icon">
          <img className="group-4" alt="Group" />
        </div>
      </div>
    </div>
  );
};

Wait.propTypes = {
  activity: PropTypes.oneOf(["default"]),
};