// File: components/theory/TheoryModeSelector.jsx
import React from 'react';
import PropTypes from 'prop-types';

const THEORY_MODES = {
  'Basic': ['Scales & Chords'],
  'Advanced Theory': ['Circle of Fifths', 'Chord Progressions', 'Harmonic Functions'],
  'Instrument Specific': ['CAGED System'],
};

export default function TheoryModeSelector({ selectedMode, setSelectedMode, instrumentConfig }) {
  // Filter out CAGED system for keyboard instruments
  const availableModes = { ...THEORY_MODES };
  if (instrumentConfig?.type === 'keyboard') {
    delete availableModes['Instrument Specific'];
  }

  return (
    <div className="theory-mode-selector mb-4">
      <label htmlFor="theory-mode" className="block text-sm font-semibold mb-2">
        Theory Visualization Mode:
      </label>
      <select
        id="theory-mode"
        value={selectedMode}
        onChange={(e) => setSelectedMode(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        {Object.entries(availableModes).map(([category, modes]) => (
          <optgroup key={category} label={category}>
            {modes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* Mode descriptions */}
      <div className="mt-2 text-sm text-gray-600">
        {selectedMode === 'Scales & Chords' && (
          <p>View scales on your instrument and explore chords in the selected scale.</p>
        )}
        {selectedMode === 'Circle of Fifths' && (
          <p>Interactive circle showing key relationships. Click to change root note.</p>
        )}
        {selectedMode === 'Chord Progressions' && (
          <p>Explore common chord progressions and hear how they sound.</p>
        )}
        {selectedMode === 'Harmonic Functions' && (
          <p>Understand the role of each chord (Tonic, Subdominant, Dominant).</p>
        )}
        {selectedMode === 'CAGED System' && (
          <p>Learn movable chord shapes across the fretboard (Guitar/Ukulele).</p>
        )}
      </div>
    </div>
  );
}

TheoryModeSelector.propTypes = {
  selectedMode: PropTypes.string.isRequired,
  setSelectedMode: PropTypes.func.isRequired,
  instrumentConfig: PropTypes.shape({
    type: PropTypes.string,
  }).isRequired,
};
