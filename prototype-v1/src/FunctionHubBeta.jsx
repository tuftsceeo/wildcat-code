import PropTypes from "prop-types";
import React from "react";
import { ActionSense } from "./ActionSense.jsx";
import { MotorControls } from "./MotorControls.jsx";
import { Sound } from "./Sound.jsx";
import { Speed } from "./Speed.jsx";
import { Wait } from "./Wait.jsx";
import "./style.css";

export const FunctionHubBeta= ({
  function1,
  className,
  motorControlsOverlapGroupClassName,
  motorControlsOverlapClassName,
  motorControlsOverlapClassNameOverride,
  speedVector,
  motorControlsOverlapGroupClassNameOverride,
  motorControlsDivClassName,
  motorControlsGroupWrapperClassName,
  speedImg,
}) => {
  return (
    <div className={`function-hub function-${function1} ${className}`}>
      <div className="overlap-5">
        <div className="action-sense-2">
          <div className="group-5">
            <div className="text-wrapper-5">function hub</div>
          </div>
          <img
            className="hub-top"
            alt="Hub top"
            src={
              function1 === "default"
                ? "hub-top-4.svg"
                : function1 === "go-a"
                ? "hub-top-2.svg"
                : function1 === "go-b"
                ? "hub-top.svg"
                : function1 === "function-6"
                ? "hub-top-3.svg"
                : function1 === "sense"
                ? "hub-top-5.svg"
                : undefined
            }
          />
        </div>
        {["default", "function-6", "go-a", "go-b", "sense"].includes(function1) && (
          <>
            <img
              className="hub-bottom"
              alt="Hub bottom"
              src={
                function1 === "default"
                  ? "hub-bottom-5.svg"
                  : function1 === "go-a"
                  ? "hub-bottom-3.svg"
                  : function1 === "go-b"
                  ? "hub-bottom-2.svg"
                  : function1 === "function-6"
                  ? "hub-bottom-4.svg"
                  : "hub-bottom.svg"
              }
            />
            <img
              className="hub-connect"
              alt="Hub connect"
              src={
                function1 === "default"
                  ? "hub-connect-5.svg"
                  : function1 === "go-a"
                  ? "hub-connect.svg"
                  : function1 === "go-b"
                  ? "hub-connect-4.svg"
                  : function1 === "function-6"
                  ? "hub-connect-3.svg"
                  : "hub-connect-2.svg"
              }
            />
          </>
        )}

        <ActionSense
          className="action-sense-instance"
          selection={function1 === "default" ? "default" : function1 === "sense" ? "sense" : "action"}
        />
        {["function-6", "go-a", "go-b"].includes(function1) && (
          <>
            <div className="text-wrapper-6">motor A</div>
            <MotorControls
              activeMotorClassName={`${function1 === "go-a" && "class-3"}`}
              choice={function1 === "go-a" ? "go" : "default"}
              className="motor-controls-instance"
              overlapClassName={`${
                function1 === "go-b" ? "class" : function1 === "function-6" ? "class-2" : "class-3"
              }`}
              overlapClassNameOverride={`${
                function1 === "go-b" ? "class-4" : function1 === "function-6" ? "class-5" : "class-3"
              }`}
              overlapGroupClassName={`${function1 === "go-b" && "class-6"} ${function1 === "function-6" && "class-7"}`}
            />
            <Speed
              className="speed-instance"
              img={function1 === "go-a" ? "vector.svg" : undefined}
              property1={function1 === "go-a" ? "three" : "inactive"}
              vector={function1 === "go-b" ? "vector-6.svg" : function1 === "function-6" ? "vector-7.svg" : undefined}
            />
            <div className="text-wrapper-7">motor B</div>
            <MotorControls
              choice={function1 === "go-a" ? "go" : "default"}
              className="instance-node"
              divClassName={`${function1 === "go-a" && "class-14"}`}
              overlapClassName={`${
                function1 === "go-b" ? "class-8" : function1 === "function-6" ? "class-9" : "class-10"
              }`}
              overlapClassNameOverride={`${
                function1 === "go-b" ? "class-11" : function1 === "function-6" ? "class-12" : "class-13"
              }`}
              overlapGroupClassName={`${function1 === "go-b" && "class-15"} ${
                function1 === "function-6" && "class-16"
              }`}
              text={function1 === "go-a" ? "text.png" : undefined}
            />
            <Speed
              className="speed-2"
              img={function1 === "go-a" ? "vector-2.svg" : undefined}
              property1={function1 === "go-a" ? "three" : "inactive"}
              vector={function1 === "go-b" ? "vector-8.svg" : function1 === "function-6" ? "vector-5.svg" : undefined}
            />
          </>
        )}

        {["function-6", "go-a", "go-b", "sense"].includes(function1) && (
          <img
            className="back"
            alt="Back"
            src={
              function1 === "go-b"
                ? "back.svg"
                : function1 === "function-6"
                ? "back-3.svg"
                : function1 === "sense"
                ? "back-4.svg"
                : "back-2.svg"
            }
          />
        )}

        {["function-6", "go-a", "go-b"].includes(function1) && (
          <>
            <img
              className="line"
              alt="Line"
              src={function1 === "go-b" ? "line-2-2.svg" : function1 === "function-6" ? "line-2.svg" : "line-2-3.svg"}
            />
            <img
              className="line-2"
              alt="Line"
              src={function1 === "go-b" ? "line-3-3.svg" : function1 === "function-6" ? "line-3-2.svg" : "line-3.svg"}
            />
            <img
              className="line-3"
              alt="Line"
              src={function1 === "go-b" ? "line-4-3.svg" : function1 === "function-6" ? "line-4-2.svg" : "line-4.svg"}
            />
          </>
        )}

        {["action", "function-6", "go-a", "go-b", "sense"].includes(function1) && (
          <div className="group-6">
            {["action", "function-6", "go-a", "go-b"].includes(function1) && (
              <div className="div-2">
                {["function-6", "go-a", "go-b"].includes(function1)}
                {/* && <>sound</> */}

                {function1 === "action" && <>motor A</>}
              </div>
            )}

            {function1 === "sense" && (
              <>
                <img className="color-palette" alt="Color palette" src="color-palette.svg" />
                <div className="sensor">
                  <div className="ellipse-wrapper">
                    <div className="ellipse" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {["function-6", "go-a", "go-b"].includes(function1) && (
          <>
            <div className="group-7">
              <div className="div-2"></div> 
            </div>
            {/* wait ^^^ */}
            {/* <Sound chosen="default" className="sound-instance" />
            <Wait activity="default" className="wait-instance" /> */}
          </>
        )}

        {function1 === "sense" && <div className="text-wrapper-8">color sensor</div>}

        {function1 === "action" && (
          <>
            <MotorControls
              choice="default"
              className="motor-controls-instance"
              overlapClassName={motorControlsOverlapClassNameOverride}
              overlapClassNameOverride={motorControlsOverlapClassName}
              overlapGroupClassName={motorControlsOverlapGroupClassName}
            />
            <Speed className="speed-instance" property1="inactive" vector={speedVector} />
            <div className="text-wrapper-7">motor B</div>
            <MotorControls
              choice="default"
              className="instance-node"
              overlapClassName={motorControlsGroupWrapperClassName}
              overlapClassNameOverride={motorControlsDivClassName}
              overlapGroupClassName={motorControlsOverlapGroupClassNameOverride}
            />
            <Speed className="speed-2" property1="inactive" vector={speedImg} />
            {/* <div className="group-8">
              <div className="div-2">sound</div>
            </div>
            <div className="group-7">
              <div className="div-2">wait</div>
            </div> */}
            {/* <Sound chosen="default" className="sound-instance" /> */}
            <img className="back" alt="Back" />
            {/* <Wait activity="default" className="wait-instance" /> */}
            <img className="line" alt="Line" />
            <img className="line-2" alt="Line" />
            <img className="line-3" alt="Line" />
            <img className="hub-bottom"  />
            <img className="hub-connect"  />
          </>
        )}
      </div>
    </div>
  );
};

FunctionHubBeta.propTypes = {
  function1: PropTypes.oneOf(["action", "default", "function-6", "go-b", "sense", "go-a"]),
  speedVector: PropTypes.string,
  speedImg: PropTypes.string,
};