import PropTypes from "prop-types";
import React from "react";
import "./speed.css";

export const Speed = ({ property1, className, vector = "vector-3.svg", img = "vector-2.svg" }) => {
  return (
    <div className={`speed ${className}`}>
      <div className="group-2">
        <div className={`rectangle ${property1}`} />
        <div className={`rectangle-2 property-1-${property1}`} />
        <div className={`rectangle-3 property-1-0-${property1}`} />
        <div className={`rectangle-4 property-1-1-${property1}`} />
      </div>
      <img className="vector" alt="Vector" src={property1 === "three" ? img : vector} />
    </div>
  );
};

Speed.propTypes = {
  property1: PropTypes.oneOf(["three", "inactive"]),
  vector: PropTypes.string,
  img: PropTypes.string,
};