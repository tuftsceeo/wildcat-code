/**
 * @file Portal.js
 * @description Fixed Portal component that safely handles multiple portals
 * @author [Your Name]
 */

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

// Keep track of portals using the root element
let portalCount = 0;

const Portal = ({ children }) => {
    const [portalRoot, setPortalRoot] = useState(null);
    
    // Create or find portal root element
    useEffect(() => {
        console.log("Portal component initializing");
        portalCount++;

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

        // Improved cleanup on unmount
        return () => {
            console.log("Portal component cleanup");
            portalCount--;
            
            // Only remove if this is the last portal using the root
            if (portalCount === 0 && element && document.body.contains(element)) {
                console.log("Removing portal-root element - last portal unmounted");
                try {
                    document.body.removeChild(element);
                } catch (e) {
                    console.warn("Portal cleanup error:", e);
                }
            } else {
                console.log(`Not removing portal-root, ${portalCount} portals still active`);
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