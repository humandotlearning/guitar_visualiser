// File: components/ScaleNotes.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { getScaleNotes, getScalePattern, SCALE_LIBRARY } from '../utils/musicTheory';
import PropTypes from 'prop-types';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';
import Spinner from './ui/Spinner';

// Memoized ScaleNotes component to avoid re-rendering when unrelated App state changes (e.g. Chord selection)
const ScaleNotes = ({ rootNote, selectedScale, selectedInstrument }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Initialize audio on mount and when instrument changes
  useEffect(() => {
    const initAudio = async () => {
      try {
        await SoundfontAudio.initializeAudio();
        await SoundfontAudio.loadInstrument(selectedInstrument || 'acoustic_guitar_steel');
        setAudioInitialized(true);
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initAudio();

    return () => {
      // Cleanup if needed
    };
  }, [selectedInstrument]);

  if (!rootNote || !selectedScale) return null;

  // Memoize expensive calculations to prevent re-computation during playback animation
  const scaleNotes = useMemo(() =>
    getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]),
    [rootNote, selectedScale]
  );

  const scalePattern = useMemo(() =>
    getScalePattern(SCALE_LIBRARY[selectedScale.category][selectedScale.name]),
    [selectedScale]
  );

  // Helper function to get color based on scale degree
  const getScaleDegreeColor = (index) => {
    switch (index) {
      case 0: return 'var(--color-tonic)';      // Tonic (I)
      case 1: return 'var(--color-major)';      // Major Step (II)
      case 2: return 'var(--color-minor)';      // Minor Step (III)
      case 3: return 'var(--color-perfect)';    // Perfect Fourth (IV)
      case 4: return 'var(--color-perfect)';    // Perfect Fifth (V)
      case 5: return 'var(--color-major)';      // Major Step (VI)
      case 6: return 'var(--color-minor)';      // Minor Step (VII)
      default: return 'black';
    }
  };

  // Play the scale notes in sequence
  const playScale = async () => {
    if (!audioInitialized || isPlaying) return;
    
    setIsPlaying(true);
    try {
      // Play notes sequentially with a delay between them
      for (let i = 0; i < scaleNotes.length; i++) {
        // Set current note index immediately before playing
        setCurrentNoteIndex(i);
        
        // Play the note and await, catch errors
        try {
          await SoundfontAudio.playNote(scaleNotes[i]);
        } catch (noteError) {
          console.error('Error playing note:', noteError);
          // Optionally, set an error state here to display in the UI
          break;
        }
        // Wait before playing the next note
        if (i < scaleNotes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (err) {
      console.error('Error playing scale:', err);
    } finally {
      // Reset after playing is complete
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentNoteIndex(null);
      }, 500);
    }
  };

  // Play a single note
  const playSingleNote = async (note) => {
    if (!audioInitialized) return;
    try {
      await SoundfontAudio.playNote(note);
    } catch (error) {
      console.error('Error playing note:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2>Notes of {rootNote} {selectedScale.name} </h2>
        <button 
          onClick={playScale}
          disabled={isPlaying || !audioInitialized}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 flex items-center"
        >
          {isPlaying ? (
            <span><Spinner /> Playing...</span>
          ) : (
            <span>Play Scale</span>
          )}
        </button>
      </div>
      <h3> {selectedScale.name} Scale Pattern  :  <b>{scalePattern}</b></h3>
      <br></br>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="border p-2">Degree</th>
            {scaleNotes.map((note, index) => (
              <th key={index} style={{ color: getScaleDegreeColor(index) }}>{index + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" className="border p-2 font-medium text-left"><b>Note</b></th>
            {scaleNotes.map((note, index) => (
              <td key={index} className="p-1">
                <button
                  onClick={() => playSingleNote(note)}
                  aria-label={`Play ${note}, degree ${index + 1}`}
                  className={`
                    w-full h-full block font-bold px-3 py-2 rounded transition-all duration-200 bg-transparent
                    ${currentNoteIndex === index ? 'bg-blue-100 scale-110' : 'hover:bg-slate-100'}
                    focus:outline-none focus:ring-2 focus:ring-blue-300
                  `}
                  style={{
                    color: getScaleDegreeColor(index),
                  }}
                >
                  {note}
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table><br/>
      <p className="text-sm text-gray-600">
        This table shows the notes of the {rootNote} {selectedScale.name} scale in order, 
        along with their scale degrees. The scale pattern represents the intervals between each note. 
      </p>
      <br/>
      <p className="text-sm text-gray-600">
        <b>W </b> refers to Whole Step.<br/>
        <b>H </b> refers to Half Step
      </p>
    </div>
  );
};

ScaleNotes.propTypes = {
  rootNote: PropTypes.string.isRequired,
  selectedScale: PropTypes.shape({
    category: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  selectedInstrument: PropTypes.string,
};

export default React.memo(ScaleNotes);
