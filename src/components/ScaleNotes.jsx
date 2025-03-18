// File: components/ScaleNotes.jsx

import React, { useState, useEffect } from 'react';
import { getScaleNotes, getScalePattern, SCALE_LIBRARY } from '../utils/musicTheory';
import PropTypes from 'prop-types';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';

const ScaleNotes = ({ rootNote, selectedScale }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  if (!rootNote || !selectedScale) return null;

  const scaleNotes = getScaleNotes(rootNote, SCALE_LIBRARY[selectedScale.category][selectedScale.name]);
  const scalePattern = getScalePattern(SCALE_LIBRARY[selectedScale.category][selectedScale.name]);

  // Initialize audio on mount
  useEffect(() => {
    const initAudio = async () => {
      try {
        await SoundfontAudio.initializeAudio();
        await SoundfontAudio.loadInstrument('acoustic_guitar_steel');
        setAudioInitialized(true);
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    // Initialize audio immediately without waiting for user interaction
    initAudio();

    return () => {
      // Cleanup if needed
    };
  }, []);

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
        
        // Play the note immediately for the first note
        SoundfontAudio.playNote(scaleNotes[i]);
        
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
            <span>Playing...</span>
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
            <td className="border p-2 font-medium"><b>Note</b></td>
            {scaleNotes.map((note, index) => (
              <td key={index} style={{ 
                color: getScaleDegreeColor(index),
                fontWeight: 'bold',
                backgroundColor: currentNoteIndex === index ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                transition: 'background-color 0.3s ease',
                padding: '8px 12px',
                borderRadius: '4px',
                transform: currentNoteIndex === index ? 'scale(1.1)' : 'scale(1)',
              }}>{note}</td>
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
};

export default ScaleNotes;
