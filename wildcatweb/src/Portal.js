import React from 'react';
import ReactDOM from 'react-dom';

const Portal = ({ children }) => {
    return ReactDOM.createPortal(
        children,
        document.getElementById('portal-root')
    );
};

export default Portal;
