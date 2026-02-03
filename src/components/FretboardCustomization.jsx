// File: src/components/FretboardCustomization.jsx
import React from 'react';
import PropTypes from 'prop-types';

const TUNINGS = {
  'Standard': ['E', 'B', 'G', 'D', 'A', 'E'],
  'Drop D': ['E', 'B', 'G', 'D', 'A', 'D'],
  'Open G': ['D', 'B', 'G', 'D', 'G', 'D'],
  'DADGAD': ['D', 'A', 'G', 'D', 'A', 'D'],
};

const FretboardCustomization = React.memo(({ tuning, setTuning, fretCount, setFretCount, readOnly = false }) => {
  const handleTuningChange = (e) => {
    setTuning(TUNINGS[e.target.value]);
  };

  const currentTuning = Object.entries(TUNINGS).find(([, notes]) => 
    notes.join(',') === tuning.join(',')
  )?.[0] || 'Standard';

  if (readOnly) {
    return (
      <div className="mb-4 space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <span className="text-sm font-medium text-slate-500">Tuning</span>
          <span className="text-sm font-bold text-slate-700">{currentTuning}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm font-medium text-slate-500">Fret Count</span>
          <span className="text-sm font-bold text-slate-700">{fretCount}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-4">
      <div>
        <label htmlFor="tuning" className="block text-sm font-medium text-gray-700">Tuning:</label>
        <select
          id="tuning"
          value={currentTuning}
          onChange={handleTuningChange}
          className="w-full p-2 border rounded"
          disabled={typeof setTuning !== 'function' || setTuning.toString().includes('noop')}
        >
          {Object.keys(TUNINGS).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="fretCount" className="block text-sm font-medium text-gray-700">Fret Count: {fretCount}</label>
        <input
          type="range"
          id="fretCount"
          min={12}
          max={24}
          step={1}
          value={fretCount}
          onChange={(e) => setFretCount(Number(e.target.value))}
          className="w-full"
          disabled={typeof setFretCount !== 'function' || setFretCount.toString().includes('noop')}
        />
      </div>
    </div>
  );
});

FretboardCustomization.displayName = 'FretboardCustomization';

FretboardCustomization.propTypes = {
  tuning: PropTypes.arrayOf(PropTypes.string).isRequired,
  setTuning: PropTypes.func.isRequired,
  fretCount: PropTypes.number.isRequired,
  setFretCount: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default FretboardCustomization;