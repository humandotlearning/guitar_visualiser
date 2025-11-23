// File: components/theory/HarmonicFunctions.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  getDiatonicChords,
  SCALE_LIBRARY,
} from '../../utils/musicTheory';
import {
  formatRomanNumeral,
  getChordFunctionColor,
  getFunctionDescription,
} from '../../utils/theoryVisualizationUtils';
import Soundfont from 'soundfont-player';

export default function HarmonicFunctions({
  rootNote,
  selectedScale,
  setSelectedChord,
  instrumentConfig,
}) {
  const [audioContext, setAudioContext] = useState(null);
  const [instrument, setInstrument] = useState(null);

  const scale = SCALE_LIBRARY[selectedScale.category]?.[selectedScale.name];

  // Only show harmonic functions for 7-note scales
  if (!scale || scale.length < 7) {
    return (
      <div className="harmonic-functions-container">
        <h3 className="text-xl font-semibold mb-4">Harmonic Functions</h3>
        <p className="text-gray-600">
          Harmonic function analysis is available for 7-note scales. Please select a major or
          minor scale.
        </p>
      </div>
    );
  }

  const chords = getDiatonicChords(rootNote, scale, true);

  // Group chords by function
  const functionGroups = {
    Tonic: { degrees: [0, 2, 5], color: 'blue' },
    Subdominant: { degrees: [1, 3], color: 'green' },
    Dominant: { degrees: [4, 6], color: 'red' },
  };

  const initAudio = async () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);

      const inst = await Soundfont.instrument(ctx, instrumentConfig.soundfontName);
      setInstrument(inst);

      return { ctx, inst };
    }
    return { ctx: audioContext, inst: instrument };
  };

  const playChord = async (chordNotes) => {
    try {
      const { ctx, inst } = await initAudio();

      setSelectedChord(chordNotes);

      chordNotes.forEach((note) => {
        inst.play(note + '4', ctx.currentTime, { duration: 2 });
      });

      setTimeout(() => setSelectedChord([]), 2000);
    } catch (error) {
      console.error('Error playing chord:', error);
    }
  };

  return (
    <div className="harmonic-functions-container">
      <h3 className="text-xl font-semibold mb-2">
        Harmonic Functions in {rootNote} {selectedScale.name}
      </h3>

      <p className="text-sm text-gray-600 mb-6">
        Chords are grouped by their harmonic function - their role in creating tension and
        resolution. Click any chord to hear it and see it highlighted on your instrument.
      </p>

      {/* Main Grid Layout for Function Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(functionGroups).map(([funcName, { degrees }]) => {
          const colors = getChordFunctionColor(funcName);

          return (
            <div
              key={funcName}
              className={`function-group flex flex-col h-full bg-white border-t-4 ${colors.border} rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
            >
              {/* Card Header */}
              <div className={`p-4 ${colors.bg} border-b border-gray-100`}>
                <h4 className={`text-lg font-bold ${colors.text} flex items-center justify-between`}>
                  {funcName}
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {getFunctionDescription(funcName)}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-grow flex flex-col gap-6">
                {/* Triads */}
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Triads</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {degrees.map((deg) => {
                      const chord = chords[deg];
                      if (!chord) return null;

                      const romanNumeral = formatRomanNumeral(deg, selectedScale.category);

                      return (
                        <button
                          key={`triad-${deg}`}
                          onClick={() => playChord(chord.triad)}
                          className={`text-center px-2 py-3 bg-white rounded border border-gray-200 hover:border-${colors.border.replace('border-', '')} hover:bg-gray-50 transition-all group flex flex-col items-center justify-center gap-1 shadow-sm`}
                        >
                          <span className={`font-bold text-xl ${colors.text}`}>
                            {romanNumeral}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {chord.root}
                          </span>
                          <span className="text-xs text-gray-500 font-mono mt-1">
                            {chord.triad.join('-')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seventh Chords */}
                {chords[0]?.seventh && (
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Seventh Chords</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {degrees.map((deg) => {
                        const chord = chords[deg];
                        if (!chord?.seventh) return null;

                        const romanNumeral = formatRomanNumeral(deg, selectedScale.category);

                        return (
                          <button
                            key={`seventh-${deg}`}
                            onClick={() => playChord(chord.seventh)}
                            className={`text-center px-2 py-3 bg-white rounded border border-gray-200 hover:border-${colors.border.replace('border-', '')} hover:bg-gray-50 transition-all group flex flex-col items-center justify-center gap-1 shadow-sm`}
                          >
                            <span className={`font-bold text-xl ${colors.text}`}>
                              {romanNumeral}<sup>7</sup>
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {chord.root}7
                            </span>
                            <span className="text-xs text-gray-500 font-mono mt-1">
                              {chord.seventh.join('-')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational content - Simplified */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 rounded border border-blue-100 text-sm text-blue-800">
          <strong>🏠 Tonic:</strong> Stability, home, resolution.
        </div>
        <div className="p-3 bg-green-50 rounded border border-green-100 text-sm text-green-800">
          <strong>📤 Subdominant:</strong> Movement away, preparation.
        </div>
        <div className="p-3 bg-red-50 rounded border border-red-100 text-sm text-red-800">
          <strong>⚡ Dominant:</strong> Tension, pull towards Tonic.
        </div>
      </div>

      {/* Common progressions using functions */}
      <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
        <h4 className="font-semibold mb-3 text-gray-800">💡 Common Functional Progressions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Basic Cadence</div>
            <div className="font-mono text-indigo-600 font-medium">I → V → I</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Full Cadence</div>
            <div className="font-mono text-indigo-600 font-medium">I → IV → V → I</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Plagal Cadence</div>
            <div className="font-mono text-indigo-600 font-medium">I → IV → I</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Jazz Turnaround</div>
            <div className="font-mono text-indigo-600 font-medium">ii → V → I</div>
          </div>
        </div>
      </div>
    </div>
  );
}

HarmonicFunctions.propTypes = {
  rootNote: PropTypes.string.isRequired,
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  setSelectedChord: PropTypes.func.isRequired,
  instrumentConfig: PropTypes.shape({
    soundfontName: PropTypes.string.isRequired,
  }).isRequired,
};
