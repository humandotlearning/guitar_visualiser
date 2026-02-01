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

  const getDescription = (mode) => {
    switch (mode) {
      case 'Scales & Chords': return 'View scales on your instrument and explore chords in the selected scale.';
      case 'Circle of Fifths': return 'Interactive circle showing key relationships. Click to change root note.';
      case 'Chord Progressions': return 'Explore common chord progressions and hear how they sound.';
      case 'Harmonic Functions': return 'Understand the role of each chord (Tonic, Subdominant, Dominant).';
      case 'CAGED System': return 'Learn movable chord shapes across the fretboard (Guitar/Ukulele).';
      default: return '';
    }
  };

  return (
    <div className="theory-mode-selector">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-800">Theory Mode</h2>
      </div>

      {/* Horizontal Scroll Container for Modes */}
      <div
        className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
        role="group"
        aria-label="Theory Mode Selection"
      >
        <div className="flex gap-4 min-w-max">
          {Object.entries(availableModes).map(([category, modes]) => (
            <div key={category} className="flex gap-2">
              {modes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  aria-pressed={selectedMode === mode}
                  className={`
                    flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 border min-w-[140px]
                    ${selectedMode === mode
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }
                  `}
                >
                  <span className="font-bold text-sm text-center leading-tight">
                    {mode}
                  </span>
                  <span className={`text-[10px] mt-1 uppercase tracking-wider ${selectedMode === mode ? 'text-blue-50' : 'text-slate-500'}`}>
                    {category}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Mode Description */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p>{getDescription(selectedMode)}</p>
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
