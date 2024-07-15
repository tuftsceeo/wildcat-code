import PropTypes from "prop-types";
import React from "react";
import "./motor-controls.css";

export const MotorControls = ({
  choice,
  className,
  overlapGroupClassName,
  overlapClassName,
  overlapClassNameOverride,
  activeMotorClassName,
  text = "image.png",
  divClassName,
}) => {
  return (
    <div className={`motor-controls ${className}`}>
      <div className={`active-motor ${choice} ${activeMotorClassName}`}>
        <div className={`overlap-group-2 ${overlapGroupClassName}`}>
          <img className="selection" alt="Selection" src={choice === "go" ? "selection.svg" : undefined} />
          <img className="text" alt="Text" src={choice === "go" ? text : undefined} />
          <div className="center" />
          <img className="polygon" alt="Polygon" src={choice === "go" ? "polygon-5.svg" : undefined} />
        </div>
      </div>
      <div className="active-rotations">
        <div className={`group-wrapper choice-4-${choice} ${overlapClassName}`}>
          <div className="group">
            <div className="div-wrapper">
              <div className={`text-wrapper-2 ${divClassName}`}>#</div>
            </div>
          </div>
        </div>
      </div>
      <div className="active-GO">
        <div className={`overlap-2 choice-7-${choice} ${overlapClassNameOverride}`}>
          <div className="text-wrapper-3">GO</div>
        </div>
      </div>
    </div>
  );
};

MotorControls.propTypes = {
  choice: PropTypes.oneOf(["go", "default"]),
  text: PropTypes.string,
};