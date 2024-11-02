// Import necessary modules and assets
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
import deepPop from './assets/infographic-pop.mp3';
import { KnobProvider, useKnobContext } from './KnobContext.js';

// Define draggable item types
const ItemType = {
  SENSOR_ICON: 'sensorIcon',
  MOTOR_DASH: 'motorDash',
};

// Define main content for CodingTrack component
const CodingTrackContent = ({ setPyCode, setCanRun, currSlotNumber, setCurrSlotNumber, missionSteps}) => {
  // State to track dropped items and drag-and-drop status
  const [droppedItems, setDroppedItems] = useState([]);
  const [onTrack, setOnTrack] = useState(dndLabeled);
  const [codeString, setCodeString] = useState([codeTrackEmpty, codeTrackEmpty, codeTrackEmpty]);
  const [slotImage, setSlotImage] = useState(codeTrackEmpty);
  const [currSlot, setCurrSlot] = useState(0); // Current slot in the coding track
  const { knobAngles } = useKnobContext(); // Context for knob angles
  const [codeDictionary, setCodeDictionary] = useState([]); // Dictionary to store code structure
  const codeDictionaryRef = useRef(codeDictionary); // Ref to maintain latest code dictionary

  // Effect to log and update code dictionary
  useEffect(() => {
    console.log("code dict update " + codeDictionary);
  }, [codeDictionary]);

  // Effect to update pyCode whenever codeDictionary changes
  useEffect(() => {
    console.log("Python code dictionary update! " + codeDictionary.toString());
    setPyCode(codeDictionary.toString());
  }, [codeDictionary, setPyCode]);

  // Update code dictionary ref on change
  useEffect(() => {
    codeDictionaryRef.current = codeDictionary;
  }, [codeDictionary]);

  // Navigate to previous slot in the code track
  const handleBack = () => {
    setCurrSlot((prevSlot) => {
      const newSlot = prevSlot - 1;
      setSlotImage(codeString[newSlot]);
      setCurrSlotNumber((prevSlot) => Math.max(prevSlot - 1, 0));
      return newSlot;
    });
  };

  // Navigate to next slot in the code track
  const handleForward = () => {
    setCurrSlot((prevSlot) => {
      const newSlot = prevSlot + 1;
      setSlotImage(codeString[newSlot]);
      setCurrSlotNumber((prevSlot) => Math.min(prevSlot + 1, missionSteps));
      return newSlot;
    });
  };

  // Update code string at the current slot with a new image
  const modifyCode = (newImg) => {
    setCodeString((prevCodeString) => {
      const updatedCodeString = [...prevCodeString];
      updatedCodeString[currSlot] = newImg;
      return updatedCodeString;
    });
  };

  // Set up the drop area for draggable items
  const [{ isOver }, drop] = useDrop({
    accept: [ItemType.SENSOR_ICON, ItemType.MOTOR_DASH],
    drop: (item) => {
      const updatedCodeDictionary = [...codeDictionary];
      setDroppedItems((prevItems) => {
        console.log("Setting dropped items..");
        
        if (item.type === ItemType.MOTOR_DASH) {
          // Handle case for one or two motors dropped on the coding track
          if (prevItems.length > 0 && prevItems.some((prevItem) => prevItem.type === ItemType.MOTOR_DASH)) {
            // Case for two motors
            setOnTrack(twoMotors);
            modifyCode(codeTrackTwoMotors);
            setSlotImage(codeTrackTwoMotors);
            updatedCodeDictionary[currSlot] = 
              (updatedCodeDictionary[currSlot] ?? `${currSlot + 1}: `) + `[motor${item.port}-${item.selectedButtonRef.current}${item.knobAngle}]`;
          } else {
            // Case for one motor
            setOnTrack(oneMotor);
            modifyCode(codeTrackOneMotor);
            setSlotImage(codeTrackOneMotor);
            updatedCodeDictionary[currSlot] = 
              `${currSlot + 1}: [motor${item.port}-${item.selectedButtonRef.current}${item.knobAngle}]`;
          }
        } else if (item.type === ItemType.SENSOR_ICON) {
          // Case for sensor icon
          updatedCodeDictionary[currSlot] = 
            `${currSlot + 1}: [ColorSensor-${item.currentColorRef.current}]`;
          setOnTrack(oneSensor);
          modifyCode(codeTrackSensor);
          setSlotImage(codeTrackSensor);
        }

        // Play sound and update code dictionary
        const audio = new Audio(deepPop);
        audio.play();
        setCodeDictionary(updatedCodeDictionary);
        setCanRun(updatedCodeDictionary.length >= 3); // Enable run button if track is sufficiently populated
        return prevItems.length < missionSteps ? [...prevItems, item] : prevItems;
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Disable navigation buttons at boundaries
  const isNextButtonDisabled = currSlot >= missionSteps;
  const isPrevButtonDisabled = currSlot <= 0;

  // Render JSX layout for coding track
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

// Main CodingTrack component with KnobProvider
const CodingTrack = ({ setPyCode, setCanRun, currSlotNumber, setCurrSlotNumber, missionSteps  }) => (
  <KnobProvider>
    <CodingTrackContent setPyCode={setPyCode} setCanRun={setCanRun} currSlotNumber={currSlotNumber} setCurrSlotNumber={setCurrSlotNumber} missionSteps={missionSteps}/>
  </KnobProvider>
);

export default CodingTrack;
