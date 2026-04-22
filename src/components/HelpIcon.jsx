// File: components/HelpIcon.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const HelpIcon = ({ helpText }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="help-icon-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        className="help-icon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
        aria-label="Help"
        aria-expanded={showTooltip}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        <span aria-hidden="true">?</span>
      </button>
      {showTooltip && (
        <div className="tooltip">
          {helpText}
        </div>
      )}
    </div>
  );
};

HelpIcon.propTypes = {
  helpText: PropTypes.node.isRequired,
};

export default HelpIcon;
