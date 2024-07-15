import PropTypes from "prop-types";
import React from "react";
import "./sound.css";

export const Sound = ({ chosen, className }) => {
  return (
    <div className={`sound ${className}`}>
      <div className="overlap-group-wrapper">
        <div className="overlap-group-3">
          <img className="img" alt="Group" />
          <img className="paw" alt="Paw" />
        </div>
      </div>
      <div className="overlap-group-wrapper">
        <div className="overlap-3">
          <img className="img" alt="Group" />
          <img className="union" alt="Union" />
        </div>
      </div>
      <div className="overlap-group-wrapper">
        <div className="overlap-3">
          <img className="img" alt="Group" />
          <img className="vector-2" alt="Vector" />
        </div>
      </div>
    </div>
  );
};

Sound.propTypes = {
  chosen: PropTypes.oneOf(["default"]),
};