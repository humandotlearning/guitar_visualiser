// File: components/HelpIcon.jsx

import React, { useState } from 'react';

const HelpIcon = ({ helpText }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="help-icon-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button className="help-icon">?</button>
      {showTooltip && (
        <div className="tooltip">
          {helpText}
        </div>
      )}
    </div>
  );
};

export default HelpIcon;
