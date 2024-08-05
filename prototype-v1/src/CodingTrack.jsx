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
import { KnobProvider, useKnobContext } from './KnobContext.js';

const ItemType = {
  SENSOR_ICON: 'sensorIcon',
  MOTOR_DASH: 'motorDash',
};

const CodingTrackContent = ({ setPyCode, setCanRun }) => {
  const [droppedItems, setDroppedItems] = useState([]);
  const [onTrack, setOnTrack] = useState(dndLabeled);
  const [codeString, setCodeString] = useState([codeTrackEmpty, codeTrackEmpty, codeTrackEmpty]);
  const [slotImage, setSlotImage] = useState(codeTrackEmpty);
  const [currSlot, setCurrSlot] = useState(0);
  const { knobAngles } = useKnobContext();
  const [codeDictionary, setCodeDictionary] = useState([]);
  const codeDictionaryRef = useRef(codeDictionary);


  useEffect(() => {
    console.log("code dict update " + codeDictionary);
  }, [codeDictionary]);

  useEffect(() => {
    console.log("Python code dictionary update! " + codeDictionary.toString());
    setPyCode(codeDictionary.toString());
  }, [codeDictionary, setPyCode]);

  useEffect(() => {
    codeDictionaryRef.current = codeDictionary; // Update the ref whenever currentColor changes
    // console.log("Updated color sensor: " + currentColor);
  }, [codeDictionary]);


  const handleBack = () => {
    setCurrSlot((prevSlot) => {
      const newSlot = prevSlot - 1;
      // console.log(`Navigating back to slot: ${newSlot}`);
      setSlotImage(codeString[newSlot]);
      return newSlot;
    });
  };

  const handleForward = () => {
    setCurrSlot((prevSlot) => {
      const newSlot = prevSlot + 1;
      // console.log(`Navigating forward to slot: ${newSlot}`);
      setSlotImage(codeString[newSlot]);
      return newSlot;
    });
  };

  const modifyCode = (newImg) => {
    setCodeString((prevCodeString) => {
      const updatedCodeString = [...prevCodeString];
      updatedCodeString[currSlot] = newImg;
      // console.log(`Code string updated at slot ${currSlot}: ${newImg}`);
      return updatedCodeString;
    });
  };


  const [{ isOver }, drop] = useDrop({
    accept: [ItemType.SENSOR_ICON, ItemType.MOTOR_DASH],
    drop: (item) => {
      const updatedCodeDictionary = [...codeDictionary];
      setDroppedItems((prevItems) => {
        console.log("WE setting dropped items..");
        if (item.type === ItemType.MOTOR_DASH) {
          if (
            prevItems.length > 0 &&
            prevItems.some((prevItem) => prevItem.type === ItemType.MOTOR_DASH)
          ) {
            setOnTrack(twoMotors);
            modifyCode(codeTrackTwoMotors);
            setSlotImage(codeTrackTwoMotors);
            if (updatedCodeDictionary[currSlot] != undefined) {
              updatedCodeDictionary[currSlot] = 
              updatedCodeDictionary[currSlot] 
              + ", [motor" + item.port + "-" + 
              item.selectedButtonRef.current + item.knobAngle + "]";
            } else {
              console.log("undefined case");
              updatedCodeDictionary[currSlot] = 
              (currSlot + 1) + ": [motor" + item.port + "-" + 
              item.selectedButtonRef.current + item.knobAngle + "]";
            }

          } else {
            console.log("One motor case? - currSlot+1" + (currSlot + 1));
            setOnTrack(oneMotor);
            modifyCode(codeTrackOneMotor);
            setSlotImage(codeTrackOneMotor);
            updatedCodeDictionary[currSlot] = 
            (currSlot + 1) + ": [motor" + item.port + "-" + 
            item.selectedButtonRef.current + item.knobAngle + "]";
          }
        } else if (item.type === ItemType.SENSOR_ICON) {
          // console.log('Dropped item currentColor:', item.currentColorRef.current);
          updatedCodeDictionary[currSlot] = 
          (currSlot + 1) + ": [ColorSensor" + "-" + item.currentColorRef.current + "]";
          setOnTrack(oneSensor);
          modifyCode(codeTrackSensor);
          setSlotImage(codeTrackSensor);
        }
        const audio = new Audio(deepPop);
        audio.play();
        setCodeDictionary(updatedCodeDictionary);
        setCanRun(updatedCodeDictionary.length >= 3);
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

const CodingTrack = ({ setPyCode, setCanRun }) => (
  <KnobProvider>
    <CodingTrackContent setPyCode={setPyCode} setCanRun={setCanRun}/>
  </KnobProvider>
);

export default CodingTrack;




