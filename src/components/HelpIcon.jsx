// File: components/HelpIcon.jsx

import React, { useState, useId } from 'react';
import PropTypes from 'prop-types';

const HelpIcon = ({ helpText }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipId = useId();

  return (
    <div 
      className="relative inline-flex items-center justify-center help-icon-container ml-1"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        className="help-icon w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors p-0 shadow-none border-none"
        style={{ padding: 0, minWidth: '1rem', minHeight: '1rem' }}
        aria-label="Help"
        aria-expanded={showTooltip}
        aria-describedby={showTooltip ? tooltipId : undefined}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        ?
      </button>
      {showTooltip && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute z-50 w-48 p-2 mt-2 text-sm text-white bg-slate-800 rounded shadow-lg -left-2 top-full tooltip before:content-[''] before:absolute before:-top-1 before:left-3 before:border-4 before:border-transparent before:border-b-slate-800"
        >
          {helpText}
        </div>
      )}
    </div>
  );
};

HelpIcon.propTypes = {
  helpText: PropTypes.string.isRequired,
};

export default HelpIcon;
