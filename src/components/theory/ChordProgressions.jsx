// File: components/theory/ChordProgressions.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  getCommonProgressions,
  getScaleNotes,
  getDiatonicChords,
  SCALE_LIBRARY,
} from '../../utils/musicTheory';
import { formatRomanNumeral } from '../../utils/theoryVisualizationUtils';
import Soundfont from 'soundfont-player';

export default function ChordProgressions({
  rootNote,
  selectedScale,
  setSelectedChord,
  instrumentConfig,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [instrument, setInstrument] = useState(null);

  const progressions = getCommonProgressions();
  const scale = SCALE_LIBRARY[selectedScale.category]?.[selectedScale.name];

  // Only show progressions if we have a valid 7-note scale
  if (!scale || scale.length < 7) {
    return (
      <div className="chord-progressions-container">
        <h3 className="text-xl font-semibold mb-4">Chord Progressions</h3>
        <p className="text-gray-600">
          Chord progressions are available for 7-note scales. Please select a major or minor scale.
        </p>
      </div>
    );
  }

  const scaleNotes = getScaleNotes(rootNote, scale);
  const diatonicChords = getDiatonicChords(rootNote, scale, true);

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

  const playProgression = async (degrees) => {
    setIsPlaying(true);

    try {
      const { ctx, inst } = await initAudio();

      for (const degree of degrees) {
        if (degree >= diatonicChords.length) continue;

        const chord = diatonicChords[degree];
        const chordNotes = chord.triad;

        // Highlight chord on instrument
        setSelectedChord(chordNotes);

        // Play chord (all notes simultaneously)
        chordNotes.forEach((note) => {
          inst.play(note + '4', ctx.currentTime, { duration: 1 });
        });

        // Wait for 1 second before next chord
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error playing progression:', error);
    } finally {
      setIsPlaying(false);
      setSelectedChord([]);
    }
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
    <div className="chord-progressions-container">
      <h3 className="text-xl font-semibold mb-4">Common Chord Progressions</h3>
      <p className="text-sm text-gray-600 mb-4">
        Explore popular chord progressions in {rootNote} {selectedScale.name}. Click chords to
        highlight them on your instrument, or play the entire progression.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(progressions).map(([name, { degrees, notation, description }]) => {
          // Filter out progressions that are too long for pentatonic or blues scales
          if (degrees.some((deg) => deg >= scaleNotes.length)) {
            return null;
          }

          return (
            <div
              key={name}
              className="progression-item bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-base text-gray-800">{name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">{notation}</p>
                </div>
                <button
                  onClick={() => playProgression(degrees)}
                  disabled={isPlaying}
                  className={`p-1.5 rounded-full transition-colors ${isPlaying
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  title={isPlaying ? 'Playing...' : 'Play Progression'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <p className="text-xs text-gray-600 mb-3 flex-grow">{description}</p>

              <div className="chord-buttons flex flex-row flex-wrap gap-2 mt-auto w-full">
                {degrees.map((deg, i) => {
                  const chord = diatonicChords[deg];
                  if (!chord) return null;

                  const romanNumeral = formatRomanNumeral(deg, selectedScale.category);

                  return (
                    <button
                      key={i}
                      onClick={() => playChord(chord.triad)}
                      className="progression-chord-btn px-3 py-2 bg-gray-50 border border-gray-200 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors flex flex-col items-center justify-center min-w-[3.5rem]"
                    >
                      <span className="text-sm font-bold text-indigo-700">{romanNumeral}</span>
                      <span className="text-xs text-gray-500">{chord.root}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
        <h4 className="font-semibold mb-2 text-blue-900">💡 Tips:</h4>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>Click individual chords to hear and highlight them on your instrument</li>
          <li>Click &ldquo;Play&rdquo; to hear the full progression</li>
          <li>Try composing your own songs using these common patterns</li>
          <li>Roman numerals (I, ii, iii, etc.) indicate scale degrees and chord qualities</li>
        </ul>
      </div>
    </div>
  );
}

ChordProgressions.propTypes = {
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
