// File: src/components/FretboardCustomization.jsx
import React from 'react';
import PropTypes from 'prop-types';

const TUNINGS = {
  'Standard': ['E', 'B', 'G', 'D', 'A', 'E'],
  'Drop D': ['E', 'B', 'G', 'D', 'A', 'D'],
  'Open G': ['D', 'B', 'G', 'D', 'G', 'D'],
  'DADGAD': ['D', 'A', 'G', 'D', 'A', 'D'],
};

const FretboardCustomization = ({ tuning, setTuning, fretCount, setFretCount }) => {
  const handleTuningChange = (e) => {
    setTuning(TUNINGS[e.target.value]);
  };

  const currentTuning = Object.entries(TUNINGS).find(([, notes]) => 
    notes.join(',') === tuning.join(',')
  )?.[0] || 'Standard';

  return (
    <div className="mb-4 space-y-4">
      <div>
        <label htmlFor="tuning" className="block text-sm font-medium text-gray-700">Tuning:</label>
        <select
          id="tuning"
          value={currentTuning}
          onChange={handleTuningChange}
          className="w-full p-2 border rounded"
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
        />
      </div>
    </div>
  );
};

FretboardCustomization.propTypes = {
  tuning: PropTypes.arrayOf(PropTypes.string).isRequired,
  setTuning: PropTypes.func.isRequired,
  fretCount: PropTypes.number.isRequired,
  setFretCount: PropTypes.func.isRequired,
};

export default FretboardCustomization;