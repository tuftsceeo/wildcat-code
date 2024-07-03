import React, { useState, useEffect, useRef } from 'react';
import './Knob.css';
import { Switch } from '@mui/material';
import { FormGroup } from '@mui/material';
import { FormControlLabel } from '@mui/material';

const KnobComponent = () => {
  const [angle, setAngle] = useState(0);
  const [lockScrollAngle, setLockScrollAngle] = useState(0);
  const [freeScroll, setFreeScroll] = useState(false);
  const knobRef = useRef(null);
  const startAngle = useRef(0);
  const startRotation = useRef(0);
  const angleRef = useRef(angle);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = knobRef.current.getBoundingClientRect();
    startAngle.current = getAngle(e.clientX, e.clientY, rect);
    startRotation.current = angle;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const rect = knobRef.current.getBoundingClientRect();
    const newAngle = getAngle(e.clientX, e.clientY, rect);
    const angleDelta = newAngle - startAngle.current;
    const updatedAngle = startRotation.current + angleDelta;
    setAngle(updatedAngle);
    angleRef.current = updatedAngle;
    console.log("Mouse Move -> New Angle:", newAngle, "Angle Delta:", angleDelta, "Updated Angle:", updatedAngle);
  };

  const handleMouseUp = () => {
    console.log("Mouse Up -> Current Angle:", angleRef.current);
    if (!freeScroll) {
      const normalizedAngle = (angleRef.current % 360 + 360) % 360; // Normalize angle to 0-360
      console.log("Mouse Up -> Normalized Angle:", normalizedAngle);
      const snappedAngle = snapAngle(normalizedAngle);
      console.log("Mouse Up -> Snapped Angle:", snappedAngle);
      setAngle(snappedAngle);
    }
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const getAngle = (x, y) => {
    const rect = knobRef.current.getBoundingClientRect();
    const knobX = rect.left + rect.width / 2;
    const knobY = rect.top + rect.height / 2;
    const radians = Math.atan2(y - knobY, x - knobX);
    let degrees = radians * (180 / Math.PI);
    degrees = degrees < 0 ? degrees + 360 : degrees; // Ensure degrees are in the range 0-360
    return degrees;
  };

  const handleFreeScrollChange = (event) => {
    setFreeScroll(event.target.checked);
  };

  const snapAngle = (angle) => {
    const snapPoints = [0, 90, 180, 270, 360];
    return snapPoints.reduce((prev, curr) =>
      Math.abs(curr - angle) < Math.abs(prev - angle) ? curr : prev
    );
  };

  return (
    <><div className="grid-container">
      <div className="knob-mark" />
      <div
        ref={knobRef}
        className="knob"
        style={{ transform: `rotate(${angle}deg)` }}
        onMouseDown={handleMouseDown}
      >
      </div>
    </div><div> <FormGroup> <FormControlLabel control={<Switch onChange={handleFreeScrollChange} />} label="Free scroll" /> </FormGroup> </div></>
  );
};

export default KnobComponent;
