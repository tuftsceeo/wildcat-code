/**
 * @file index.js
 * @description Entry point for the React application that renders the root App component.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

import React from "react";
import ReactDOM from "react-dom/client";
// import ReactDOM from 'react-dom';
import "./common/styles/index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
