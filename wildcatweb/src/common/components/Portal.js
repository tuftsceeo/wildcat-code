/**
 * @file Portal.js
 * @description Utility component for rendering content in a portal outside the normal
 * DOM hierarchy, used for modals and dialogs.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const Portal = ({ children }) => {
    const [portalRoot, setPortalRoot] = useState(null);

    // Create or find portal root element
    useEffect(() => {
        console.log("Portal component initializing");

        // Find or create the portal-root element
        let element = document.getElementById("portal-root");

        if (!element) {
            console.log("Creating new portal-root element");
            element = document.createElement("div");
            element.id = "portal-root";
            // Set necessary styles to ensure visibility
            element.style.position = "fixed";
            element.style.top = "0";
            element.style.left = "0";
            element.style.width = "100%";
            element.style.height = "100%";
            element.style.zIndex = "9999";
            element.style.pointerEvents = "none";
            document.body.appendChild(element);
        } else {
            console.log("Found existing portal-root element");
        }

        setPortalRoot(element);

        // Cleanup on unmount
        return () => {
            console.log("Portal component cleanup");
            if (element && element.childNodes.length === 0) {
                console.log("Removing empty portal-root element");
                document.body.removeChild(element);
            }
        };
    }, []);

    // Only render when portalRoot is available
    if (!portalRoot) {
        console.log("Portal root not available yet, not rendering");
        return null;
    }

    console.log("Portal rendering content into", portalRoot);

    // Create portal to render children into the portal root
    return ReactDOM.createPortal(
        <div style={{ pointerEvents: "auto" }}>{children}</div>,
        portalRoot,
    );
};

export default Portal;
