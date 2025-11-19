import React from 'react';
import PropTypes from 'prop-types';
import { getScaleNotes } from '../utils/musicTheory';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';
import './PianoKeyboard.css';

const PianoKeyboard = ({ rootNote, selectedScale, showScaleDegrees, instrumentConfig, selectedChord = [] }) => {
  const { startOctave, endOctave } = instrumentConfig;
  const scaleNotes = getScaleNotes(rootNote, selectedScale);

  // Helper function to get color based on scale degree (matching ScaleNotes.jsx)
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

  // Generate keys
  const keys = [];
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  for (let octave = startOctave; octave <= endOctave; octave++) {
    notes.forEach((note) => {
      const isBlack = note.includes('#');
      const noteName = note;
      const fullNoteName = `${note}${octave}`;

      // Check if note is in scale
      const scaleIndex = scaleNotes.indexOf(note);
      const isInScale = scaleIndex !== -1;
      const isRoot = note === rootNote;

      // Check if note is in the selected chord
      const isInChord = selectedChord.length > 0 && selectedChord.includes(note);

      keys.push({
        note: noteName,
        octave,
        fullNoteName,
        isBlack,
        isInScale,
        isRoot,
        isInChord,
        degree: isInScale ? scaleIndex + 1 : null,
        color: isInScale ? getScaleDegreeColor(scaleIndex) : null
      });
    });
  }

  const playNote = (note, octave) => {
    SoundfontAudio.playNote(note, null, octave);
  };

  return (
    <div className="piano-container">
      <div className="piano-keys">
        {keys.map((key) => {
          // Determine the style for this key
          const keyStyle = {};

          if (key.isInChord) {
            // Chord notes get a pulsing border effect
            keyStyle.boxShadow = '0 0 10px 2px rgba(59, 130, 246, 0.8)';
            keyStyle.border = '2px solid #3b82f6';
          }

          if (key.isInScale && key.color) {
            // Use the scale degree color
            if (key.isBlack) {
              keyStyle.backgroundColor = key.color;
              keyStyle.opacity = key.isInChord ? 1 : 0.8;
            } else {
              keyStyle.backgroundColor = key.color;
              keyStyle.opacity = key.isInChord ? 0.9 : 0.6;
            }
          }

          return (
            <div
              key={key.fullNoteName}
              className={`piano-key ${key.isBlack ? 'black-key' : 'white-key'} 
                ${key.isInScale ? 'in-scale' : ''} 
                ${key.isInChord ? 'in-chord' : ''}`}
              style={keyStyle}
              onClick={() => playNote(key.note, key.octave)}
              title={`${key.note}${key.octave}${key.isInScale ? ` - Degree ${key.degree}` : ''}${key.isInChord ? ' (in chord)' : ''}`}
            >
              <div className="note-label">
                {showScaleDegrees && key.isInScale ? key.degree : (key.isInScale || key.isRoot ? key.note : '')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

PianoKeyboard.propTypes = {
  rootNote: PropTypes.string.isRequired,
  selectedScale: PropTypes.object.isRequired,
  showScaleDegrees: PropTypes.bool,
  instrumentConfig: PropTypes.object.isRequired,
  selectedChord: PropTypes.array,
};

export default PianoKeyboard;
