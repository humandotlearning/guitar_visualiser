import React from 'react';
import PropTypes from 'prop-types';
import { getScaleNotes } from '../utils/musicTheory';
import * as SoundfontAudio from '../utils/soundfontAudioUtils';
import './PianoKeyboard.css';

const PianoKeyboard = ({ rootNote, selectedScale, showScaleDegrees, instrumentConfig }) => {
  const { startOctave, endOctave } = instrumentConfig;
  const scaleNotes = getScaleNotes(rootNote, selectedScale);

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

      keys.push({
        note: noteName,
        octave,
        fullNoteName,
        isBlack,
        isInScale,
        isRoot,
        degree: isInScale ? scaleIndex + 1 : null
      });
    });
  }

  const playNote = (note, octave) => {
    SoundfontAudio.playNote(note, null, octave);
  };

  return (
    <div className="piano-container">
      <div className="piano-keys">
        {keys.map((key) => (
          <div
            key={key.fullNoteName}
            className={`piano-key ${key.isBlack ? 'black-key' : 'white-key'} 
              ${key.isInScale ? 'in-scale' : ''} 
              ${key.isRoot ? 'root-note' : ''}`}
            onClick={() => playNote(key.note, key.octave)}
            title={`${key.note}${key.octave}${key.isInScale ? ` - ${key.degree}` : ''}`}
          >
            <div className="note-label">
              {showScaleDegrees && key.isInScale ? key.degree : (key.isInScale || key.isRoot ? key.note : '')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

PianoKeyboard.propTypes = {
  rootNote: PropTypes.string.isRequired,
  selectedScale: PropTypes.object.isRequired,
  showScaleDegrees: PropTypes.bool,
  instrumentConfig: PropTypes.object.isRequired,
};

export default PianoKeyboard;
