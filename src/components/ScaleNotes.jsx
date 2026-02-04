// File: components/ScaleNotes.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { getScaleNotes, getScalePattern, SCALE_LIBRARY } from '../utils/musicTheory';
import PropTypes from 'prop-types';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';
import Spinner from './ui/Spinner';

// Helper function to get color based on scale degree
// Moved outside component to avoid recreation
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

// Memoized cell component to prevent table re-renders during playback
const ScaleNoteCell = React.memo(({ note, index, isCurrent }) => {
  const color = getScaleDegreeColor(index);
  return (
    <td style={{
      color: color,
      fontWeight: 'bold',
      backgroundColor: isCurrent ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
      transition: 'background-color 0.3s ease',
      padding: '8px 12px',
      borderRadius: '4px',
      transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
    }}>
      {note}
    </td>
  );
});

ScaleNoteCell.displayName = 'ScaleNoteCell';
ScaleNoteCell.propTypes = {
  note: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  isCurrent: PropTypes.bool.isRequired,
};

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
              <ScaleNoteCell
                key={index}
                note={note}
                index={index}
                isCurrent={currentNoteIndex === index}
              />
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
