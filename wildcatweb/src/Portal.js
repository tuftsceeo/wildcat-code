/**
 * @file Portal.js
 * @description Utility component for rendering content in a portal outside the normal
 * DOM hierarchy, used for modals and dialogs.
 * @author Jennifer Cross with support from Claude
 * @created February 2025
 */

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const Portal = ({ children }) => {
    // Create portal root if it doesn't exist
    useEffect(() => {
        if (!document.getElementById('portal-root')) {
            const portalDiv = document.createElement('div');
            portalDiv.id = 'portal-root';
            document.body.appendChild(portalDiv);
        }

        // Cleanup on unmount
        return () => {
            const portalRoot = document.getElementById('portal-root');
            if (portalRoot && portalRoot.childNodes.length === 0) {
                portalRoot.remove();
            }
        };
    }, []);

    const portalRoot = document.getElementById('portal-root');
    
    // Only render when we have a valid portal target
    if (!portalRoot) return null;

    return ReactDOM.createPortal(children, portalRoot);
};

export default Portal;