# wildcat-code
The prototype coding tool for wildcats in the IEP-CT project

IEP-CT Prototype V1

Contributors: Ava Delaney & Douglas Lilly

8/7/24

—----------------------

How to setup/run:

Frontend: Make sure you have the following npm packages installed:

├── @testing-library/jest-dom@5.17.0
├── @testing-library/react@13.4.0
├── @testing-library/user-event@13.5.0
├── axios@1.7.3
├── react-dnd-html5-backend@16.0.1
├── react-dnd@16.0.1
├── react-dom@18.3.1
├── react-scripts@5.0.1
├── react@18.3.1
└── web-vitals@2.1.4
Run npm start to launch the client-side server (localhost:3000).

Backend: Make sure you have Python3 v11 or later. 
Install pip
Install bleak
Install fastapi uvicorn

Open a new terminal and run uvicorn main:app --reload to launch the backend server (localhost:8000).

—----------

File descriptions:

Wildcat-code/Prototype-v1/src (this is where all the frontend code is):

Assets folder: All the SVGs, PNGs, and audio files used in the project.

App.js: The root component of the project that renders all of the necessary frontend providers and components for the project. This file also facilitates communication of user-inputted code and whether or not the user has completed enough steps to run code between components. Look here if you want to…
Add or remove major components
Change what data is shared between the coding track module and the run code module, or how this data is shared

BluetoothUI.jsx: The menu in the top right corner of the main screen. Contains buttons to navigate to the settings page, the help docs, and to connect to Bluetooth. 
Look here if you want to…
Implement a help button/docs
Update the Bluetooth protocol on the client side (js)

CodingTrack.jsx: Contains the code sucker (box that initially is labeled “drag and drop code here”), and the code track (right below it). This component manages navigation between steps on the coding track, and converts what the user inputs onto the coding track into data that can be parsed by the backend, and executed as micropython code on the LEGO Spike hub (i.e., it creates the “code dictionary”). 
Look here if you want to…
Change how information/what information about user code is sent from the UI to the backend
Change how code is dropped onto and appears in the code sucker and on the coding track

ColorSensorButtons.jsx: Reusable component that renders a button to change the color that the sensor is supposed to detect to trigger an action. Used by SensorDash.jsx, and appears in the “sensor” tab on the main page.
Look here if you want to…
Change the appearance of these buttons

CustomizationPage.jsx: Renders the customization page (which pops up when you click the gear icon in the top-right corner of the main page). Currently not functional.
Look here if you want to…
Implement teacher customization functionality

FunctionDefault.jsx: The component on the right side of the screen labeled “function hub.” Conditionally renders MotorDash and SensorDash components, which enables users to add motor and sensor code to the coding track.
Look here if you want to…
Implement additional modules from Spike (e.g., light matrix, distance sensor, etc.)
Make the program display options for action/sense based on what is plugged into the LEGO hub.

Index.js: Renders the app component.

Knob.js: The “speed dial” component of the MotorDash. Manages movement of the dial and tracking dial location.
Look here if you want to…
Modify the behavior of the speed dial (right now it snaps into place at 0, 45, 90, and 135, degrees and can’t move beyond 135 or 0 degrees).
Change what information about motor “speed” is shared between components (currently the value of the knob’s “snapped angle” is passed to MotorDash.jsx and CodingTrack.jsx, this number should be converted into a motor speed that corresponds to the Spike Micropython API).

KnobContext.js: A react context for sharing motor speed/knob angle between different components. Currently not in use.
Look here if you want to…
Improve and scale how data is shared between components

Main.py: Python file that facilitates communication between frontend js and backend python; calls modules to connect to Spike via bluetooth and run code on the Spike.

MotorDash.jsx: Renders a dashboard within the FunctionDefault component that allows for users to change motor speed and have motors go/stop for motors plugged into different ports. This component gets dragged onto CodingTrack.jsx, which inherits information about motor speed, stop/go status, and motor port.
Look here if you want to…
Make the program display the correct motor port based on where it’s plugged in on the hub (not just ports A and B, which is currently hard-coded into FunctionDefault.jsx)

Portal.js: A portal for the proper rendering of CustomizationPage.jsx (rendered when the .settingsButton in BluetoothUI.jsx is clicked).

RunMenu.jsx: Contains the buttons to run user code.
Look here if you want to:
Implement running individual steps of user code
Change what information is sent to the backend server

SensorDash.jsx: Renders a dashboard within the FunctionDefault component that allows for users to change the color that the sensor is searching for. This component gets dragged onto CodingTrack.jsx, which inherits information about sensor color.
Look here if you want to…
Limit which colors users can choose to have the color sensor “see”

[BluetoothUI/CodingTrack/CustomizationPage/FunctionDefault/MotorDash/RunMenu/SensorDash].module.css: CSS styling for components.

[App/Index/Knob].css: CSS styling for components.

