import React, { useState, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import styles from './CodingTrack.module.css';
import { ReactComponent as CodeSucker } from './assets/code-sucker.svg';
import codeTrackEmpty from './assets/code-track-empty.svg';
import codeTrackOneMotor from './assets/code-track-one-motor.svg';
import codeTrackTwoMotors from './assets/code-track-two-motors.svg';
import codeTrackSensor from './assets/code-track-sensor.svg';
import nextStepActive from './assets/next-step-active.svg';
import prevStepInactive from './assets/prev-step-inactive.svg';
import nextStepInactive from './assets/next-step-inactive.svg';
import prevStepActive from './assets/prev-step-active.svg';
import oneMotor from './assets/one-motor.svg';
import twoMotors from './assets/two-motors.svg';
import oneSensor from './assets/one-sensor.svg';
import dndLabeled from './assets/dnd-area.svg';
import dndEmpty from './assets/unlabeled-dnd-area.svg';
import { MotorDash } from './MotorDash.jsx';
import { SensorDash } from './SensorDash.jsx';
import deepPop from './assets/infographic-pop.mp3'

const ItemType = {
  SENSOR_ICON: 'sensorIcon',
  MOTOR_DASH: 'motorDash',
};

export const CodingTrack = () => {
  const [droppedItems, setDroppedItems] = useState([]);
  const [onTrack, setOnTrack] = useState(dndLabeled);
  const [codeString, setCodeString] = useState([codeTrackEmpty, codeTrackEmpty, codeTrackEmpty]);
  const [slotImage, setSlotImage] = useState(codeTrackEmpty);
  const [currSlot, setCurrSlot] = useState(0);

  useEffect(() => {
    setSlotImage(codeString[currSlot]);
    console.log(`Slot image updated to: ${codeString[currSlot]}`);
  }, [currSlot, codeString]);

  const handleBack = () => {
    setCurrSlot((prevSlot) => {
      const newSlot = prevSlot - 1;
      console.log(`Navigating back to slot: ${newSlot}`);
      setOnTrack(dndLabeled);
      return newSlot;
    });
  };

  const handleForward = () => {
    setCurrSlot((prevSlot) => {
      const newSlot = prevSlot + 1;
      console.log(`Navigating forward to slot: ${newSlot}`);
      setOnTrack(dndLabeled);
      return newSlot;
    });
  };

  const modifyCode = (newImg) => {
    setCodeString((prevCodeString) => {
      const updatedCodeString = [...prevCodeString];
      updatedCodeString[currSlot] = newImg;
      console.log(`Code string updated at slot ${currSlot}: ${newImg}`);
      return updatedCodeString;
    });
  };

  const [{ isOver }, drop] = useDrop({
    accept: [ItemType.SENSOR_ICON, ItemType.MOTOR_DASH],
    drop: (item) => {
      setDroppedItems((prevItems) => {
        if (item.type === ItemType.MOTOR_DASH) {
          if (
            prevItems.length > 0 &&
            prevItems.some((prevItem) => prevItem.type === ItemType.MOTOR_DASH)
          ) {
            setOnTrack(twoMotors);
            modifyCode(codeTrackTwoMotors);
          } else {
            setOnTrack(oneMotor);
            modifyCode(codeTrackOneMotor);
          }
        } else if (item.type === ItemType.SENSOR_ICON) {
          setOnTrack(oneSensor);
          modifyCode(codeTrackSensor);
        }
        const audio = new Audio(deepPop);
        audio.play();
        return prevItems.length < 2 ? [...prevItems, item] : prevItems;
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const isNextButtonDisabled = currSlot >= 2;
  const isPrevButtonDisabled = currSlot <= 0;

  return (
    <div className={styles.trackContainer}>
      <img ref={drop} src={onTrack} className={styles.dropTarget} alt="code" />
      <CodeSucker className={styles.codeSucker} />
      <img src={slotImage} className={styles.codeTrack} alt="code track" />
      <button className={styles.nextButton} disabled={isNextButtonDisabled} onClick={handleForward}>
        <img src={isNextButtonDisabled ? nextStepInactive : nextStepActive} alt="next" />
      </button>
      <button className={styles.prevButton} disabled={isPrevButtonDisabled} onClick={handleBack}>
        <img src={isPrevButtonDisabled ? prevStepInactive : prevStepActive} alt="prev" />
      </button>
    </div>
  );
};

export default CodingTrack;




