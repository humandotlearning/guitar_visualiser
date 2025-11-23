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
      <h3 className="text-xl font-semibold mb-4">
        Harmonic Functions in {rootNote} {selectedScale.name}
      </h3>

      <p className="text-sm text-gray-600 mb-6">
        Chords are grouped by their harmonic function - their role in creating tension and
        resolution. Click any chord to hear it and see it highlighted on your instrument.
      </p>

      <div className="space-y-6">
        {Object.entries(functionGroups).map(([funcName, { degrees }]) => {
          const colors = getChordFunctionColor(funcName);

          return (
            <div
              key={funcName}
              className={`function-group border-l-4 ${colors.border} pl-4 p-4 ${colors.bg} rounded-r-lg`}
            >
              <h4 className={`text-lg font-bold ${colors.text} mb-2`}>{funcName}</h4>
              <p className="text-sm text-gray-700 mb-3">{getFunctionDescription(funcName)}</p>

              {/* Triads */}
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Triads:</h5>
                <div className="flex flex-wrap gap-2">
                  {degrees.map((deg) => {
                    const chord = chords[deg];
                    if (!chord) return null;

                    const romanNumeral = formatRomanNumeral(deg, selectedScale.category);

                    return (
                      <button
                        key={`triad-${deg}`}
                        onClick={() => playChord(chord.triad)}
                        className={`chord-button px-4 py-3 bg-white border-2 ${colors.border} rounded-md ${colors.hover} transition-all shadow-sm hover:shadow-md`}
                      >
                        <div className={`text-base font-bold ${colors.text}`}>
                          {romanNumeral}
                        </div>
                        <div className="text-xs text-gray-600">{chord.root}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {chord.triad.join(' - ')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seventh Chords */}
              {chords[0]?.seventh && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Seventh Chords:</h5>
                  <div className="flex flex-wrap gap-2">
                    {degrees.map((deg) => {
                      const chord = chords[deg];
                      if (!chord?.seventh) return null;

                      const romanNumeral = formatRomanNumeral(deg, selectedScale.category);

                      return (
                        <button
                          key={`seventh-${deg}`}
                          onClick={() => playChord(chord.seventh)}
                          className={`chord-button px-4 py-3 bg-white border-2 ${colors.border} rounded-md ${colors.hover} transition-all shadow-sm hover:shadow-md`}
                        >
                          <div className={`text-base font-bold ${colors.text}`}>
                            {romanNumeral}
                            <sup>7</sup>
                          </div>
                          <div className="text-xs text-gray-600">{chord.root}7</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {chord.seventh.join(' - ')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Educational content */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h5 className="font-semibold text-blue-900 mb-2">🏠 Tonic (I, iii, vi)</h5>
          <p className="text-sm text-blue-800">
            Provides <strong>stability</strong> and feels like home. Songs often start and end on
            tonic chords. The I chord is the strongest tonic.
          </p>
        </div>

        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
          <h5 className="font-semibold text-green-900 mb-2">📤 Subdominant (ii, IV)</h5>
          <p className="text-sm text-green-800">
            Creates <strong>movement away</strong> from tonic. Prepares for the dominant or leads
            back to tonic. The IV chord is the strongest subdominant.
          </p>
        </div>

        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <h5 className="font-semibold text-red-900 mb-2">⚡ Dominant (V, vii°)</h5>
          <p className="text-sm text-red-800">
            Creates <strong>tension</strong> that wants to resolve to tonic. The V chord has the
            strongest pull toward I. Essential for creating musical movement.
          </p>
        </div>
      </div>

      {/* Common progressions using functions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-3">💡 Common Functional Progressions:</h4>
        <div className="space-y-2 text-sm">
          <div>
            <strong>T → D → T:</strong> <span className="text-gray-600">I → V → I (Basic cadence)</span>
          </div>
          <div>
            <strong>T → SD → D → T:</strong> <span className="text-gray-600">I → IV → V → I (Full cadence)</span>
          </div>
          <div>
            <strong>T → SD → T:</strong> <span className="text-gray-600">I → IV → I (Plagal cadence, &ldquo;Amen&rdquo;)</span>
          </div>
          <div>
            <strong>SD → D → T:</strong> <span className="text-gray-600">ii → V → I (Jazz turnaround)</span>
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
